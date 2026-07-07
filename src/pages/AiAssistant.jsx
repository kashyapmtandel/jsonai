import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import ActionBar from '../components/ActionBar';
import TabGroup from '../components/TabGroup';
import {
  Sparkles, Trash2, Send, KeyRound, ChevronDown, ChevronUp,
  Eye, EyeOff, Download, Wand2, BookOpen, FileJson,
  Wrench, Shuffle, ExternalLink, Lock, Database, ShieldCheck
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { callGemini, callOpenAI } from '../utils/ai';
import './AiAssistant.css';

// ─── Modes ────────────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'generate',
    label: 'Generate',
    icon: Wand2,
    desc: 'Describe what JSON you need in plain language and the AI will create it.',
    inputLabel: 'Prompt',
    placeholder: 'Describe the JSON you need...\n\nExamples:\n• A user profile with name, email, address, and social links\n• An API response for a weather service with 5-day forecast\n• A shopping cart with 3 items including prices and quantities\n• Product catalog with 5 items, categories, and pricing',
    useTextarea: true,
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: BookOpen,
    desc: 'Paste JSON and get a clear, human-readable explanation of its structure.',
    inputLabel: 'JSON to Explain',
    placeholder: 'Paste JSON here to get an explanation...',
    useTextarea: false,
  },
  {
    id: 'schema',
    label: 'Schema',
    icon: FileJson,
    desc: 'Generate a valid JSON Schema (Draft 2020-12) from your JSON data.',
    inputLabel: 'JSON Data',
    placeholder: 'Paste JSON here to generate a schema...',
    useTextarea: false,
  },
  {
    id: 'fix',
    label: 'Fix',
    icon: Wrench,
    desc: 'Paste broken or malformed JSON and the AI will repair and explain what was wrong.',
    inputLabel: 'Broken JSON',
    placeholder: 'Paste your broken or malformed JSON here...',
    useTextarea: false,
  },
  {
    id: 'transform',
    label: 'Transform',
    icon: Shuffle,
    desc: 'Describe how to reshape or transform your JSON — filter fields, rename keys, flatten arrays, etc.',
    inputLabel: 'JSON + Instructions',
    placeholder: 'Paste your JSON, then describe the transformation:\n\nExample:\n{\n  "users": [...]\n}\n\nPlease extract only the id and email fields from each user.',
    useTextarea: false,
  },
  {
    id: 'mock',
    label: 'Mock',
    icon: Database,
    desc: 'Generate realistic mock data arrays based on a schema or structural description.',
    inputLabel: 'Schema or Description',
    placeholder: 'Paste a JSON Schema, or describe the structure to generate mock data:\n\nExample:\nGenerate 20 records of users with id, full_name, email, and phone_number.',
    useTextarea: true,
  },
  {
    id: 'anonymize',
    label: 'Anonymize',
    icon: ShieldCheck,
    desc: 'Sanitize production JSON by automatically redacting PII (names, emails, IPs, etc.) and replacing it with fake data.',
    inputLabel: 'Production JSON',
    placeholder: 'Paste your production JSON here to anonymize it...',
    useTextarea: false,
  },
];

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', keyUrl: 'https://aistudio.google.com/apikey', keyHint: 'AIza...' },
  { id: 'openai', label: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', keyHint: 'sk-...' },
];

// ─── Quick prompt chips per mode ─────────────────────────────────────────────
const QUICK_PROMPTS = {
  generate: [
    'A list of 5 users with id, name, email, role, and createdAt',
    'A REST API response for a product with variants and pricing',
    'A 5-day weather forecast with temperature, humidity, and conditions',
    'A nested menu structure with categories and sub-items',
    'A pagination wrapper with data, total, page, and perPage',
  ],
  explain: [],
  schema: [],
  fix: [],
  transform: [
    'Extract only id and name from each item',
    'Flatten the nested address into top-level fields',
    'Rename "userId" to "id" and "userName" to "name"',
    'Group items by category',
  ],
  mock: [
    'Generate 15 users with realistic names, emails, and avatars',
    'Generate 10 eCommerce products with variants and SKUs',
  ],
  anonymize: [
    'Redact all names, emails, and phone numbers',
    'Replace all IP addresses and location data with fake values',
  ],
};

