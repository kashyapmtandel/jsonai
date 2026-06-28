import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import ActionBar from '../components/ActionBar';
import CodeEditor from '../components/CodeEditor';
import TabGroup from '../components/TabGroup';
import { BotMessageSquare, Trash2, Send, Key, ChevronDown, ChevronUp, Eye, EyeOff, Zap, Hash, Sparkles } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { callGemini, callOpenAI } from '../utils/ai';
import './AiAssistant.css';
import './PromptBuilder.css';

const estimateTokens = (str) => Math.ceil((str || '').length / 4);

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI' },
];

const SYSTEM_PROMPT = `You are an expert AI prompt compression engineer. Your job is to convert a verbose natural language prompt into the most compact, token-efficient JSON prompt that preserves 100% of the semantic meaning.

Rules:
1. Use short but clear key names (e.g. "role" not "your_assigned_role", "task" not "your_primary_task").
2. Use arrays for lists, nested objects for grouped concepts.
3. Remove filler phrases ("please", "make sure to", "I want you to", etc.).
4. Use abbreviations only when unambiguous (e.g. "lang" for language, "fmt" for format, "ctx" for context).
5. Preserve all critical instructions — do not drop any meaningful constraint.
6. Output ONLY the raw JSON object. No markdown fences, no explanation, no comments.`;

const SAMPLES = [
  {
    label: 'Customer Support Agent',
    text: `You are a friendly and professional customer support agent for a SaaS company called TechFlow. Your primary job is to help users resolve technical issues, answer billing questions, and escalate complex problems to the engineering team when necessary. Always be polite, empathetic, and concise in your responses. Avoid using jargon unless the user demonstrates technical knowledge. When you don't know an answer, say so honestly and offer to connect the user with a specialist.`,
  },
  {
    label: 'Code Reviewer',
    text: `You are an expert senior software engineer conducting a thorough code review. Please analyze the provided code carefully and identify any bugs, security vulnerabilities, performance issues, or violations of best practices. Provide specific, actionable feedback for each issue you find. For each issue, explain why it is a problem and suggest a concrete fix. Organize your feedback by severity: Critical, Major, and Minor. Focus on correctness and maintainability above all else.`,
  },
  {
    label: 'Data Extraction',
    text: `You will be given raw, unstructured text from various sources. Your task is to extract all relevant entities and structured information from the text and return them in a clean JSON format. You must extract: person names, company names, dates, monetary amounts, locations, and any other notable entities. If a field is not present in the text, use null. Always return valid, parseable JSON. Do not include any explanation or commentary outside of the JSON object.`,
  },
];

