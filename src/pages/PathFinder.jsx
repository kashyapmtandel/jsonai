import { useState, useMemo, useCallback } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { Target, Search, Check, FileText, Trash2, ChevronRight, ChevronDown, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { queryJsonPath } from '../utils/jsonPath';
import { sampleNestedJson } from '../utils/sampleData';
import { useClipboard } from '../hooks/useClipboard';
import './PathFinder.css';

const TypeBadge = ({ type }) => {
  const colors = {
    object: '#6366f1', array: '#06b6d4', string: '#22c55e',
    number: '#f59e0b', boolean: '#f97316', null: '#64748b',
  };
  return (
    <span className="type-badge" style={{ color: colors[type] || '#94a3b8' }}>
      {type === 'object' ? 'obj' : type === 'array' ? 'arr' : type === 'boolean' ? 'bool' : type}
    </span>
  );
};

const TreeNode = ({ name, value, path, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const { copy, copied } = useClipboard();
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const isExpandable = type === 'object' || type === 'array';
  const children = isExpandable
    ? (type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value))
    : [];
  const jsonPath = path || '$';

  const renderValue = () => {
    if (type === 'string')  return <span className="tree-value tree-string">"{value}"</span>;
    if (type === 'number')  return <span className="tree-value tree-number">{value}</span>;
    if (type === 'boolean') return <span className="tree-value tree-boolean">{String(value)}</span>;
    if (type === 'null')    return <span className="tree-value tree-null">null</span>;
    if (type === 'array')   return <span className="tree-count">[{value.length} items]</span>;
    if (type === 'object')  return <span className="tree-count">{'{' + Object.keys(value).length + ' keys}'}</span>;
    return null;
  };

  return (
    <div className="tree-node">
      <div
        className="tree-row"
        onClick={() => copy(jsonPath)}
        title={`Click to copy path: ${jsonPath}`}
      >
        <span style={{ width: depth * 20 + 'px', flexShrink: 0 }} />
        {isExpandable ? (
          <button className="tree-toggle" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="tree-toggle-placeholder" />
        )}
        {name !== undefined && <span className="tree-key">{typeof name === 'number' ? `[${name}]` : name}</span>}
        {name !== undefined && <span className="tree-colon">:</span>}
        {renderValue()}
        <TypeBadge type={type} />
        <span className={`tree-path-label ${copied ? 'copied' : ''}`}>
          {copied ? <><Check size={10} /> Copied!</> : jsonPath}
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
              <TreeNode key={childPath} name={key} value={val} path={childPath} depth={depth + 1} />
            );
          })}
        </div>
      )}
    </div>
  );
};

