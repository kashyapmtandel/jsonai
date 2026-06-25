import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import ActionBar from '../components/ActionBar';
import TabGroup from '../components/TabGroup';
import { Sparkles, Trash2, Send, Key, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { callGemini, callOpenAI } from '../utils/ai';
import './AiAssistant.css';

const MODES = [
  { id: 'generate', label: 'Generate JSON', desc: 'Describe what JSON you need in plain language' },
  { id: 'explain', label: 'Explain JSON', desc: 'Paste JSON and get a human-readable explanation' },
  { id: 'schema', label: 'Suggest Schema', desc: 'Get a JSON Schema suggestion for your data' },
];

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI' },
];

const getSystemPrompt = (mode) => {
  switch (mode) {
    case 'generate':
      return 'You are a JSON generator. The user will describe what JSON they need in natural language. Respond with ONLY valid JSON, no explanations or markdown code fences. Make the JSON realistic and well-structured.';
    case 'explain':
      return 'You are a JSON explainer. The user will paste JSON data. Explain the structure, purpose, and contents in clear, human-readable language. Use bullet points and be concise.';
    case 'schema':
      return 'You are a JSON Schema expert. The user will paste JSON data. Respond with ONLY a valid JSON Schema (draft 2020-12) that describes the data. Include appropriate types, required fields, and format hints. No explanations, just the schema JSON.';
    default:
      return '';
  }
};


const AiAssistant = () => {
  const [mode, setMode] = useState('generate');
  const [provider, setProvider] = useLocalStorage('ai-provider', 'gemini');
  const [apiKey, setApiKey] = useLocalStorage('ai-api-key', '');
  const [showConfig, setShowConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfigured = !!apiKey;

  const handleSubmit = async () => {
    if (!apiKey) {
      setShowConfig(true);
      setError('Please configure your API key above to use the assistant.');
      return;
    }
    if (!input.trim()) {
      setError('Please enter a prompt or JSON data.');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const systemPrompt = getSystemPrompt(mode);
      let result;
      if (provider === 'gemini') {
        result = await callGemini(apiKey, systemPrompt, input);
      } else {
        result = await callOpenAI(apiKey, systemPrompt, input);
      }
      // Clean up markdown code fences if present
      result = result.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      // Try to format if it's JSON
      if (mode !== 'explain') {
        try {
          result = JSON.stringify(JSON.parse(result), null, 2);
        } catch {
          // Not valid JSON, keep as-is
        }
      }
      setOutput(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="AI Assistant"
      description="AI-powered JSON generation, explanation, and schema suggestions."
      icon={Sparkles}
    >
      {/* API Config */}
      <div className="ai-config">
        <button className="ai-config-toggle" onClick={() => setShowConfig(!showConfig)}>
          <Key size={16} />
          <span>{isConfigured ? `API Key configured (${provider === 'gemini' ? 'Gemini' : 'OpenAI'})` : 'Configure API Key'}</span>
          <span className={`ai-config-status ${isConfigured ? 'configured' : ''}`}>
            {isConfigured ? '●' : '○'}
          </span>
          {showConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showConfig && (
          <div className="ai-config-panel">
            <div className="ai-config-row">
              <label>Provider</label>
              <TabGroup
                items={PROVIDERS.map((p) => ({ id: p.id, label: p.label }))}
                activeId={provider}
                onChange={setProvider}
                variant="pill"
                className="ai-provider-tabs"
              />
            </div>
            <div className="ai-config-row">
              <label>API Key</label>
              <div className="ai-key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="ai-key-input"
                  placeholder={provider === 'gemini' ? 'Enter Gemini API key...' : 'Enter OpenAI API key...'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <p className="ai-config-note">
              🔒 Your API key is stored only in your browser&apos;s localStorage. It is never sent to our servers.
            </p>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <TabGroup
        items={MODES}
        activeId={mode}
        onChange={(id) => { setMode(id); setOutput(''); setError(''); }}
        variant="underline"
        className="ai-mode-tabs"
      />

      <p className="ai-mode-desc">{MODES.find((m) => m.id === mode)?.desc}</p>

      {!isConfigured && (
        <div className="ai-setup-card">
          <Sparkles size={32} />
          <h3>Configure your AI provider</h3>
          <p>To use the AI Assistant, you&apos;ll need an API key from Google Gemini or OpenAI. Click the &quot;Configure API Key&quot; button above to get started.</p>
          <div className="ai-setup-links">
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Get Gemini API Key →</a>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get OpenAI API Key →</a>
          </div>
        </div>
      )}

      <ActionBar>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <><span className="ai-spinner" /> Generating...</>
          ) : (
            <><Send size={16} /> {mode === 'generate' ? 'Generate' : mode === 'explain' ? 'Explain' : 'Suggest Schema'}</>
          )}
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="ai-panels">
        <div className="panel">
          <div className="panel-header">{mode === 'generate' ? 'Prompt' : 'Input JSON'}</div>
          {mode === 'generate' ? (
            <textarea
              className="ai-prompt-textarea"
              placeholder="Describe the JSON you want to generate...&#10;&#10;Examples:&#10;• A user profile with name, email, address, and social links&#10;• An API response for a weather service with 5-day forecast&#10;• A shopping cart with 3 items including prices and quantities"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={18}
            />
          ) : (
            <CodeEditor value={input} onChange={setInput} placeholder="Paste JSON to analyze..." height="430px" />
          )}
        </div>
        <div className="panel">
          <div className="panel-header">Output</div>
          {loading ? (
            <div className="ai-loading">
              <div className="ai-shimmer-line" />
              <div className="ai-shimmer-line short" />
              <div className="ai-shimmer-line" />
              <div className="ai-shimmer-line medium" />
              <div className="ai-shimmer-line short" />
            </div>
          ) : mode === 'explain' && output ? (
            <div className="ai-explanation">{output}</div>
          ) : (
            <CodeEditor value={output} readOnly placeholder="AI output will appear here..." height="430px" />
          )}
        </div>
      </div>

      <SeoContent 
        title="AI JSON Generator & Assistant"
        description={[
          "Say goodbye to manually typing out JSON stubs or wrestling with complex structures. Our AI JSON Generator uses advanced models like Google Gemini and OpenAI to write, fix, and explain JSON code for you instantly.",
          "Whether you need mock data for a database, a simulated API response, or help understanding a deeply nested JSON structure, this tool does the heavy lifting for you."
        ]}
        features={[
          { title: "Generate JSON from Text", desc: "Type plain English (e.g., 'A list of 5 users with emails') and our AI will generate perfectly formatted JSON data in seconds." },
          { title: "Explain JSON", desc: "Paste an obscure JSON payload and the AI will summarize its structure, purpose, and data types in plain language." },
          { title: "Suggest Schema", desc: "Automatically generate a valid JSON Schema based on the data you provide to validate future inputs." }
        ]}
        faq={[
          { q: "Is it free?", a: "Yes, our interface is 100% free. You simply need to plug in your own API key from Google AI Studio or OpenAI, which often have free tiers or cost pennies per query." },
          { q: "Is my API key safe?", a: "Absolutely. Your API key is stored exclusively in your browser's local storage. We do not have servers and we cannot see or steal your key." }
        ]}
      />
    </ToolLayout>
  );
};

export default AiAssistant;
