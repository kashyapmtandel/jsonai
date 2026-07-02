import { useState, useMemo, useCallback, useRef } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import TabGroup from '../components/TabGroup';
import { FileJson, Download, Trash2, FileText, ShieldCheck, CheckCircle, XCircle, Upload } from 'lucide-react';
import { generateSchema, validateSchema } from '../utils/jsonSchema';
import { sampleJson } from '../utils/sampleData';
import './SchemaGenerator.css';

const SAMPLE_SCHEMA = JSON.stringify({
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "name":  { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age":   { "type": "integer", "minimum": 0 },
  },
  "required": ["name", "email"],
}, null, 2);

const SAMPLE_VAL_JSON = JSON.stringify({ name: 'Alice', email: 'alice@jsonai.online', age: 30 }, null, 2);

const SchemaGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  // Generate tab
  const [genInput, setGenInput]   = useState('');
  const [genOutput, setGenOutput] = useState('');
  const [genError, setGenError]   = useState('');
  // Validate tab
  const [valJson, setValJson]     = useState('');
  const [valSchema, setValSchema] = useState('');
  const [valResult, setValResult] = useState(null);
  const [valError, setValError]   = useState('');
  const genFileRef = useRef(null);

  // Live parse status for generate input
  const inputStatus = useMemo(() => {
    const t = genInput.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [genInput]);

  // Input stats
  const genStats = useMemo(() => {
    if (!genInput) return null;
    return { lines: genInput.split('\n').length, chars: genInput.length };
  }, [genInput]);

  const handleGenerate = useCallback(() => {
    if (!genInput.trim()) { setGenError('Please paste some JSON first.'); return; }
    try {
      const parsed = JSON.parse(genInput);
      setGenOutput(JSON.stringify(generateSchema(parsed), null, 2));
      setGenError('');
    } catch (e) {
      setGenError(e.message);
      setGenOutput('');
    }
  }, [genInput]);

  const handleValidate = useCallback(() => {
    try {
      setValResult(validateSchema(valJson, valSchema));
      setValError('');
    } catch (e) {
      setValError(e.message);
      setValResult(null);
    }
  }, [valJson, valSchema]);

  // Auto-generate on paste (400 ms debounce)
  const debounceRef = useRef(null);
  const handleGenInputChange = (val) => {
    setGenInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!val.trim()) return;
      try {
        const parsed = JSON.parse(val);
        setGenOutput(JSON.stringify(generateSchema(parsed), null, 2));
        setGenError('');
      } catch { /* keep existing output */ }
    }, 400);
  };

  const handleDownload = useCallback(() => {
    if (!genOutput) return;
    const blob = new Blob([genOutput], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'schema.json'; a.click();
    URL.revokeObjectURL(url);
  }, [genOutput]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleGenInputChange(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <ToolLayout
      title="Schema Generator"
      description="Auto-generate JSON Schema from data, or validate JSON against a schema."
      icon={FileJson}
    >
      <TabGroup
        items={[
          { id: 'generate', label: 'Generate Schema', icon: FileJson },
          { id: 'validate', label: 'Validate Against Schema', icon: ShieldCheck },
        ]}
        activeId={activeTab}
        onChange={(id) => { setActiveTab(id); }}
        variant="underline"
        className="schema-tabs"
      />

      {/* ── Generate tab ── */}
      {activeTab === 'generate' && (
        <>
          <ActionBar>
            <button className="btn btn-primary" onClick={handleGenerate}>
              <FileJson size={15} /> Generate
            </button>
            <button className="btn btn-ghost" onClick={() => { setGenInput(sampleJson); setGenError(''); }}>
              <FileText size={15} /> Sample
            </button>
            <button className="btn btn-ghost" onClick={() => genFileRef.current?.click()}>
              <Upload size={15} /> Upload
            </button>
            <input ref={genFileRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
            <button className="btn btn-ghost" onClick={() => { setGenInput(''); setGenOutput(''); setGenError(''); }}>
              <Trash2 size={15} /> Clear
            </button>
            <CopyButton text={genOutput} />
            <button className="btn btn-ghost" onClick={handleDownload} disabled={!genOutput}>
              <Download size={15} /> Download
            </button>
          </ActionBar>

          {/* Status bar */}
          <div className="schema-status-bar">
            <div className="schema-status-left">
              {!genInput.trim() ? (
                <span className="schema-status-idle">Paste JSON to generate schema — auto-generates as you type</span>
              ) : inputStatus?.valid ? (
                <span className="schema-status-valid"><CheckCircle size={13} /> Valid JSON — schema generated</span>
              ) : (
                <span className="schema-status-invalid"><XCircle size={13} /> {inputStatus?.message}</span>
              )}
            </div>
            {genStats && (
              <div className="schema-meta-stats">
                <span>{genStats.lines} lines</span>
                <span className="schema-dot">·</span>
                <span>{genStats.chars.toLocaleString()} chars</span>
              </div>
            )}
          </div>

          {genError && <div className="error-banner">{genError}</div>}

          <div className="schema-panels">
            <div className="panel">
              <div className="panel-header">Input JSON</div>
              <CodeEditor
                value={genInput}
                onChange={handleGenInputChange}
                placeholder="Paste JSON data here — schema auto-generates as you type..."
                height="460px"
              />
            </div>
            <div className="panel">
              <div className="panel-header">
                <span>Generated Schema</span>
                {genOutput && <span className="schema-output-meta">Draft 2020-12</span>}
              </div>
              {genOutput ? (
                <CodeEditor value={genOutput} readOnly placeholder="Generated schema will appear here..." height="460px" />
              ) : (
                <div className="schema-output-empty">
                  <FileJson size={28} strokeWidth={1.3} />
                  <p>JSON Schema will appear here after generation</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Validate tab ── */}
      {activeTab === 'validate' && (
        <>
          <ActionBar>
            <button className="btn btn-primary" onClick={handleValidate}>
              <ShieldCheck size={15} /> Validate
            </button>
            <button className="btn btn-ghost" onClick={() => { setValJson(SAMPLE_VAL_JSON); setValSchema(SAMPLE_SCHEMA); setValError(''); setValResult(null); }}>
              <FileText size={15} /> Sample
            </button>
            <button className="btn btn-ghost" onClick={() => { setValJson(''); setValSchema(''); setValResult(null); setValError(''); }}>
              <Trash2 size={15} /> Clear
            </button>
          </ActionBar>

          {valError && <div className="error-banner">{valError}</div>}

          {/* Result card above editors */}
          {valResult && (
            <div className={`schema-val-result ${valResult.valid ? 'schema-val--valid' : 'schema-val--invalid'}`}>
              <div className="schema-val-header">
                {valResult.valid
                  ? <><CheckCircle size={18} /> <span>Valid — JSON matches the schema</span></>
                  : <><XCircle size={18} /> <span>Invalid — {valResult.errors.length} error{valResult.errors.length !== 1 ? 's' : ''} found</span></>}
              </div>
              {!valResult.valid && (
                <ul className="schema-val-errors">
                  {valResult.errors.map((err, i) => (
                    <li key={i}>
                      <strong>{err.instancePath || '/'}</strong>: {err.message}
                      {err.params && <span className="schema-err-params"> ({JSON.stringify(err.params)})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="schema-panels">
            <div className="panel">
              <div className="panel-header">JSON Data</div>
              <CodeEditor value={valJson} onChange={setValJson} placeholder="Paste JSON data to validate..." height="370px" />
            </div>
            <div className="panel">
              <div className="panel-header">JSON Schema</div>
              <CodeEditor value={valSchema} onChange={setValSchema} placeholder="Paste JSON Schema (Draft 2020-12)..." height="370px" />
            </div>
          </div>
        </>
      )}

      <SeoContent
        title="Free JSON Schema Generator & Validator"
        description={[
          'Auto-generate a valid JSON Schema (Draft 2020-12) from any JSON object or array in one click. Paste your data, and the schema is generated instantly — no manual field mapping needed.',
          'Also validate any JSON document against a custom schema with detailed error messages showing exactly which fields fail and why.',
        ]}
        features={[
          { title: 'Auto-Generate on Paste', desc: 'Schema generates automatically 400 ms after you stop typing — no button click needed.' },
          { title: 'Validate Against Schema', desc: 'Switch to the Validate tab to check any JSON against your schema with full error details.' },
          { title: 'Type Detection', desc: 'Intelligently infers string, number, boolean, null, object, and array types from your sample data.' },
          { title: 'Draft 2020-12', desc: 'Generates schemas conforming to the latest JSON Schema draft.' },
          { title: 'Download', desc: 'Export the generated schema as a .json file for use in your API validation pipeline.' },
          { title: '100% Private', desc: 'All processing happens in your browser — no data is sent to any server.' },
        ]}
        faq={[
          { q: 'What is JSON Schema?', a: 'JSON Schema is a vocabulary for annotating and validating JSON documents. It lets you define the expected shape, types, and required fields of any JSON structure.' },
          { q: 'Why do I need a schema?', a: 'If you build APIs or databases that accept JSON, a schema lets you validate incoming data before processing it, catching errors early.' },
          { q: 'Which draft does this generate?', a: 'This tool generates JSON Schema Draft 2020-12, the latest version.' },
        ]}
      />
    </ToolLayout>
  );
};

export default SchemaGenerator;
