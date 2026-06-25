import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { Wand2, Download, Trash2, FileText } from 'lucide-react';
import { formatJson, minifyJson, formatWithSortedKeys } from '../utils/jsonFormatter';
import { sampleJson } from '../utils/sampleData';
import './Formatter.css';

const Formatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleFormat = (indent) => {
    try {
      setOutput(formatJson(input, indent));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleMinify = () => {
    try {
      setOutput(minifyJson(input));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleSortKeys = () => {
    try {
      setOutput(formatWithSortedKeys(input));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, beautify, and minify your JSON data with customizable indentation."
      icon={Wand2}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={() => handleFormat(2)}>
          <Wand2 size={16} /> 2 Spaces
        </button>
        <button className="btn btn-secondary" onClick={() => handleFormat(4)}>
          4 Spaces
        </button>
        <button className="btn btn-secondary" onClick={() => handleFormat('\t')}>
          Tab
        </button>
        <button className="btn btn-secondary" onClick={handleMinify}>
          Minify
        </button>
        <button className="btn btn-secondary" onClick={handleSortKeys}>
          Sort Keys
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(sampleJson); setError(''); }}>
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

      <div className="formatter-panels">
        <div className="panel">
          <div className="panel-header">Input</div>
          <CodeEditor value={input} onChange={setInput} placeholder="Paste your JSON here..." height="500px" />
        </div>
        <div className="panel">
          <div className="panel-header">Output</div>
          <CodeEditor value={output} readOnly placeholder="Formatted output will appear here..." height="500px" />
        </div>
      </div>

      <SeoContent 
        title="Free Online JSON Formatter & Beautifier"
        description={[
          "Our Free JSON Formatter is a powerful, client-side tool designed to instantly beautify, format, and structure your messy or minified JSON code into readable, perfectly indented structures.",
          "Unlike other online tools, this formatter processes everything securely within your browser. Your sensitive JSON data never touches a server, ensuring maximum privacy and lightning-fast speeds."
        ]}
        features={[
          { title: "Instant Beautification", desc: "Formats unreadable, minified JSON strings into perfectly indented, human-readable code in milliseconds." },
          { title: "100% Client-Side", desc: "Maximum privacy. No data is sent to external servers, making it safe for production data and API keys." },
          { title: "Syntax Highlighting", desc: "Premium dark/light mode syntax highlighting powered by CodeMirror, ensuring perfect readability." },
          { title: "Tab Size Control", desc: "Customize your indentation level with 2-space, 4-space, or tab configurations to match your project standards." }
        ]}
        faq={[
          { q: "What is JSON formatting?", a: "JSON formatting (or beautification) is the process of taking a compressed or minified JSON string and adding proper whitespace, line breaks, and indentation so that it is easily readable by humans." },
          { q: "Is my JSON data secure?", a: "Yes! This tool runs entirely in your web browser using JavaScript. No data is uploaded or stored anywhere." },
          { q: "How do I format minified JSON?", a: "Simply paste your minified JSON into the left panel, and the correctly indented version will instantly appear in the right panel. You can then copy or download the formatted file." }
        ]}
      />
    </ToolLayout>
  );
};

export default Formatter;
