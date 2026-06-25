import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import ActionBar from '../components/ActionBar';
import { Sparkles, Trash2, Send, Key, ChevronDown, ChevronUp, Eye, EyeOff, Code2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { callGemini, callOpenAI } from '../utils/ai';
import './TypeGenerator.css';

const LANGUAGES = [
  { id: 'typescript', label: 'TypeScript Interfaces', ext: 'typescript' },
  { id: 'zod', label: 'Zod Schema', ext: 'typescript' },
  { id: 'pydantic', label: 'Python Pydantic', ext: 'python' },
  { id: 'go', label: 'Go Structs', ext: 'go' },
  { id: 'rust', label: 'Rust Structs', ext: 'rust' },
  { id: 'php', label: 'PHP Classes', ext: 'php' }
];

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI' },
];

const getSystemPrompt = (langId) => {
  const base = "You are an expert software engineer. The user will provide a JSON payload. You must generate production-ready type definitions or validation schemas for that JSON. Analyze the JSON carefully to infer precise types, unions, and enums where obvious. Output ONLY the raw code. No markdown fences (e.g. ```typescript), no explanations, no pleasantries. Just the pure code.";
  
  switch(langId) {
    case 'typescript': return `${base} Output strict TypeScript interfaces. Include JSDoc comments for fields if helpful.`;
    case 'zod': return `${base} Output a Zod schema definition for TypeScript. Import { z } from 'zod' at the top.`;
    case 'pydantic': return `${base} Output Python Pydantic models. Use BaseModel from pydantic. Include typing hints.`;
    case 'go': return `${base} Output Go structs. Include json struct tags (e.g. \`json:"fieldName"\`).`;
    case 'rust': return `${base} Output Rust structs. Include #[derive(Serialize, Deserialize)] macros from serde.`;
    case 'php': return `${base} Output strict PHP 8.2+ classes with typed properties. Add json_decode helpers or #[MapFrom] attributes if appropriate.`;
    default: return base;
  }
}

export default function TypeGenerator() {
  const [lang, setLang] = useState('typescript');
  const [provider, setProvider] = useLocalStorage('ai-provider', 'gemini');
  const [apiKey, setApiKey] = useLocalStorage('ai-api-key', '');
  
  const [showConfig, setShowConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfigured = !!apiKey;
  const currentLang = LANGUAGES.find(l => l.id === lang) || LANGUAGES[0];

  const handleSubmit = async () => {
    if (!apiKey) {
      setShowConfig(true);
      setError('Please configure your API key above to use the generator.');
      return;
    }
    
    // Quick validation to see if they provided valid JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(input);
    } catch {
      setError('Please provide valid JSON as input.');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const systemPrompt = getSystemPrompt(lang);
      // Minify JSON to save tokens, though stringifying is fine
      const payloadString = JSON.stringify(parsedJson);
      
      let result;
      if (provider === 'gemini') {
        result = await callGemini(apiKey, systemPrompt, payloadString);
      } else {
        result = await callOpenAI(apiKey, systemPrompt, payloadString);
      }
      
      // Strip markdown code fences if the AI ignores instructions
      result = result.replace(/^```[a-z]*\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      setOutput(result.trim());
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout
      title="AI Type & Validation Generator"
      description="Instantly convert JSON into production-ready TypeScript, Zod, Python, Go, Rust, and PHP definitions."
      icon={Code2}
    >
      {/* API Config - Reused from AiAssistant design */}
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
              <div className="ai-provider-tabs">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    className={`ai-provider-tab ${provider === p.id ? 'active' : ''}`}
                    onClick={() => setProvider(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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

      <div className="typegen-lang-tabs">
        {LANGUAGES.map(l => (
          <button 
            key={l.id} 
            className={`typegen-lang-tab ${lang === l.id ? 'active' : ''}`}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {!isConfigured && (
        <div className="ai-setup-card">
          <Sparkles size={32} />
          <h3>Configure your AI provider</h3>
          <p>To generate types, you&apos;ll need an API key from Google Gemini or OpenAI. Click &quot;Configure API Key&quot; above to get started.</p>
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
            <><Send size={16} /> Generate {currentLang.label}</>
          )}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="typegen-panels">
        <div className="panel">
          <div className="panel-header">Input JSON</div>
          <CodeEditor 
            value={input} 
            onChange={setInput} 
            language="json" 
            placeholder="Paste your JSON payload here..." 
            height="500px" 
          />
        </div>
        <div className="panel">
          <div className="panel-header">Generated {currentLang.label}</div>
          {loading ? (
             <div className="ai-loading">
               <div className="ai-shimmer-line" />
               <div className="ai-shimmer-line short" />
               <div className="ai-shimmer-line medium" />
               <div className="ai-shimmer-line" />
             </div>
          ) : (
            <CodeEditor 
              value={output} 
              readOnly 
              language={currentLang.ext} 
              placeholder={`Generated ${currentLang.label} will appear here...`} 
              height="500px" 
            />
          )}
        </div>
      </div>

      <SeoContent 
        title={`Convert JSON to ${currentLang.label} using AI`}
        description={[
          "Stop writing manual type definitions. Use advanced AI to instantly convert unstructured JSON payloads into strict, production-ready code.",
          "Our generator uses context-aware models to infer accurate Enums, deeply nested unions, and edge-case types, outputting perfect TypeScript, Zod, Pydantic, Go, Rust, and PHP."
        ]}
        features={[
          { title: "Smart Inference", desc: "Unlike standard converters, AI understands context. It infers enum values and strict types rather than defaulting to 'string'." },
          { title: "Multiple Languages", desc: "Instantly generate TypeScript Interfaces, Zod Schemas, Python Pydantic models, Go structs, Rust structs, and PHP classes." },
          { title: "Privacy First", desc: "Your data never leaves your browser. API calls are made directly from your machine using your own key." }
        ]}
        faq={[
          { q: "Why use AI instead of a standard JSON to TypeScript converter?", a: "Standard converters are dumb; they map keys to string/number blindly. AI understands what the data actually represents, generating highly specific types, adding JSDoc comments, and recognizing patterns like ISO timestamps or UUIDs." },
          { q: "Can I generate Zod or Pydantic schemas?", a: "Yes! AI is fantastic at writing validation schemas because it understands runtime validation constraints based on the sample data you provide." }
        ]}
      />
    </ToolLayout>
  );
}
