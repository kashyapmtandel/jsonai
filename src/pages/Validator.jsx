import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import {
  ShieldCheck, FileText, Trash2, CheckCircle, XCircle,
  Upload, Wrench, AlertTriangle, Info, Hash, Layers, Type,
} from 'lucide-react';
import { sampleJson, sampleInvalidJson } from '../utils/sampleData';
import { repairJson } from '../utils/jsonFormatter';
import './Validator.css';

// ─── Human-friendly error hints ───────────────────────────────────────────────
const getFriendlyHint = (message, input) => {
  if (!message) return null;
  const m = message.toLowerCase();

  // Trailing comma
  if (m.includes('trailing comma') || (m.includes('unexpected token') && (m.includes('}') || m.includes(']'))))
    return 'Hint: Remove the trailing comma before the closing } or ]. JSON does not allow trailing commas.';

  // Single quotes
  if (m.includes("'") || m.includes('single quote'))
    return 'Hint: JSON requires double quotes "like this", not single quotes \'like this\'. Click Auto-Fix to convert them.';

  // undefined
  if (m.includes('undefined') || m.includes('u in json'))
    return 'Hint: JSON does not support undefined — use null instead.';

  // Python-style booleans / None
  if (m.includes('true') || m.includes('false') || m.includes('none'))
    return 'Hint: Boolean values must be lowercase: true, false (not True / False). Use null instead of None. Click Auto-Fix to repair.';

  // Unexpected end of input (incomplete JSON)
  if (m.includes('unexpected end') || m.includes('end of json') || m.includes('end of input'))
    return 'Hint: JSON is incomplete — check for a missing closing } or ]. Count your opening and closing brackets.';

  // Unquoted keys
  if (m.includes('expected property name') || m.includes('bad control character'))
    return 'Hint: Object keys must be double-quoted strings: "key": value. Click Auto-Fix to add quotes.';

  // Comments in JSON (very common mistake)
  if (input && (/\/\/[^\n]*/.test(input) || /\/\*[\s\S]*?\*\//.test(input)))
    return 'Hint: Standard JSON does not support comments (// or /* */). Remove them or use JSONC format. Click Auto-Fix to strip them.';

  // Hex numbers (0xFF)
  if (input && /\b0x[0-9a-fA-F]+\b/.test(input))
    return 'Hint: JSON does not support hexadecimal numbers (0xFF). Convert them to decimal values.';

  // Infinity / -Infinity / NaN
  if (input && /\b(Infinity|-Infinity|NaN)\b/.test(input))
    return 'Hint: JSON does not support Infinity or NaN. Use null or a string representation instead. Click Auto-Fix to convert NaN to null.';

  // Multi-line strings (template literals or escaped newlines)
  if (m.includes('bad string') || m.includes('bad escape') || m.includes('unterminated string'))
    return 'Hint: JSON strings cannot span multiple lines. Use \\n for newlines inside strings. Also check for unescaped backslashes.';

  // Missing comma between properties
  if (m.includes('expected \',\'') || m.includes('expected comma'))
    return 'Hint: You are probably missing a comma between two properties or array items.';

  // Duplicate keys
  if (m.includes('duplicate'))
    return 'Hint: This JSON has duplicate keys. While technically parseable, duplicate keys can cause unpredictable behavior. Remove or rename duplicates.';

  // Expected colon
  if (m.includes('expected \':\'' ) || m.includes('expected colon'))
    return 'Hint: A colon is missing between a key and its value. Format should be "key": value.';

  // Unexpected number format
  if (m.includes('unexpected number') || m.includes('leading zero'))
    return 'Hint: JSON numbers cannot have leading zeros (e.g., 012). Remove the leading zero or quote it as a string.';

  return null;
};

// ─── Stats from valid parsed JSON ─────────────────────────────────────────────
const getJsonStats = (text) => {
  try {
    const parsed = JSON.parse(text);
    const bytes = new Blob([text]).size;
    const rootType = Array.isArray(parsed) ? 'Array'
      : parsed === null ? 'null'
      : typeof parsed === 'object' ? 'Object'
      : typeof parsed;

    const countKeys = (obj) => {
      if (typeof obj !== 'object' || obj === null) return 0;
      let count = 0;
      if (Array.isArray(obj)) obj.forEach(v => (count += countKeys(v)));
      else { count += Object.keys(obj).length; Object.values(obj).forEach(v => (count += countKeys(v))); }
      return count;
    };

    const getDepth = (obj, d = 0) => {
      if (typeof obj !== 'object' || obj === null) return d;
      const children = Array.isArray(obj) ? obj : Object.values(obj);
      if (children.length === 0) return d + 1;
      return Math.max(...children.map(c => getDepth(c, d + 1)));
    };

    const countValues = (obj) => {
      if (typeof obj !== 'object' || obj === null) return 1;
      const children = Array.isArray(obj) ? obj : Object.values(obj);
      return children.reduce((sum, v) => sum + countValues(v), 0);
    };

    return {
      rootType,
      kb: (bytes / 1024).toFixed(1),
      keys: countKeys(parsed),
      depth: getDepth(parsed),
      values: countValues(parsed),
      lines: text.split('\n').length,
      arrayLen: Array.isArray(parsed) ? parsed.length : null,
    };
  } catch { return null; }
};

// ─── Component ────────────────────────────────────────────────────────────────
const Validator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);
  const fileInputRef = useRef(null);

  // Live stats
  const liveStats = useMemo(() => {
    if (!input) return null;
    return {
      lines: input.split('\n').length,
      chars: input.length,
      kb: (new Blob([input]).size / 1024).toFixed(1),
    };
  }, [input]);

  // Core validate
  const validate = useCallback((text) => {
    const t = (text ?? '').trim();
    if (!t) { setResult(null); return; }
    try {
      JSON.parse(t);
      setResult({ valid: true, stats: getJsonStats(t) });
    } catch (e) {
      const posMatch = e.message.match(/position (\d+)/);
      const lineMatch = e.message.match(/line (\d+)/i);
      const colMatch  = e.message.match(/column (\d+)/i);
      let line = null, column = null;
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const lineArr = text.substring(0, pos).split('\n');
        line   = lineArr.length;
        column = lineArr[lineArr.length - 1].length + 1;
      } else if (lineMatch) {
        line   = parseInt(lineMatch[1]);
        column = colMatch ? parseInt(colMatch[1]) : null;
      }
      setResult({ valid: false, message: e.message, hint: getFriendlyHint(e.message, t), line, column });
    }
  }, []);

  // Debounced auto-validate
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validate(input), 300);
    return () => clearTimeout(debounceRef.current);
  }, [input, validate]);

  // Ctrl+Enter — validate immediately
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        validate(input);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [input, validate]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleRepair = useCallback(() => {
    if (!input.trim()) return;
    try {
      const fixed = repairJson(input);
      setInput(fixed);
    } catch (e) {
      setResult(prev => ({ ...prev, repairError: 'Auto-fix failed: ' + e.message }));
    }
  }, [input]);

  const handleClear = useCallback(() => { setInput(''); setResult(null); }, []);

  const isValid   = result?.valid === true;
  const isInvalid = result?.valid === false;

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate JSON with real-time feedback, precise error location, and human-friendly hints."
      icon={ShieldCheck}
    >
      {/* ── Toolbar ── */}
      <ActionBar>
        <button className="btn btn-primary" onClick={() => validate(input)} title="Validate (Ctrl+Enter)">
          <ShieldCheck size={15} /> Validate
        </button>
        <span className="val-sep" />
        <button className="btn btn-ghost" onClick={() => setInput(sampleJson)}>
          <FileText size={15} /> Valid Sample
        </button>
        <button className="btn btn-ghost" onClick={() => setInput(sampleInvalidJson)}>
          <XCircle size={15} /> Invalid Sample
        </button>
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} /> Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".json,.txt,application/json"
          style={{ display: 'none' }} onChange={handleFileUpload} />
        <CopyButton text={input} />
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={15} /> Clear
        </button>
      </ActionBar>

      {/* ── Status bar (always visible, above editor) ── */}
      <div className="val-status-bar">
        <div className="val-status-left">
          {!result && (
            <span className="val-status-idle">
              Paste JSON below — auto-validates as you type &mdash; <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to validate immediately
            </span>
          )}
          {isValid && (
            <span className="val-status-valid"><CheckCircle size={13} /> Valid JSON</span>
          )}
          {isInvalid && (
            <span className="val-status-invalid">
              <XCircle size={13} />
              {result.line
                ? `Error at line ${result.line}${result.column ? `, col ${result.column}` : ''}`
                : 'Invalid JSON'}
            </span>
          )}
        </div>
        {liveStats && (
          <div className="val-stats">
            <span>{liveStats.lines} lines</span>
            <span className="val-stats-dot">·</span>
            <span>{liveStats.chars.toLocaleString()} chars</span>
            <span className="val-stats-dot">·</span>
            <span>{liveStats.kb} KB</span>
          </div>
        )}
      </div>

      {/* ── Result card — ABOVE the editor ── */}
      {result && (
        <div className={`val-result ${isValid ? 'val-result--valid' : 'val-result--invalid'}`}>
          {isValid ? (
            <>
              <div className="val-result-header">
                <CheckCircle size={20} />
                <span>Valid JSON</span>
                <span className="val-result-badge val-badge-valid">✓ PASSED</span>
              </div>
              {result.stats && (
                <div className="val-stats-grid">
                  <div className="val-stat-card">
                    <Type size={14} />
                    <div>
                      <div className="val-stat-label">Root Type</div>
                      <div className="val-stat-value">{result.stats.rootType}</div>
                    </div>
                  </div>
                  {result.stats.arrayLen !== null && (
                    <div className="val-stat-card">
                      <Hash size={14} />
                      <div>
                        <div className="val-stat-label">Array Length</div>
                        <div className="val-stat-value">{result.stats.arrayLen}</div>
                      </div>
                    </div>
                  )}
                  <div className="val-stat-card">
                    <Hash size={14} />
                    <div>
                      <div className="val-stat-label">Total Keys</div>
                      <div className="val-stat-value">{result.stats.keys}</div>
                    </div>
                  </div>
                  <div className="val-stat-card">
                    <Layers size={14} />
                    <div>
                      <div className="val-stat-label">Depth</div>
                      <div className="val-stat-value">{result.stats.depth}</div>
                    </div>
                  </div>
                  <div className="val-stat-card">
                    <Info size={14} />
                    <div>
                      <div className="val-stat-label">Values</div>
                      <div className="val-stat-value">{result.stats.values}</div>
                    </div>
                  </div>
                  <div className="val-stat-card">
                    <Info size={14} />
                    <div>
                      <div className="val-stat-label">Lines</div>
                      <div className="val-stat-value">{result.stats.lines}</div>
                    </div>
                  </div>
                  <div className="val-stat-card">
                    <Info size={14} />
                    <div>
                      <div className="val-stat-label">Size</div>
                      <div className="val-stat-value">{result.stats.kb} KB</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="val-result-header">
                <XCircle size={20} />
                <span>Invalid JSON</span>
                <span className="val-result-badge val-badge-invalid">✕ FAILED</span>
              </div>
              <div className="val-error-body">
                <div className="val-error-msg">{result.message}</div>
                {result.line && (
                  <div className="val-error-location">
                    <AlertTriangle size={12} />
                    Line {result.line}{result.column ? `, Column ${result.column}` : ''}
                  </div>
                )}
                {result.hint && (
                  <div className="val-error-hint">
                    <Info size={13} /> {result.hint}
                  </div>
                )}
                {result.repairError && (
                  <div className="val-repair-error">{result.repairError}</div>
                )}
                <div className="val-error-actions">
                  <button className="btn btn-secondary val-fix-btn" onClick={handleRepair}>
                    <Wrench size={14} /> Auto-Fix JSON
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Editor (below result card) ── */}
      <CodeEditor
        value={input}
        onChange={setInput}
        placeholder="Paste your JSON here to validate..."
        height="460px"
      />

      <SeoContent
        title="JSON Validator — Free Online JSON Checker with Error Location"
        description={[
          'Our Free JSON Validator checks your JSON in real time as you type — no button click needed. It finds the exact line and column of every syntax error and provides human-friendly hints to help you fix them fast.',
          'Whether you are validating a REST API response, a Swagger config, a JSON-LD snippet for SEO, or a deeply nested config file, this tool pinpoints the problem instantly — 100% in your browser.',
        ]}
        features={[
          { title: 'Real-Time Validation', desc: 'Validates as you type with a 300ms debounce. Errors appear immediately without clicking Validate.' },
          { title: 'Precise Error Location', desc: 'Shows the exact line and column of every syntax error so you can jump straight to the problem.' },
          { title: 'Human-Friendly Hints', desc: 'Translates cryptic parser errors into plain English — trailing commas, single quotes, unquoted keys, and more.' },
          { title: 'Auto-Fix (Repair)', desc: 'One click repairs trailing commas, single-quoted strings, unquoted keys, and Python/JS literals automatically.' },
          { title: 'Rich JSON Stats', desc: 'On valid JSON, instantly see root type, array length, total keys, nesting depth, value count, and file size.' },
          { title: '100% Client-Side', desc: 'All validation runs in your browser. Your data never leaves your device.' },
        ]}
        faq={[
          { q: 'What does a JSON Validator do?', a: 'A JSON Validator checks if your JSON string conforms to the official JSON specification (RFC 8259). If it does not, it shows exactly where the syntax is broken.' },
          { q: 'Can I use this as a Swagger JSON Validator?', a: 'Yes! Swagger/OpenAPI configurations are JSON objects. Paste your Swagger file and we will validate its syntax immediately.' },
          { q: 'Does this support JSON-LD validation?', a: 'Absolutely. Paste your JSON-LD structured data here to check for syntax errors before deploying to Google.' },
          { q: 'Why is my JSON invalid?', a: 'Common causes: trailing commas before } or ], single quotes instead of double quotes, unquoted keys, boolean values capitalised (True/False instead of true/false), or missing closing brackets.' },
          { q: 'What does Auto-Fix do?', a: 'Auto-Fix runs our JSON Repair engine which fixes trailing commas, single-quoted strings, unquoted keys, Python/JS literals (True, False, None), and markdown code fences from AI output.' },
        ]}
      />
    </ToolLayout>
  );
};

export default Validator;
