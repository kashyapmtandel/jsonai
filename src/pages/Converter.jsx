import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { ArrowLeftRight, Download, Trash2, FileText, RefreshCw } from 'lucide-react';
import {
  jsonToYaml, yamlToJson, jsonToCsv, csvToJson,
  jsonToXml, xmlToJson, jsonToToml, tomlToJson,
} from '../utils/jsonConverter';
import { sampleJson, sampleJsonArray } from '../utils/sampleData';
import './Converter.css';

const formats = ['JSON', 'YAML', 'CSV', 'XML', 'TOML'];

const converters = {
  'JSON→YAML': jsonToYaml,
  'JSON→CSV': jsonToCsv,
  'JSON→XML': jsonToXml,
  'JSON→TOML': jsonToToml,
  'YAML→JSON': yamlToJson,
  'CSV→JSON': csvToJson,
  'XML→JSON': xmlToJson,
  'TOML→JSON': tomlToJson,
};

const Converter = () => {
  const [sourceFormat, setSourceFormat] = useState('JSON');
  const [targetFormat, setTargetFormat] = useState('YAML');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleConvert = () => {
    if (!input.trim()) {
      setError('Please enter some data to convert.');
      return;
    }
    const key = `${sourceFormat}→${targetFormat}`;
    const converter = converters[key];
    if (!converter) {
      setError(`Direct conversion from ${sourceFormat} to ${targetFormat} is not supported. Convert to JSON first.`);
      return;
    }
    try {
      setOutput(converter(input));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleSwap = () => {
    setSourceFormat(targetFormat);
    setTargetFormat(sourceFormat);
    setInput(output);
    setOutput('');
    setError('');
  };

  const handleDownload = () => {
    if (!output) return;
    const extensions = { JSON: 'json', YAML: 'yaml', CSV: 'csv', XML: 'xml', TOML: 'toml' };
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${extensions[targetFormat] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    if (sourceFormat === 'JSON') {
      setInput(sourceFormat === 'JSON' && targetFormat === 'CSV' ? sampleJsonArray : sampleJson);
    }
    setError('');
  };

  return (
    <ToolLayout
      title="JSON Converter"
      description="Convert between JSON, CSV, YAML, XML, and TOML formats seamlessly."
      icon={ArrowLeftRight}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleConvert}>
          <ArrowLeftRight size={16} /> Convert
        </button>
        <button className="btn btn-secondary" onClick={handleSwap}>
          <RefreshCw size={16} /> Swap
        </button>
        <button className="btn btn-ghost" onClick={loadSample}>
          <FileText size={16} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={output} />
        <button className="btn btn-ghost" onClick={handleDownload} disabled={!output}>
          <Download size={16} /> Download
        </button>
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="converter-panels">
        <div className="panel">
          <div className="panel-header">
            <span>Source</span>
            <select
              className="format-select"
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value)}
            >
              {formats.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <CodeEditor value={input} onChange={setInput} placeholder={`Paste your ${sourceFormat} here...`} height="500px" />
        </div>
        <div className="panel">
          <div className="panel-header">
            <span>Target</span>
            <select
              className="format-select"
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
            >
              {formats.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <CodeEditor value={output} readOnly placeholder="Converted output will appear here..." height="500px" />
        </div>
      </div>

      <SeoContent 
        title="Free Online JSON Converter"
        description={[
          "Easily convert between JSON and other popular data formats like YAML, XML, and CSV. Our Free JSON Converter provides instant, bi-directional translation for all your data structure needs.",
          "Forget about writing custom parser scripts. Simply paste your data, and watch it transform securely in your browser without ever hitting an external server."
        ]}
        features={[
          { title: "JSON to YAML", desc: "Convert messy JSON objects into clean, human-readable YAML configurations perfectly suited for Docker, Kubernetes, or CI/CD pipelines." },
          { title: "JSON to CSV", desc: "Flatten complex JSON arrays into simple comma-separated values (CSV) that you can instantly open in Excel or Google Sheets." },
          { title: "JSON to XML", desc: "Transform modern JSON payloads into valid XML trees for legacy enterprise systems and SOAP APIs." },
          { title: "100% Secure", desc: "Your data is converted securely within your local browser environment. We respect your privacy." }
        ]}
        faq={[
          { q: "How do I convert JSON to Excel?", a: "To open JSON in Excel, select the 'CSV' format tab. Paste your JSON array into the left panel, and copy the resulting CSV output. You can then save it as a .csv file and double-click it to open in Excel." },
          { q: "Can I convert YAML back to JSON?", a: "Currently, our tool supports converting JSON into YAML, CSV, and XML. Bi-directional parsing is coming soon!" }
        ]}
      />
    </ToolLayout>
  );
};

export default Converter;
