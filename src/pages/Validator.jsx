import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { ShieldCheck, FileText, Trash2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { sampleJson, sampleInvalidJson } from '../utils/sampleData';
import './Validator.css';

const getJsonStats = (text) => {
  try {
    const parsed = JSON.parse(text);
    const bytes = new Blob([text]).size;
    const type = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed;

    const countKeys = (obj) => {
      if (typeof obj !== 'object' || obj === null) return 0;
      let count = 0;
      if (Array.isArray(obj)) {
        obj.forEach((v) => (count += countKeys(v)));
      } else {
        count += Object.keys(obj).length;
        Object.values(obj).forEach((v) => (count += countKeys(v)));
      }
      return count;
    };

    const getDepth = (obj, depth = 0) => {
      if (typeof obj !== 'object' || obj === null) return depth;
      const children = Array.isArray(obj) ? obj : Object.values(obj);
      if (children.length === 0) return depth + 1;
      return Math.max(...children.map((c) => getDepth(c, depth + 1)));
    };

    return {
      type,
      size: bytes,
      keys: countKeys(parsed),
      depth: getDepth(parsed),
    };
  } catch {
    return null;
  }
};

const Validator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);

  const validate = (text) => {
    if (!text || !text.trim()) {
      setResult(null);
      return;
    }
    try {
      JSON.parse(text);
      const stats = getJsonStats(text);
      setResult({ valid: true, stats });
    } catch (e) {
      const match = e.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : null;
      let line = null, column = null;
      if (position !== null) {
        const lines = text.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      setResult({ valid: false, message: e.message, line, column });
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validate(input), 300);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate your JSON with real-time error highlighting and detailed feedback."
      icon={ShieldCheck}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={() => validate(input)}>
          <ShieldCheck size={16} /> Validate
        </button>
        <button className="btn btn-ghost" onClick={() => setInput(sampleJson)}>
          <FileText size={16} /> Valid Sample
        </button>
        <button className="btn btn-ghost" onClick={() => setInput(sampleInvalidJson)}>
          <XCircle size={16} /> Invalid Sample
        </button>
        <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
          <Upload size={16} /> Load File
          <input type="file" accept=".json,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setResult(null); }}>
          <Trash2 size={16} /> Clear
        </button>
      </ActionBar>

      <CodeEditor value={input} onChange={setInput} placeholder="Paste your JSON here to validate..." height="450px" />

      {result && (
        <div className={`validation-result ${result.valid ? 'result-success' : 'result-error'}`}>
          {result.valid ? (
            <>
              <div className="result-header">
                <CheckCircle size={20} />
                <span>Valid JSON</span>
              </div>
              {result.stats && (
                <div className="result-stats">
                  <span>Type: <strong>{result.stats.type}</strong></span>
                  <span>Size: <strong>{result.stats.size} bytes</strong></span>
                  <span>Keys: <strong>{result.stats.keys}</strong></span>
                  <span>Depth: <strong>{result.stats.depth}</strong></span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="result-header">
                <XCircle size={20} />
                <span>Invalid JSON</span>
              </div>
              <p className="result-message">{result.message}</p>
              {result.line && (
                <p className="result-location">
                  Line {result.line}, Column {result.column}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <SeoContent 
        title="JSON Validator and Fixer — Free Online Tool"
        description={[
          "Our Free JSON Validator and Fixer is the most accurate, secure, and developer-friendly tool for detecting syntax errors and structural flaws in your JSON data.",
          "Whether you are working with standard APIs, validating a complex Swagger JSON, or checking an LD JSON snippet for SEO, our tool instantly finds missing commas, unquoted strings, and trailing brackets with pinpoint line-number accuracy."
        ]}
        features={[
          { title: "Universal JSON Validator", desc: "Perfect for validating standard JSON, Swagger JSON configurations, and LD JSON structured data payloads." },
          { title: "Precise Error Tracking", desc: "Unlike standard parsers, our engine pinpoints the exact line and character where the syntax error occurred, acting as a true JSON validator and fixer." },
          { title: "Secure & Private", desc: "Your data never leaves your device. Perfect for validating production API payloads containing sensitive customer data." }
        ]}
        faq={[
          { q: "What does a JSON Validator do?", a: "A JSON Validator checks if your JSON string conforms to the official JSON specification (RFC 8259). If it doesn't, it highlights exactly where the syntax is broken so you can fix it." },
          { q: "Can I use this as a Swagger JSON Validator?", a: "Yes! Swagger configurations are simply JSON objects. You can paste your entire Swagger file here and we will immediately validate its syntax." },
          { q: "Does this support LD JSON Validator checks?", a: "Absolutely. If you are generating JSON-LD for your website's rich snippets, pasting it into our validator will ensure it has no missing commas or syntax errors before you deploy it to Google." },
          { q: "Why is my JSON invalid?", a: "Common reasons include: trailing commas at the end of objects/arrays, using single quotes instead of double quotes, missing quotes around keys, or forgetting commas between elements." }
        ]}
      />
    </ToolLayout>
  );
};

export default Validator;