const PathFinder = () => {
  const [input, setInput]               = useState('');
  const [query, setQuery]               = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [queryError, setQueryError]     = useState('');
  const [parsed, setParsed]             = useState(null);
  const [parseError, setParseError]     = useState('');

  // ─── Smart path suggestions ──────────────────────────────────────────────
  const suggestions = useMemo(() => {
    if (!parsed) return [];
    const hints = [];
    const isRoot = (v) => v === parsed;

    // Root is array
    if (Array.isArray(parsed)) {
      hints.push({ label: 'First item', path: '$[0]' });
      if (parsed.length > 1) hints.push({ label: 'Last item', path: `$[${parsed.length - 1}]` });
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        const keys = Object.keys(parsed[0]);
        for (const k of ['id', 'name', 'email', 'title', 'status', 'type']) {
          if (keys.includes(k)) hints.push({ label: `All ${k}s`, path: `$[*].${k}` });
        }
        // Filter suggestion if status/type exists
        if (keys.includes('status'))
          hints.push({ label: 'Filter by status', path: "$[?(@.status=='active')]" });
        if (keys.includes('type'))
          hints.push({ label: 'Filter by type', path: "$[?(@.type=='admin')]" });
      }
    }

    // Root is object
    if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
      const rootKeys = Object.keys(parsed);
      hints.push({ label: 'All root keys', path: '$.*' });

      // Find arrays in root
      for (const k of rootKeys) {
        if (Array.isArray(parsed[k]) && parsed[k].length > 0) {
          hints.push({ label: `${k} count`, path: `$.${k}.length` });
          hints.push({ label: `All ${k}`, path: `$.${k}[*]` });
          const first = parsed[k][0];
          if (typeof first === 'object' && first !== null) {
            const itemKeys = Object.keys(first);
            for (const ik of ['id', 'name', 'email', 'title']) {
              if (itemKeys.includes(ik)) {
                hints.push({ label: `${k} → ${ik}s`, path: `$.${k}[*].${ik}` });
              }
            }
          }
        }
      }

      // Find deeply nested paths (up to depth 3)
      const findDeep = (obj, path, depth) => {
        if (depth > 3 || typeof obj !== 'object' || obj === null) return;
        for (const [k, v] of Object.entries(obj)) {
          const p = Array.isArray(obj) ? `${path}[${k}]` : `${path}.${k}`;
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            findDeep(v, p, depth + 1);
          } else if (depth >= 2 && typeof v !== 'object') {
            // Suggest deep leaf values
            hints.push({ label: `Deep: ${k}`, path: p });
            return; // just one deep suggestion
          }
        }
      };
      findDeep(parsed, '$', 0);
    }

    // Deduplicate by path and limit to 8
    const seen = new Set();
    return hints.filter(h => {
      if (seen.has(h.path)) return false;
      seen.add(h.path);
      return true;
    }).slice(0, 8);
  }, [parsed]);

  const inputStatus = useMemo(() => {
    const t = input.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [input]);

  const inputStats = useMemo(() => {
    if (!input) return null;
    return { lines: input.split('\n').length, chars: input.length };
  }, [input]);

  const handleInputChange = useCallback((val) => {
    setInput(val);
    if (!val.trim()) { setParsed(null); setParseError(''); return; }
    try { setParsed(JSON.parse(val)); setParseError(''); }
    catch (e) { setParsed(null); setParseError(e.message); }
  }, []);

  const handleQuery = useCallback(() => {
    if (!query.trim() || !parsed) return;
    try {
      setQueryResults(queryJsonPath(parsed, query));
      setQueryError('');
    } catch (e) {
      setQueryError(e.message);
      setQueryResults(null);
    }
  }, [query, parsed]);

  return (
    <ToolLayout
      title="Path Finder"
      description="Query JSON with JSONPath expressions and interactively explore paths."
      icon={Target}
    >
      <ActionBar>
        <button className="btn btn-ghost" onClick={() => handleInputChange(sampleNestedJson)}>
          <FileText size={15} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => {
          handleInputChange('');
          setQuery(''); setQueryResults(null); setQueryError('');
        }}>
          <Trash2 size={15} /> Clear
        </button>
      </ActionBar>

      {/* Status bar */}
      <div className="pf-status-bar">
        <div className="pf-status-left">
          {!input.trim() ? (
            <span className="pf-status-idle">Paste JSON to explore paths — click any node to copy its JSONPath</span>
          ) : inputStatus?.valid ? (
            <span className="pf-status-valid"><CheckCircle size={13} /> Valid JSON — {Object.keys(parsed || {}).length > 0 ? 'tree ready' : 'ready'}</span>
          ) : (
            <span className="pf-status-invalid"><XCircle size={13} /> {inputStatus?.message}</span>
          )}
        </div>
        {inputStats && (
          <div className="pf-meta-stats">
            <span>{inputStats.lines} lines</span>
            <span className="pf-dot">·</span>
            <span>{inputStats.chars.toLocaleString()} chars</span>
          </div>
        )}
      </div>

      {/* Smart path suggestions */}
      {suggestions.length > 0 && (
        <div className="pf-suggestions">
          <div className="pf-suggestions-header">
            <Sparkles size={13} />
            <span>Smart Suggestions</span>
          </div>
          <div className="pf-suggestion-chips">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="pf-suggestion-chip"
                onClick={() => { setQuery(s.path); }}
                title={`Set query to: ${s.path}`}
              >
                <span className="pf-chip-label">{s.label}</span>
                <code className="pf-chip-path">{s.path}</code>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* JSONPath query bar */}
      <div className="path-query-bar">
        <div className="path-query-wrap">
          <span className="path-query-prefix">$</span>
          <input
            type="text"
            className="path-query-input"
            placeholder=".company.departments[*].name  (press Enter to run)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          />
        </div>
        <button className="btn btn-primary" onClick={handleQuery} disabled={!parsed || !query.trim()}>
          <Search size={15} /> Query
        </button>
      </div>

      {queryError && <div className="error-banner">{queryError}</div>}

      {/* Query results */}
      {queryResults && (
        <div className="query-results">
          <div className="query-results-header">
            {queryResults.length === 0
              ? 'No results matched your query'
              : `${queryResults.length} result${queryResults.length !== 1 ? 's' : ''} found`}
          </div>
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
          <div className="panel-header">
            Path Explorer
            <span className="pf-panel-hint">click node to copy path</span>
          </div>
          <div className="path-tree">
            {parsed ? (
              <TreeNode value={parsed} path="$" />
            ) : (
              <div className="tree-placeholder">
                <Target size={28} strokeWidth={1.3} />
                <p>Paste valid JSON to explore paths</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SeoContent
        title="Free JSONPath Evaluator & Path Finder"
        description={[
          'Query deeply nested JSON with JSONPath expressions and see instant results. Or click through the interactive tree to auto-generate the correct path — no manual path writing needed.',
          'Perfect for developers writing API tests, debugging webhook payloads, or finding deeply nested values without writing custom code.',
        ]}
        features={[
          { title: 'JSONPath Query', desc: 'Type a JSONPath expression (e.g. $.users[*].email) and see matching values instantly.' },
          { title: 'Interactive Tree', desc: 'Click any node in the tree to copy its full JSONPath to your clipboard automatically.' },
          { title: 'Live Validation', desc: 'Live status bar shows whether your JSON is valid before you try to query it.' },
          { title: 'Zero Data Leakage', desc: 'All parsing and querying happens entirely in your browser — nothing is uploaded.' },
        ]}
        faq={[
          { q: 'What is JSONPath?', a: 'JSONPath is a query language for JSON similar to XPath for XML. It lets you extract specific values from nested JSON structures using expressions like $.users[0].name.' },
          { q: 'How do I find a path without writing code?', a: 'Paste your JSON and click through the tree on the right. Every node shows its full JSONPath and copies it on click.' },
        ]}
      />
    </ToolLayout>
  );
};

export default PathFinder;
