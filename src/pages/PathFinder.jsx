import { useState, useCallback } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import ActionBar from '../components/ActionBar';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import { Target, Search, Copy, Check, FileText, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { queryJsonPath } from '../utils/jsonPath';
import { sampleNestedJson } from '../utils/sampleData';
import { useClipboard } from '../hooks/useClipboard';
import './PathFinder.css';

const TypeBadge = ({ type }) => {
  const colors = {
    object: '#6366f1',
    array: '#06b6d4',
    string: '#22c55e',
    number: '#f59e0b',
    boolean: '#f97316',
    null: '#64748b',
  };
  return (
    <span className="type-badge" style={{ color: colors[type] || '#94a3b8' }}>
      {type === 'object' ? 'obj' : type === 'array' ? 'arr' : type === 'boolean' ? 'bool' : type}
    </span>
  );
};

const TreeNode = ({ name, value, path, onCopyPath, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const { copy, copied } = useClipboard();
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const isExpandable = type === 'object' || type === 'array';
  const children = isExpandable
    ? (type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value))
    : [];

  const jsonPath = path || '$';

  const handleCopyPath = () => {
    copy(jsonPath);
    if (onCopyPath) onCopyPath(jsonPath);
  };

  const renderValue = () => {
    if (type === 'string') return <span className="tree-value tree-string">"{value}"</span>;
    if (type === 'number') return <span className="tree-value tree-number">{value}</span>;
    if (type === 'boolean') return <span className="tree-value tree-boolean">{String(value)}</span>;
    if (type === 'null') return <span className="tree-value tree-null">null</span>;
    if (type === 'array') return <span className="tree-count">[{value.length}]</span>;
    if (type === 'object') return <span className="tree-count">{'{' + Object.keys(value).length + '}'}</span>;
    return null;
  };

  return (
    <div className="tree-node">
      <div className="tree-row" onClick={handleCopyPath} title={`Click to copy: ${jsonPath}`}>
        <span style={{ width: depth * 20 + 'px', flexShrink: 0 }} />
        {isExpandable ? (
          <button className="tree-toggle" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="tree-toggle-placeholder" />
        )}
        {name !== undefined && <span className="tree-key">{typeof name === 'number' ? `[${name}]` : name}</span>}
        {name !== undefined && <span className="tree-colon">:</span>}
        {renderValue()}
        <TypeBadge type={type} />
        <span className={`tree-path-label ${copied ? 'copied' : ''}`}>
          {copied ? '✓ Copied!' : jsonPath}
        </span>
      </div>
      {isExpandable && expanded && (
        <div className="tree-children">
          {children.map(([key, val]) => {
            const childPath = typeof key === 'number'
              ? `${jsonPath}[${key}]`
              : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
                ? `${jsonPath}.${key}`
                : `${jsonPath}['${key}']`;
            return (
              <TreeNode
                key={childPath}
                name={key}
                value={val}
                path={childPath}
                onCopyPath={onCopyPath}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const PathFinder = () => {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');

  const handleParse = useCallback((text) => {
    if (!text || !text.trim()) {
      setParsed(null);
      setParseError('');
      return;
    }
    try {
      setParsed(JSON.parse(text));
      setParseError('');
    } catch (e) {
      setParsed(null);
      setParseError(e.message);
    }
  }, []);

  const handleInputChange = (val) => {
    setInput(val);
    handleParse(val);
  };

  const handleQuery = () => {
    if (!query.trim() || !parsed) return;
    try {
      const results = queryJsonPath(parsed, query);
      setQueryResults(results);
      setQueryError('');
    } catch (e) {
      setQueryError(e.message);
      setQueryResults(null);
    }
  };

  return (
    <ToolLayout
      title="Path Finder"
      description="Query JSON with JSONPath expressions and interactively explore paths."
      icon={Search}
    >
      <ActionBar>
        <button className="btn btn-ghost" onClick={() => { handleInputChange(sampleNestedJson); }}>
          <FileText size={16} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => { setInput(''); setParsed(null); setQuery(''); setQueryResults(null); setParseError(''); setQueryError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
      </ActionBar>

      <div className="path-query-bar">
        <input
          type="text"
          className="path-query-input"
          placeholder="Enter JSONPath query (e.g. $.company.departments[*].name)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
        />
        <button className="btn btn-primary" onClick={handleQuery}>
          <Search size={16} /> Query
        </button>
      </div>

      {queryError && <div className="error-banner">{queryError}</div>}

      {queryResults && (
        <div className="query-results">
          <div className="query-results-header">{queryResults.length} result(s) found</div>
          {queryResults.map((r, i) => (
            <div key={i} className="query-result-item">
              <span className="query-result-path">{r.path}</span>
              <pre className="query-result-value">{JSON.stringify(r.value, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      <div className="pathfinder-layout">
        <div className="panel">
          <div className="panel-header">JSON Input</div>
          <CodeEditor value={input} onChange={handleInputChange} placeholder="Paste your JSON here..." height="450px" />
          {parseError && <div className="error-banner" style={{ marginTop: '0.5rem' }}>{parseError}</div>}
        </div>
        <div className="panel">
          <div className="panel-header">Path Explorer <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>(click any node to copy its path)</span></div>
          <div className="path-tree">
            {parsed ? (
              <TreeNode value={parsed} path="$" />
            ) : (
              <div className="tree-placeholder">Paste valid JSON to explore paths</div>
            )}
          </div>
        </div>
      </div>
      <SeoContent 
        title="Free JSONPath Evaluator & Finder"
        description={[
          "Navigating deeply nested JSON payloads to find specific data points can be incredibly frustrating. Our JSON Path Finder allows you to write JSONPath queries and instantly visualize the extracted data.",
          "Perfect for developers writing automated API tests, debugging complex webhook payloads, or extracting nested properties without writing custom parser scripts."
        ]}
        features={[
          { title: "Live Evaluation", desc: "Type your JSONPath query (e.g., '$.users[*].email') and see the results instantly." },
          { title: "Interactive Explorer", desc: "Don't know the path? Just click through our interactive tree viewer on the left, and the correct JSONPath will be automatically generated for you!" },
          { title: "Zero Data Leakage", desc: "Your JSON data is parsed and evaluated entirely inside your browser. Nothing is ever uploaded to a server." }
        ]}
        faq={[
          { q: "What is JSONPath?", a: "JSONPath is a standardized query language for JSON. Similar to how XPath is used to extract data from XML documents, JSONPath allows you to extract specific elements from a JSON structure." },
          { q: "How do I find a path without writing code?", a: "Use the interactive 'Tree Explorer' tab. Expand the nodes to find your desired data, click on the value, and the exact JSONPath will be copied to your clipboard!" }
        ]}
      />
    </ToolLayout>
  );
};

export default PathFinder;