// ─── System prompts ───────────────────────────────────────────────────────────
const getSystemPrompt = (mode) => {
  switch (mode) {
    case 'generate':
      return 'You are a JSON generator. The user will describe what JSON they need. Respond with ONLY valid, well-structured JSON — no explanations, no markdown code fences, no surrounding text. Make it realistic and complete.';
    case 'explain':
      return 'You are a JSON explainer. The user will paste JSON. Explain its structure, keys, data types, and purpose in clear, concise bullet points. Use plain language a junior developer can understand.';
    case 'schema':
      return 'You are a JSON Schema expert. The user will paste JSON. Respond with ONLY a valid JSON Schema (Draft 2020-12) describing the data. Include types, required fields, descriptions, and format hints where applicable. No explanations — just the schema JSON.';
    case 'fix':
      return 'You are a JSON repair expert. The user will paste broken JSON. First output the repaired, valid JSON, then on a new line starting with "---EXPLANATION---", briefly explain what was wrong and what you fixed. Keep the explanation concise.';
    case 'transform':
      return 'You are a JSON transformation expert. The user will paste JSON followed by transformation instructions. Apply the described transformation and respond with ONLY the resulting valid JSON — no explanations, no markdown fences.';
    case 'mock':
      return 'You are a mock data generator. The user will provide a schema or description. You must generate realistic, high-quality mock data matching the request. Respond with ONLY valid, well-structured JSON — no explanations, no markdown fences.';
    case 'anonymize':
      return 'You are a data privacy expert. The user will paste JSON containing sensitive PII (names, emails, phone numbers, IPs, addresses). Redact the PII and replace it with realistic fake data. Keep the structure identical. Respond with ONLY the sanitized JSON — no explanations, no markdown fences.';
    default:
      return '';
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const AiAssistant = () => {
  const [mode, setMode] = useState('generate');
  const [provider, setProvider] = useLocalStorage('ai-provider', 'gemini');
  const [apiKey, setApiKey] = useLocalStorage('ai-api-key', '');
  const [showConfig, setShowConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [explanation, setExplanation] = useState(''); // for fix mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const isConfigured = !!apiKey.trim();
  const currentMode = MODES.find(m => m.id === mode);
  const providerInfo = PROVIDERS.find(p => p.id === provider);
  const quickPrompts = QUICK_PROMPTS[mode] || [];

  // Ctrl+Enter to submit
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [input, apiKey, mode, provider]); // eslint-disable-line

  const handleModeChange = useCallback((id) => {
    setMode(id);
    setOutput('');
    setExplanation('');
    setError('');
  }, []);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setShowConfig(true);
      setError('Please configure your API key above to use the AI Assistant.');
      return;
    }
    if (!input.trim()) {
      setError(mode === 'generate' ? 'Please enter a prompt describing the JSON you want.' : 'Please paste some JSON first.');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    setExplanation('');

    try {
      const systemPrompt = getSystemPrompt(mode);
      let result = provider === 'gemini'
        ? await callGemini(apiKey, systemPrompt, input)
        : await callOpenAI(apiKey, systemPrompt, input);

      // Strip markdown fences
      result = result.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

      // Fix mode: split output and explanation
      if (mode === 'fix' && result.includes('---EXPLANATION---')) {
        const [jsonPart, ...rest] = result.split('---EXPLANATION---');
        const cleanJson = jsonPart.trim();
        try { setOutput(JSON.stringify(JSON.parse(cleanJson), null, 2)); }
        catch { setOutput(cleanJson); }
        setExplanation(rest.join('').trim());
      } else if (mode === 'explain') {
        setOutput(result);
      } else {
        // Try to pretty-print if it looks like JSON
        try { setOutput(JSON.stringify(JSON.parse(result), null, 2)); }
        catch { setOutput(result); }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!output) return;
    const isJson = mode !== 'explain';
    const ext = isJson ? 'json' : 'txt';
    const type = isJson ? 'application/json' : 'text/plain';
    const blob = new Blob([output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ai-output.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const handleClear = useCallback(() => {
    setInput(''); setOutput(''); setExplanation(''); setError('');
  }, []);

  const applyQuickPrompt = (prompt) => {
    setInput(prompt);
    if (currentMode?.useTextarea && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const charCount = input.length;
  const approxTokens = Math.ceil(charCount / 4);

  return (
    <ToolLayout
      title="AI JSON Assistant"
      description="Generate, explain, fix, transform, and schema-ify JSON using Google Gemini or OpenAI."
      icon={Sparkles}
    >
      {/* ── API Config ── */}
      <div className={`ai-config ${isConfigured ? 'ai-config--ready' : 'ai-config--unconfigured'}`}>
        <button className="ai-config-toggle" onClick={() => setShowConfig(!showConfig)}>
          <KeyRound size={15} />
          <span>
            {isConfigured
              ? `${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} — API key configured`
              : 'Configure API Key to get started'}
          </span>
          <span className={`ai-config-dot ${isConfigured ? 'ai-config-dot--on' : ''}`} />
          {showConfig ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showConfig && (
          <div className="ai-config-panel">
            <div className="ai-config-grid">
              {/* Provider column */}
              <div className="ai-config-col">
                <label className="ai-config-label">Provider</label>
                <TabGroup
                  items={PROVIDERS.map(p => ({ id: p.id, label: p.label }))}
                  activeId={provider}
                  onChange={setProvider}
                  variant="pill"
                  className="ai-provider-tabs"
                />
              </div>

              {/* API Key column */}
              <div className="ai-config-col">
                <label className="ai-config-label">
                  API Key
                  <a
                    href={providerInfo?.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ai-get-key-link"
                  >
                    Get {provider === 'gemini' ? 'Gemini' : 'OpenAI'} key <ExternalLink size={11} />
                  </a>
                </label>
                <div className="ai-key-input-wrap">
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="ai-key-input"
                    placeholder={providerInfo?.keyHint ?? 'Enter API key...'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    className="ai-key-eye-btn"
                    onClick={() => setShowKey(!showKey)}
                    title={showKey ? 'Hide key' : 'Show key'}
                    type="button"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="ai-config-note">
              <Lock size={11} /> Your key is stored only in your browser's localStorage — never sent to our servers.
            </p>
          </div>
        )}
      </div>

      {/* ── Mode tabs ── */}
      <TabGroup
        items={MODES.map(m => ({ id: m.id, label: m.label, icon: m.icon }))}
        activeId={mode}
        onChange={handleModeChange}
        variant="underline"
        className="ai-mode-tabs"
      />
      <p className="ai-mode-desc">{currentMode?.desc}</p>

      {/* ── Setup card (only when not configured) ── */}
      {!isConfigured && (
        <div className="ai-setup-card">
          <Sparkles size={36} />
          <h3>Connect your AI provider</h3>
          <p>Add your API key above to unlock JSON generation, explanation, schema creation, fixing, and transformation — powered by Gemini or GPT.</p>
          <div className="ai-setup-links">
            <a className="btn btn-secondary" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              Get Gemini API Key <ExternalLink size={13} />
            </a>
            <a className="btn btn-ghost" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              Get OpenAI API Key <ExternalLink size={13} />
            </a>
          </div>
        </div>
      )}

      {/* ── ActionBar ── */}
      <ActionBar>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          title="Submit (Ctrl+Enter)"
        >
          {loading ? (
            <><span className="ai-spinner" /> Generating...</>
          ) : (
            <><Send size={15} /> {currentMode?.label}</>
          )}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={15} /> Clear
        </button>
        <CopyButton text={output} />
        <button className="btn btn-ghost" onClick={handleDownload} disabled={!output}>
          <Download size={15} /> Download
        </button>
        <span className="ai-token-hint">
          <kbd>Ctrl</kbd><span className="ai-token-plus">+</span><kbd>Enter</kbd>
          {charCount > 0 && <span className="ai-token-count">· ~{approxTokens} tokens</span>}
        </span>
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      {/* ── Quick prompts ── */}
      {quickPrompts.length > 0 && !output && (
        <div className="ai-quick-prompts">
          <span className="ai-quick-label">Try:</span>
          <div className="ai-quick-scroll">
            {quickPrompts.map((p, i) => (
              <button key={i} className="ai-quick-chip" onClick={() => applyQuickPrompt(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Two panels ── */}
      <div className="ai-panels">
        {/* Input */}
        <div className="panel">
          <div className="panel-header">
            <span>{currentMode?.inputLabel ?? 'Input'}</span>
            {charCount > 0 && (
              <span className="ai-char-count">{charCount.toLocaleString()} chars</span>
            )}
          </div>
          {currentMode?.useTextarea ? (
            <textarea
              ref={textareaRef}
              className="ai-prompt-textarea"
              placeholder={currentMode.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={18}
            />
          ) : (
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder={currentMode?.placeholder ?? 'Paste JSON here...'}
              height="430px"
            />
          )}
        </div>

        {/* Output */}
        <div className="panel">
          <div className="panel-header">
            <span>Output</span>
            {output && <span className="ai-char-count">{output.length.toLocaleString()} chars</span>}
          </div>
          {loading ? (
            <div className="ai-loading">
              <div className="ai-loading-label"><span className="ai-spinner ai-spinner--dark" /> Thinking...</div>
              <div className="ai-shimmer-line" style={{ marginTop: '1rem' }} />
              <div className="ai-shimmer-line short" />
              <div className="ai-shimmer-line" />
              <div className="ai-shimmer-line medium" />
              <div className="ai-shimmer-line short" />
              <div className="ai-shimmer-line" />
            </div>
          ) : !output ? (
            <div className="ai-output-empty">
              <Sparkles size={28} strokeWidth={1.3} />
              <p>Your AI-generated output will appear here</p>
            </div>
          ) : mode === 'explain' ? (
            <div className="ai-explanation">{output}</div>
          ) : (
            <CodeEditor
              value={output}
              readOnly
              placeholder="AI output will appear here..."
              height="430px"
            />
          )}

          {/* Fix mode explanation */}
          {mode === 'fix' && explanation && (
            <div className="ai-fix-explanation">
              <div className="ai-fix-explanation-label">What was fixed</div>
              <p>{explanation}</p>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title="AI JSON Generator, Explainer & Assistant — Free Online"
        description={[
          'The AI JSON Assistant uses Google Gemini and OpenAI to generate, explain, fix, transform, and schema-ify JSON in seconds. Describe what you need in plain English — the AI writes the JSON for you.',
          'Your API key is stored only in your browser. Nothing is sent to our servers. Use it to create mock data, debug malformed API responses, generate JSON Schemas, or reshape complex JSON structures.',
        ]}
        features={[
          { title: 'Generate JSON', desc: 'Describe any data structure in plain English and get perfectly formatted, realistic JSON in seconds.' },
          { title: 'Explain JSON', desc: 'Paste any JSON payload and get a clear, human-readable explanation of its structure and purpose.' },
          { title: 'Generate Schema', desc: 'Automatically create a valid JSON Schema (Draft 2020-12) from any JSON sample.' },
          { title: 'Fix Broken JSON', desc: 'Paste malformed JSON and the AI will repair it and explain exactly what was wrong.' },
          { title: 'Transform JSON', desc: 'Describe how to reshape your JSON — filter fields, rename keys, flatten arrays — and get the result instantly.' },
          { title: 'Mock Data Generator', desc: 'Paste a JSON Schema or describe a structure to instantly generate dozens of realistic mock records for testing.' },
          { title: 'PII Anonymizer', desc: 'Sanitize production payloads safely. AI automatically detects and redacts names, emails, and IPs, replacing them with fake data.' },
          { title: '100% Private', desc: 'Your API key and JSON data are never sent to our servers. Everything runs directly between your browser and the AI provider.' },
        ]}
        faq={[
          { q: 'Is this tool free?', a: 'The tool itself is free. You need your own API key from Google AI Studio (Gemini) or OpenAI, both of which have free tiers or very low costs.' },
          { q: 'Is my API key safe?', a: 'Yes. Your API key is stored only in your browser\'s localStorage and never sent to our servers. Requests go directly from your browser to the AI provider.' },
          { q: 'Which provider should I use?', a: 'Google Gemini Flash is fast and has a generous free tier. OpenAI GPT-4o-mini is slightly more accurate for complex schemas. Both work well for JSON tasks.' },
          { q: 'What is the Fix mode?', a: 'Fix mode sends your broken JSON to the AI which repairs it (trailing commas, single quotes, malformed structure) and explains what was wrong in plain English.' },
        ]}
      />
    </ToolLayout>
  );
};

export default AiAssistant;