export default function PromptBuilder() {
  const [provider, setProvider] = useLocalStorage('ai-provider', 'gemini');
  const [apiKey, setApiKey] = useLocalStorage('ai-api-key', '');
  const [showConfig, setShowConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfigured = !!apiKey;

  const inputTokens = estimateTokens(input);
  const outputTokens = estimateTokens(output);
  const savedTokens = inputTokens - outputTokens;
  const savedPct = inputTokens > 0 && outputTokens > 0
    ? ((savedTokens / inputTokens) * 100).toFixed(1)
    : null;

  const handleConvert = async () => {
    if (!apiKey) { setShowConfig(true); setError('Please configure your API key above.'); return; }
    if (!input.trim()) { setError('Please enter a prompt to compress.'); return; }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      let result;
      if (provider === 'gemini') {
        result = await callGemini(apiKey, SYSTEM_PROMPT, input);
      } else {
        result = await callOpenAI(apiKey, SYSTEM_PROMPT, input);
      }
      // Strip markdown fences if the model ignores instructions
      result = result.replace(/^```[a-z]*\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      // Validate it's actually JSON
      JSON.parse(result);
      setOutput(result);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError('The AI returned an invalid JSON response. Try again or switch providers.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSample = (sample) => {
    setInput(sample.text);
    setOutput('');
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout
      title="JSON Prompt Builder"
      description="Convert verbose AI prompts into compact JSON format to slash token usage with GPT-4, Claude, and Gemini."
      icon={BotMessageSquare}
    >
      {/* API Config */}
      <div className="ai-config">
        <button className="ai-config-toggle" onClick={() => setShowConfig(!showConfig)}>
          <Key size={16} />
          <span>{isConfigured ? `API Key configured (${provider === 'gemini' ? 'Gemini' : 'OpenAI'})` : 'Configure API Key'}</span>
          <span className={`ai-config-status ${isConfigured ? 'configured' : ''}`}>
            <span className="ai-config-dot" aria-hidden="true" />
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
              Your API key is stored only in your browser&apos;s localStorage. It is never sent to our servers.
            </p>
          </div>
        )}
      </div>

      {/* Prominent Get Key card — shown only when not configured */}
      {!isConfigured && (
        <div className="ai-setup-card">
          <Sparkles size={32} />
          <h3>Get a free API key to start compressing prompts</h3>
          <p>This tool uses AI to semantically compress your prompts. It takes less than 2 minutes to get a free key.</p>
          <div className="ai-setup-links">
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Key size={15} /> Get Gemini API Key (Free)
            </a>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <Key size={15} /> Get OpenAI API Key
            </a>
          </div>
        </div>
      )}

      {/* Sample prompts */}
      <div className="pb-samples">
        <span className="pb-samples-label"><Sparkles size={14} /> Try a sample:</span>
        {SAMPLES.map((s) => (
          <button key={s.label} className="pb-sample-chip" onClick={() => handleSample(s)}>
            {s.label}
          </button>
        ))}
      </div>

      <ActionBar>
        <button className="btn btn-primary" onClick={handleConvert} disabled={loading}>
          {loading ? <><span className="ai-spinner" /> Compressing...</> : <><Send size={16} /> Convert to JSON Prompt</>}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats bar */}
      {output && (
        <div className="pb-stats">
          <div className="pb-stat">
            <Hash size={14} />
            <span>Original: <strong>{inputTokens.toLocaleString()} tokens</strong></span>
          </div>
          <div className="pb-stat">
            <Zap size={14} />
            <span>Compressed: <strong>{outputTokens.toLocaleString()} tokens</strong></span>
          </div>
          {savedPct && (
            <div className="pb-stat pb-stat--saved">
              <span><strong>{savedPct}% fewer tokens</strong> - saved {savedTokens.toLocaleString()} tokens</span>
            </div>
          )}
        </div>
      )}

      {/* Editor panels */}
      <div className="pb-panels">
        <div className="panel">
          <div className="panel-header">Verbose Natural Language Prompt</div>
          <textarea
            className="pb-textarea"
            placeholder="Paste your verbose system prompt or instruction here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="pb-char-count">{inputTokens.toLocaleString()} est. tokens</div>
        </div>

        <div className="panel">
          <div className="panel-header">Compact JSON Prompt</div>
          {loading ? (
            <div className="ai-loading">
              <div className="ai-shimmer-line" />
              <div className="ai-shimmer-line short" />
              <div className="ai-shimmer-line medium" />
              <div className="ai-shimmer-line" />
              <div className="ai-shimmer-line short" />
            </div>
          ) : (
            <>
              <CodeEditor
                value={output}
                readOnly
                language="json"
                placeholder="Your compact JSON prompt will appear here..."
                height="340px"
              />
              {output && <div className="pb-char-count">{outputTokens.toLocaleString()} est. tokens</div>}
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="pb-how-it-works">
        <h3>How JSON Prompting Works</h3>
        <div className="pb-steps">
          <div className="pb-step">
            <div className="pb-step-num">1</div>
            <div>
              <strong>Write your prompt normally</strong>
              <p>Start with your existing verbose system prompt or instruction set.</p>
            </div>
          </div>
          <div className="pb-step">
            <div className="pb-step-num">2</div>
            <div>
              <strong>AI compresses it to JSON</strong>
              <p>The AI extracts all semantic meaning and represents it as a compact, structured JSON object with short key names.</p>
            </div>
          </div>
          <div className="pb-step">
            <div className="pb-step-num">3</div>
            <div>
              <strong>Use it as your system prompt</strong>
              <p>Paste the JSON output as your system message. LLMs parse structured JSON instructions with equal or better accuracy than prose.</p>
            </div>
          </div>
        </div>
      </div>

      <SeoContent
        title="JSON Prompt Builder — Compress AI Prompts & Save Tokens"
        description={[
          "Every token in your system prompt costs money across thousands of API calls. Our JSON Prompt Builder uses AI to convert verbose natural language instructions into ultra-compact JSON representations, typically reducing token usage by 50–75%.",
          "LLMs like GPT-4, Claude, and Gemini are fully capable of following JSON-structured instructions with the same or better accuracy than prose, making this a powerful technique for production AI applications."
        ]}
        features={[
          { title: "AI-Powered Compression", desc: "Not a simple regex replacement — our tool uses an LLM to semantically understand and restructure your prompt while preserving every constraint and instruction." },
          { title: "Real Token Savings", desc: "See exact before/after token estimates. In production with thousands of daily calls, a 60% prompt reduction can mean hundreds of dollars saved per month." },
          { title: "Drop-in Compatible", desc: "The output JSON works directly as a system message in any OpenAI, Anthropic, or Google AI API call. No extra parsing or integration needed." }
        ]}
        faq={[
          { q: "Do LLMs really understand JSON prompts as well as natural language?", a: "Yes. Modern LLMs (GPT-4, Claude 3, Gemini 1.5) are trained on enormous amounts of JSON data and follow structured instructions reliably. In many cases, JSON prompts are more precise because they eliminate ambiguity." },
          { q: "How much can I realistically save?", a: "System prompts are sent with every single API request. A 200-token prompt reduction at $5/1M tokens with 100,000 daily requests = $100 saved per day. At scale, this is extremely significant." },
          { q: "Will this work for all types of prompts?", a: "It works best for instruction-heavy system prompts. Creative or emotional context (e.g. 'be warm and empathetic') may compress less than technical instructions, but all prompts benefit from some reduction." }
        ]}
      />
    </ToolLayout>
  );
}
