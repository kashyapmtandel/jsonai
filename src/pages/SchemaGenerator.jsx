import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import TabGroup from '../components/TabGroup';
import { FileJson, Download, Trash2, FileText, ShieldCheck } from 'lucide-react';
import { generateSchema, validateSchema } from '../utils/jsonSchema';
import { sampleJson } from '../utils/sampleData';
import './SchemaGenerator.css';

const SchemaGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [genInput, setGenInput] = useState('');
  const [genOutput, setGenOutput] = useState('');
  const [genError, setGenError] = useState('');
  const [valJson, setValJson] = useState('');
  const [valSchema, setValSchema] = useState('');
  const [valResult, setValResult] = useState(null);
  const [valError, setValError] = useState('');

  const handleGenerate = () => {
    try {
      const parsed = JSON.parse(genInput);
      const schema = generateSchema(parsed);
      setGenOutput(JSON.stringify(schema, null, 2));
      setGenError('');
    } catch (e) {
      setGenError(e.message);
      setGenOutput('');
    }
  };

  const handleValidate = () => {
    try {
      const result = validateSchema(valJson, valSchema);
      setValResult(result);
      setValError('');
    } catch (e) {
      setValError(e.message);
      setValResult(null);
    }
  };

  const handleDownloadSchema = () => {
    if (!genOutput) return;
    const blob = new Blob([genOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleSchema = JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "User",
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string", "format": "email" },
      "age": { "type": "integer", "minimum": 0 }
    },
    "required": ["name", "email"]
  }, null, 2);

  const sampleValJson = JSON.stringify({
    name: "Alice",
    email: "alice@jsonai.online",
    age: 30
  }, null, 2);

  return (
    <ToolLayout
      title="Schema Generator"
      description="Auto-generate JSON Schema from data or validate JSON against a schema."
      icon={FileJson}
    >
      <TabGroup
        items={[
          { id: 'generate', label: 'Generate Schema', icon: FileJson },
          { id: 'validate', label: 'Validate Against Schema', icon: ShieldCheck },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
        variant="underline"
        className="schema-tabs"
      />

      {activeTab === 'generate' && (
        <>
          <ActionBar>
            <button className="btn btn-primary" onClick={handleGenerate}>
              <FileJson size={16} /> Generate
            </button>
            <button className="btn btn-ghost" onClick={() => { setGenInput(sampleJson); setGenError(''); }}>
              <FileText size={16} /> Sample
            </button>
            <button className="btn btn-ghost" onClick={() => { setGenInput(''); setGenOutput(''); setGenError(''); }}>
              <Trash2 size={16} /> Clear
            </button>
            <CopyButton text={genOutput} />
            <button className="btn btn-ghost" onClick={handleDownloadSchema} disabled={!genOutput}>
              <Download size={16} /> Download
            </button>
          </ActionBar>

          {genError && <div className="error-banner">{genError}</div>}

          <div className="schema-panels">
            <div className="panel">
              <div className="panel-header">Input JSON</div>
              <CodeEditor value={genInput} onChange={setGenInput} placeholder="Paste JSON data to generate schema from..." height="450px" />
            </div>
            <div className="panel">
              <div className="panel-header">Generated Schema</div>
              <CodeEditor value={genOutput} readOnly placeholder="Generated schema will appear here..." height="450px" />
            </div>
          </div>
        </>
      )}

      {activeTab === 'validate' && (
        <>
          <ActionBar>
            <button className="btn btn-primary" onClick={handleValidate}>
              <ShieldCheck size={16} /> Validate
            </button>
            <button className="btn btn-ghost" onClick={() => { setValJson(sampleValJson); setValSchema(sampleSchema); setValError(''); setValResult(null); }}>
              <FileText size={16} /> Sample
            </button>
            <button className="btn btn-ghost" onClick={() => { setValJson(''); setValSchema(''); setValResult(null); setValError(''); }}>
              <Trash2 size={16} /> Clear
            </button>
          </ActionBar>

          {valError && <div className="error-banner">{valError}</div>}

          <div className="schema-panels">
            <div className="panel">
              <div className="panel-header">JSON Data</div>
              <CodeEditor value={valJson} onChange={setValJson} placeholder="Paste JSON data to validate..." height="350px" />
            </div>
            <div className="panel">
              <div className="panel-header">JSON Schema</div>
              <CodeEditor value={valSchema} onChange={setValSchema} placeholder="Paste JSON Schema..." height="350px" />
            </div>
          </div>

          {valResult && (
            <div className={`validation-result ${valResult.valid ? 'result-success' : 'result-error'}`}>
              <div className="result-header">
                {valResult.valid ? (
                  <><ShieldCheck size={20} /> <span>Valid — JSON matches the schema</span></>
                ) : (
                  <><FileJson size={20} /> <span>Invalid — {valResult.errors.length} error(s) found</span></>
                )}
              </div>
              {!valResult.valid && (
                <ul className="validation-errors">
                  {valResult.errors.map((err, i) => (
                    <li key={i}>
                      <strong>{err.instancePath || '/'}</strong>: {err.message}
                      {err.params && <span className="error-params"> ({JSON.stringify(err.params)})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <SeoContent 
        title="Free JSON Schema Generator"
        description={[
          "Manually writing JSON Schema (Draft-07 or Draft-04) for complex API payloads is tedious and error-prone. Our Free JSON Schema Generator instantly analyzes your JSON data and builds a perfect schema for you.",
          "Use this tool to rapidly create schemas for API validation, database modeling, and documentation. Everything is processed securely in your browser, guaranteeing zero data leakage."
        ]}
        features={[
          { title: "Instant Generation", desc: "Paste any JSON object or array, and a fully compliant JSON Schema will be generated instantly." },
          { title: "Type Detection", desc: "Intelligently infers primitive types (string, number, boolean) and detects complex nested objects and arrays." },
          { title: "Secure Processing", desc: "Your sensitive JSON payload never leaves your computer. The schema is generated 100% locally." }
        ]}
        faq={[
          { q: "What is a JSON Schema?", a: "JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It provides a contract for what JSON data is required for a given application and how to interact with it." },
          { q: "Why do I need a JSON Schema?", a: "If you are building an API or a database that accepts JSON, you need a schema to validate the incoming data, ensuring it has the correct keys and data types before processing it." }
        ]}
      />
    </ToolLayout>
  );
};

export default SchemaGenerator;
