import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { Wand2, Download, Trash2, FileText, Upload, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { formatJson, minifyJson, formatWithSortedKeys, repairJson } from '../utils/jsonFormatter';
import { sampleJson } from '../utils/sampleData';
import './Formatter.css';

const Formatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const fileInputRef = useRef(null);

  // Stable refs so effects/callbacks always see latest values
  const inputRef = useRef('');
  const indentRef = useRef(2);
  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { indentRef.current = indent; }, [indent]);

  // ── Live validation (derived, no state setter calls) ─────────────────────
  const liveStatus = useMemo(() => {
    const t = input.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [input]);

  // ── Input stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!input) return null;
    return {
      lines: input.split('\n').length,
      chars: input.length,
      kb: (new Blob([input]).size / 1024).toFixed(1),
    };
  }, [input]);

  // ── Core helpers ──────────────────────────────────────────────────────────
  const applyFormat = (text, ind) => {
    if (!text?.trim()) { setError('Please paste some JSON first.'); return false; }
    try {
      setOutput(formatJson(text, ind));
      setError('');
      return true;
    } catch (e) {
      setError(e.message);
      setOutput('');
      return false;
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleIndentFormat = (ind) => {
    setIndent(ind);
    indentRef.current = ind;
    applyFormat(inputRef.current, ind);
  };

  const handleMinify = useCallback(() => {
    if (!inputRef.current?.trim()) { setError('Please paste some JSON first.'); return; }
    try { setOutput(minifyJson(inputRef.current)); setError(''); }
    catch (e) { setError(e.message); setOutput(''); }
  }, []);

  const handleSortKeys = useCallback(() => {
    if (!inputRef.current?.trim()) { setError('Please paste some JSON first.'); return; }
    try { setOutput(formatWithSortedKeys(inputRef.current, indentRef.current)); setError(''); }
    catch (e) { setError(e.message); setOutput(''); }
  }, []);

  const handleRepair = useCallback(() => {
    if (!inputRef.current?.trim()) { setError('Please paste some JSON first.'); return; }
    try {
      const result = repairJson(inputRef.current, indentRef.current);
      setInput(result);
      setOutput(result);
      setError('');
    } catch (e) {
      setError('Repair failed: ' + e.message);
      setOutput('');
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'formatted.json'; a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setInput(text);
      applyFormat(text, indentRef.current);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleClear = useCallback(() => {
    setInput(''); setOutput(''); setError('');
  }, []);

  const handleSample = useCallback(() => {
    setInput(sampleJson); setError('');
  }, []);

  // ── Auto-format on paste ──────────────────────────────────────────────────
  const handlePaste = useCallback((pastedText) => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;
    // Let CodeMirror apply the raw paste first, then replace with formatted
    setTimeout(() => {
      try {
        const formatted = formatJson(trimmed, indentRef.current);
        setInput(formatted);
        setOutput(formatted);
        setError('');
      } catch { /* not valid JSON — keep CodeMirror's raw paste */ }
    }, 20);
  }, []);

  // ── Ctrl+Enter keyboard shortcut ──────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        applyFormat(inputRef.current, indentRef.current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, beautify, minify, and repair JSON with real-time validation."
      icon={Wand2}
    >
      {/* ── Toolbar ── */}
      <ActionBar>
        <div className="fmt-btn-group">
          <button
            className={`btn ${indent === 2 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleIndentFormat(2)}
            title="Format with 2-space indent (Ctrl+Enter)"
          >
            <Wand2 size={14} /> 2 Spaces
          </button>
          <button
            className={`btn ${indent === 4 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleIndentFormat(4)}
            title="Format with 4-space indent"
          >
            4 Spaces
          </button>
          <button
            className={`btn ${indent === '\t' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleIndentFormat('\t')}
            title="Format with tab indent"
          >
            Tab
          </button>
        </div>

        <span className="fmt-sep" />

        <div className="fmt-btn-group">
          <button className="btn btn-secondary" onClick={handleMinify} title="Remove all whitespace">
            Minify
          </button>
          <button className="btn btn-secondary" onClick={handleSortKeys} title="Sort object keys alphabetically">
            Sort Keys
          </button>
          <button
            className="btn btn-secondary fmt-repair-btn"
            onClick={handleRepair}
            title="Fix trailing commas, single quotes, unquoted keys, Python/JS literals"
          >
            <Wrench size={14} /> Repair
          </button>
        </div>

        <span className="fmt-sep" />

        <div className="fmt-btn-group">
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} title="Load a .json file">
            <Upload size={14} /> Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button className="btn btn-ghost" onClick={handleSample}>
            <FileText size={14} /> Sample
          </button>
          <button className="btn btn-ghost" onClick={handleClear}>
            <Trash2 size={14} /> Clear
          </button>
        </div>

        <CopyButton text={output} />
        <button className="btn btn-ghost" onClick={handleDownload} disabled={!output}>
          <Download size={14} /> Download
        </button>
      </ActionBar>

      {/* ── Live status bar ── */}
      <div className="fmt-status-bar">
        <div className="fmt-status-left">
          {liveStatus === null && (
            <span className="fmt-status-idle">
              Paste JSON or upload a file &mdash; <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to format
            </span>
          )}
          {liveStatus?.valid === true && (
            <span className="fmt-status-valid">
              <CheckCircle size={13} /> Valid JSON
            </span>
          )}
          {liveStatus?.valid === false && (
            <span className="fmt-status-invalid">
              <XCircle size={13} /> {liveStatus.message}
            </span>
          )}
        </div>
        {stats && (
          <div className="fmt-stats">
            <span>{stats.lines} lines</span>
            <span className="fmt-stats-dot">·</span>
            <span>{stats.chars.toLocaleString()} chars</span>
            <span className="fmt-stats-dot">·</span>
            <span>{stats.kb} KB</span>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* ── Panels ── */}
      <div className="formatter-panels">
        <div className="panel">
          <div className="panel-header">Input</div>
          <CodeEditor
            value={input}
            onChange={setInput}
            onPaste={handlePaste}
            placeholder="Paste your JSON here..."
            height="500px"
          />
        </div>
        <div className="panel">
          <div className="panel-header">
            <span>Output</span>
            {output && (
              <span className="fmt-output-meta">
                {output.split('\n').length} lines &middot; {(new Blob([output]).size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          <CodeEditor
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            height="500px"
          />
        </div>
      </div>

      <SeoContent
        title="Free Online JSON Formatter & Beautifier"
        description={[
          'Our Free JSON Formatter is a powerful, client-side tool designed to instantly beautify, format, and structure your messy or minified JSON code into readable, perfectly indented structures.',
          'Unlike other online tools, this formatter processes everything securely within your browser. Your sensitive JSON data never touches a server, ensuring maximum privacy and lightning-fast speeds.',
        ]}
        features={[
          { title: 'Real-Time Validation', desc: 'See whether your JSON is valid or invalid as you type — no button click needed. Exact error messages with line and column position.' },
          { title: 'Auto-Format on Paste', desc: 'Paste valid JSON and it is automatically beautified for you. Saves the extra click every single time.' },
          { title: 'JSON Repair', desc: 'Automatically fix trailing commas, single-quoted strings, unquoted keys, Python/JS literals (True, False, None), and markdown code fences from LLM output.' },
          { title: 'File Upload', desc: 'Upload a .json file directly from your filesystem and format it instantly without leaving the browser.' },
          { title: '100% Client-Side', desc: 'Maximum privacy. No data is ever sent to external servers, making it safe for production configs and API keys.' },
          { title: 'Keyboard Shortcut', desc: 'Press Ctrl+Enter (Cmd+Enter on Mac) to format instantly. Ctrl+F to search inside the editor.' },
        ]}
        faq={[
          { q: 'What is JSON formatting?', a: 'JSON formatting (beautification) takes a minified JSON string and adds proper whitespace, line breaks, and indentation so it is easily readable by humans.' },
          { q: 'What does JSON Repair fix?', a: 'The Repair tool fixes: trailing commas before } or ], single-quoted strings, unquoted object keys, JavaScript/Python literals (True, False, None, undefined, NaN), and markdown code fence wrappers from AI/LLM output.' },
          { q: 'Is my JSON data secure?', a: 'Yes! Everything runs entirely in your browser using JavaScript. No data is uploaded or stored anywhere.' },
          { q: 'How do I format minified JSON?', a: 'Paste your minified JSON into the left panel — it auto-formats on paste. You can also click a format button or press Ctrl+Enter.' },
        ]}
      />
    </ToolLayout>
  );
};

export default Formatter;
