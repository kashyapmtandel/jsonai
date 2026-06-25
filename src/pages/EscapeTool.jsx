import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { Lock, Unlock, Trash2, FileText } from 'lucide-react';
import { escapeJson, unescapeJson, stringifyJsonString, parseJsonString } from '../utils/jsonEscape';
import './EscapeTool.css';

const EscapeTool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEscape = () => {
    try {
      setOutput(escapeJson(input));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUnescape = () => {
    try {
      setOutput(unescapeJson(input));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleStringify = () => {
    try {
      setOutput(stringifyJsonString(input));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleParse = () => {
    try {
      setOutput(parseJsonString(input));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const sampleEscapeInput = `This has "quotes" and
newlines and	tabs
plus a backslash: \\`;

  return (
    <ToolLayout
      title="JSON Escape / Unescape"
      description="Escape and unescape JSON strings for safe embedding in code or data."
      icon={Lock}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleEscape}>
          <Lock size={16} /> Escape
        </button>
        <button className="btn btn-secondary" onClick={handleUnescape}>
          <Unlock size={16} /> Unescape
        </button>
        <button className="btn btn-secondary" onClick={handleStringify}>
          Stringify
        </button>
        <button className="btn btn-secondary" onClick={handleParse}>
          Parse String
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(sampleEscapeInput); setError(''); }}>
          <FileText size={16} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="escape-panels">
        <div className="panel">
          <div className="panel-header">Input</div>
          <CodeEditor value={input} onChange={setInput} placeholder="Paste text to escape or unescape..." height="400px" />
        </div>
        <div className="panel">
          <div className="panel-header">Output</div>
          <CodeEditor value={output} readOnly placeholder="Result will appear here..." height="400px" />
        </div>
      </div>

      <SeoContent 
        title="Free JSON String Escaper & Unescaper"
        description={[
          "Embedding JSON payloads inside other JSON strings, SQL databases, or bash scripts often requires escaping quotation marks and special characters. Our Free JSON Escape tool handles this tedious process instantly.",
          "Simply paste your JSON string and convert it into a perfectly escaped, flat string representation, or vice versa, completely securely inside your browser."
        ]}
        features={[
          { title: "Escape to String", desc: "Transforms a standard JSON object into a flat string by escaping all internal double quotes with backslashes." },
          { title: "Unescape (Parse)", desc: "Takes a messy, backslash-escaped string and parses it back into a clean, hierarchical JSON object." },
          { title: "Zero Data Leakage", desc: "We never send your sensitive SQL payloads or API secrets to a server. Everything happens locally." }
        ]}
        faq={[
          { q: "Why do I need to escape JSON?", a: "If you want to send a JSON object as a single string value inside another JSON request, the internal quotation marks will break the outer JSON structure. You must 'escape' them with backslashes." },
          { q: "Can it handle double-escaped JSON?", a: "Yes, you can run the unescape function multiple times if you are dealing with deeply nested, double-escaped database dumps." }
        ]}
      />
    </ToolLayout>
  );
};

export default EscapeTool;
