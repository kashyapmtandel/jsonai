import { useState, useMemo, useCallback, useRef } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { ArrowLeftRight, Download, Trash2, FileText, RefreshCw, Upload, ChevronRight } from 'lucide-react';
import {
  jsonToYaml, yamlToJson, jsonToCsv, csvToJson,
  jsonToXml, xmlToJson, jsonToToml, tomlToJson,
} from '../utils/jsonConverter';
import { sampleJson, sampleJsonArray } from '../utils/sampleData';
import './Converter.css';

const FORMATS = ['JSON', 'YAML', 'CSV', 'XML', 'TOML'];

const CONVERTERS = {
  'JSON→YAML': jsonToYaml, 'JSON→CSV': jsonToCsv, 'JSON→XML': jsonToXml, 'JSON→TOML': jsonToToml,
  'YAML→JSON': yamlToJson, 'CSV→JSON': csvToJson, 'XML→JSON': xmlToJson, 'TOML→JSON': tomlToJson,
};

const Converter = () => {
  const [sourceFormat, setSourceFormat] = useState('JSON');
  const [targetFormat, setTargetFormat] = useState('YAML');
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');
  const [error, setError]   = useState('');
  const fileInputRef = useRef(null);

  // Live input stats
  const liveStats = useMemo(() => {
    if (!input) return null;
    return { lines: input.split('\n').length, chars: input.length, kb: (new Blob([input]).size / 1024).toFixed(1) };
  }, [input]);

  const conversionKey = `${sourceFormat}→${targetFormat}`;
  const isSupported = !!CONVERTERS[conversionKey];

  const doConvert = useCallback((text, src, tgt) => {
    const key = `${src}→${tgt}`;
    const fn = CONVERTERS[key];
    if (!fn) {
      setError(`Conversion ${src} → ${tgt} is not supported. Convert to JSON first as an intermediate step.`);
      setOutput(''); return;
    }
    if (!text.trim()) { setError('Please enter some data to convert.'); setOutput(''); return; }
    try { setOutput(fn(text)); setError(''); }
    catch (e) { setError(e.message); setOutput(''); }
  }, []);

  const handleConvert = useCallback(() => doConvert(input, sourceFormat, targetFormat), [input, sourceFormat, targetFormat, doConvert]);

  const handleSwap = useCallback(() => {
    setSourceFormat(targetFormat);
    setTargetFormat(sourceFormat);
    setInput(output);
    setOutput('');
    setError('');
  }, [sourceFormat, targetFormat, output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const exts = { JSON: 'json', YAML: 'yaml', CSV: 'csv', XML: 'xml', TOML: 'toml' };
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `converted.${exts[targetFormat] || 'txt'}`; a.click();
    URL.revokeObjectURL(url);
  }, [output, targetFormat]);

  const loadSample = useCallback(() => {
    const sample = sourceFormat === 'JSON' && targetFormat === 'CSV' ? sampleJsonArray : sampleJson;
    setInput(sourceFormat === 'JSON' ? sample : '');
    setOutput(''); setError('');
  }, [sourceFormat, targetFormat]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setInput(ev.target.result); setOutput(''); setError(''); };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleClear = useCallback(() => { setInput(''); setOutput(''); setError(''); }, []);

  return (
    <ToolLayout
      title="JSON Converter"
      description="Convert between JSON, YAML, CSV, XML, and TOML instantly."
      icon={ArrowLeftRight}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleConvert} disabled={!isSupported}>
          <ArrowLeftRight size={15} /> Convert
        </button>
        <button className="btn btn-secondary" onClick={handleSwap} disabled={!output}>
          <RefreshCw size={15} /> Swap
        </button>
        <button className="btn btn-ghost" onClick={loadSample} disabled={sourceFormat !== 'JSON'}>
          <FileText size={15} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} /> Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".json,.yaml,.yml,.csv,.xml,.toml,.txt"
          style={{ display: 'none' }} onChange={handleFileUpload} />
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={15} /> Clear
        </button>
        <CopyButton text={output} />
        <button className="btn btn-ghost" onClick={handleDownload} disabled={!output}>
          <Download size={15} /> Download
        </button>
      </ActionBar>

      {/* Format selector bar */}
      <div className="conv-format-bar">
        <div className="conv-format-pills">
          {FORMATS.map(f => (
            <button
              key={f}
              className={`conv-pill ${sourceFormat === f ? 'conv-pill--active' : ''}`}
              onClick={() => { setSourceFormat(f); setOutput(''); setError(''); }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="conv-arrow">
          <ChevronRight size={16} />
        </div>
        <div className="conv-format-pills">
          {FORMATS.map(f => (
            <button
              key={f}
              className={`conv-pill ${targetFormat === f ? 'conv-pill--active' : ''} ${f === sourceFormat ? 'conv-pill--same' : ''}`}
              onClick={() => { setTargetFormat(f); setOutput(''); setError(''); }}
              disabled={f === sourceFormat}
            >
              {f}
            </button>
          ))}
        </div>
        {!isSupported && (
          <span className="conv-unsupported">Not directly supported — convert via JSON first</span>
        )}
      </div>

      {/* Status bar */}
      <div className="conv-status-bar">
        <span className="conv-status-route">
          {sourceFormat} → {targetFormat}
          {isSupported
            ? <span className="conv-status-ok">✓ Supported</span>
            : <span className="conv-status-no">✗ Unsupported</span>}
        </span>
        {liveStats && (
          <div className="conv-meta-stats">
            <span>{liveStats.lines} lines</span>
            <span className="conv-dot">·</span>
            <span>{liveStats.chars.toLocaleString()} chars</span>
            <span className="conv-dot">·</span>
            <span>{liveStats.kb} KB</span>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="converter-panels">
        <div className="panel">
          <div className="panel-header">
            <span>{sourceFormat} Input</span>
          </div>
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder={`Paste your ${sourceFormat} here...`}
            height="500px"
          />
        </div>
        <div className="panel">
          <div className="panel-header">
            <span>{targetFormat} Output</span>
            {output && <span className="conv-output-meta">{output.split('\n').length} lines</span>}
          </div>
          {output ? (
            <CodeEditor value={output} readOnly placeholder="Converted output will appear here..." height="500px" />
          ) : (
            <div className="conv-output-empty">
              <ArrowLeftRight size={24} strokeWidth={1.3} />
              <p>Click <strong>Convert</strong> to see the {targetFormat} output</p>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title="Free Online JSON Converter — JSON to YAML, CSV, XML, TOML"
        description={[
          'Convert between JSON, YAML, CSV, XML, and TOML instantly in your browser. Paste your data, pick the target format, and click Convert — no server, no upload, no wait.',
          'Perfect for transforming API responses into YAML for Kubernetes configs, flattening JSON arrays into CSV for Excel, or migrating config files between formats.',
        ]}
        features={[
          { title: 'JSON ↔ YAML', desc: 'Convert JSON to YAML for Kubernetes, Docker, and CI/CD pipelines, or parse YAML back to JSON.' },
          { title: 'JSON ↔ CSV', desc: 'Flatten JSON arrays to CSV for Excel/Google Sheets, or import CSV data back to JSON.' },
          { title: 'JSON ↔ XML', desc: 'Transform JSON to XML for SOAP APIs and legacy enterprise systems.' },
          { title: 'JSON ↔ TOML', desc: 'Convert to/from TOML for Rust, Python, and modern config file formats.' },
          { title: 'File Upload', desc: 'Upload any file directly instead of copying and pasting.' },
          { title: 'One-click Swap', desc: 'Instantly reverse the conversion direction with the Swap button.' },
        ]}
        faq={[
          { q: 'How do I convert JSON to Excel?', a: 'Select CSV as the target format, paste a JSON array, and click Convert. Save the output as .csv and open it in Excel.' },
          { q: 'Can I convert YAML back to JSON?', a: 'Yes — select YAML as source and JSON as target, then click Convert.' },
          { q: 'What if my format combination is unsupported?', a: 'Convert your data to JSON first, then convert from JSON to your target format.' },
        ]}
      />
    </ToolLayout>
  );
};

export default Converter;
