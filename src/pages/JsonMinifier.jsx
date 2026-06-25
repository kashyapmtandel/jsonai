import { useState, useCallback } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import ActionBar from '../components/ActionBar';
import { Minimize2, Trash2, Zap, DollarSign, Hash } from 'lucide-react';
import './JsonMinifier.css';

// Simple but accurate token estimation (~4 chars per token is industry standard)
const estimateTokens = (str) => Math.ceil(str.length / 4);

const LLM_MODELS = [
  { name: 'GPT-4o',            provider: 'OpenAI',  color: '#10a37f', pricePerM: 5.00 },
  { name: 'GPT-4o mini',       provider: 'OpenAI',  color: '#10a37f', pricePerM: 0.15 },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: '#d97706', pricePerM: 3.00 },
  { name: 'Claude 3 Haiku',    provider: 'Anthropic', color: '#d97706', pricePerM: 0.25 },
  { name: 'Gemini 1.5 Pro',    provider: 'Google',  color: '#4285f4', pricePerM: 3.50 },
  { name: 'Gemini 1.5 Flash',  provider: 'Google',  color: '#4285f4', pricePerM: 0.075 },
];

const SAMPLE_JSON = `{
  "user": {
    "id": "usr_8f3k2",
    "name": "Kashyap Tandel",
    "email": "kashyap@example.com",
    "role": "admin",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true,
      "timezone": "Asia/Kolkata"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "organization": {
    "id": "org_9d2m1",
    "name": "JSON AI",
    "plan": "pro",
    "members": 12
  }
}`;

export default function JsonMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const minify = useCallback((raw) => {
    if (!raw.trim()) {
      setOutput('');
      setStats(null);
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');

      const beforeTokens = estimateTokens(raw);
      const afterTokens = estimateTokens(minified);
      const savedTokens = beforeTokens - afterTokens;
      const savedPct = ((savedTokens / beforeTokens) * 100).toFixed(1);

      setStats({
        beforeChars: raw.length,
        afterChars: minified.length,
        beforeTokens,
        afterTokens,
        savedTokens,
        savedPct,
      });
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
      setOutput('');
      setStats(null);
    }
  }, []);

  const handleInput = (val) => {
    setInput(val);
    minify(val);
  };

  const handleSample = () => {
    setInput(SAMPLE_JSON);
    minify(SAMPLE_JSON);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStats(null);
    setError('');
  };

  return (
    <ToolLayout
      title="JSON Minifier for LLMs"
      description="Strip whitespace from JSON to save tokens and reduce API costs with GPT-4, Claude, and Gemini."
      icon={Minimize2}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleSample}>
          <Zap size={16} /> Load Sample
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats Dashboard */}
      {stats && (
        <div className="minifier-stats">
          <div className="stat-card">
            <div className="stat-icon"><Hash size={18} /></div>
            <div className="stat-body">
              <div className="stat-label">Tokens Saved</div>
              <div className="stat-value">{stats.savedTokens.toLocaleString()}</div>
              <div className="stat-sub">{stats.beforeTokens.toLocaleString()} → {stats.afterTokens.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card stat-card--highlight">
            <div className="stat-icon"><Zap size={18} /></div>
            <div className="stat-body">
              <div className="stat-label">Token Reduction</div>
              <div className="stat-value">{stats.savedPct}%</div>
              <div className="stat-sub">smaller payload</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Minimize2 size={18} /></div>
            <div className="stat-body">
              <div className="stat-label">Characters Saved</div>
              <div className="stat-value">{(stats.beforeChars - stats.afterChars).toLocaleString()}</div>
              <div className="stat-sub">{stats.beforeChars.toLocaleString()} → {stats.afterChars.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cost savings table */}
      {stats && stats.savedTokens > 0 && (
        <div className="cost-table-wrap">
          <div className="cost-table-header">
            <DollarSign size={16} />
            <span>Estimated API Cost Savings per 1,000 requests</span>
          </div>
          <div className="cost-table">
            {LLM_MODELS.map((m) => {
              const savedCost = ((stats.savedTokens / 1_000_000) * m.pricePerM * 1000);
              const originalCost = ((stats.beforeTokens / 1_000_000) * m.pricePerM * 1000);
              const pct = originalCost > 0 ? ((savedCost / originalCost) * 100).toFixed(0) : 0;
              return (
                <div key={m.name} className="cost-row">
                  <div className="cost-model">
                    <span className="cost-dot" style={{ background: m.color }} />
                    <span className="cost-name">{m.name}</span>
                    <span className="cost-provider">{m.provider}</span>
                  </div>
                  <div className="cost-numbers">
                    <span className="cost-saved">Save ${savedCost.toFixed(4)}</span>
                    <span className="cost-pct">{pct}% cheaper</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="cost-note">
            * Based on input token pricing at {stats.savedPct}% token reduction. Prices as of 2025.
          </p>
        </div>
      )}

      {/* Editor panels */}
      <div className="minifier-panels">
        <div className="panel">
          <div className="panel-header">Input JSON (Formatted)</div>
          <CodeEditor
            value={input}
            onChange={handleInput}
            language="json"
            placeholder="Paste your JSON here... it will be minified instantly."
            height="420px"
          />
        </div>
        <div className="panel">
          <div className="panel-header">Minified Output</div>
          <CodeEditor
            value={output}
            readOnly
            language="json"
            placeholder="Minified JSON will appear here..."
            height="420px"
          />
        </div>
      </div>

      <SeoContent
        title="JSON Minifier — Save LLM Tokens & Reduce API Costs"
        description={[
          "Every whitespace character in your JSON costs real money when calling GPT-4, Claude, or Gemini APIs. Our JSON Minifier strips all unnecessary spaces, newlines, and indentation from your payload, reducing token count by up to 40%.",
          "Designed specifically for developers building AI-powered applications, this tool shows you exactly how many tokens and dollars you save across every major LLM provider."
        ]}
        features={[
          { title: "Instant Token Count", desc: "See your before/after token estimate the moment you paste JSON. No need to call a tokenizer API." },
          { title: "Multi-Model Cost Breakdown", desc: "Compare savings across GPT-4o, Claude 3.5, Gemini 1.5, and more with real pricing data." },
          { title: "Instant Minification", desc: "Zero-latency processing. JSON is minified in your browser as you type." }
        ]}
        faq={[
          { q: "How much can I really save by minifying JSON sent to an LLM?", a: "Typically 20–45% token reduction depending on indentation. For heavily indented JSON with 4-space indents, savings are even larger. Over thousands of API calls, this adds up to significant cost reductions." },
          { q: "Does minifying JSON affect LLM comprehension?", a: "No. LLMs parse JSON semantically, not by whitespace. A minified JSON object is 100% equivalent to a formatted one from the model's perspective." },
          { q: "How accurate is the token estimate?", a: "We use the standard 4-characters-per-token heuristic. For exact counts, use the official tokenizer for your specific model. The estimate is accurate enough for cost comparison purposes." }
        ]}
      />
    </ToolLayout>
  );
}
