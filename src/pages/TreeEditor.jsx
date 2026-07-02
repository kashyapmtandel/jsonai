import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import {
  TreePine, FileText, Trash2, ChevronRight, ChevronDown,
  ChevronsDown, ChevronsUp, BarChart2, Upload, Search, X,
  Copy, CheckCircle, XCircle,
} from 'lucide-react';
import { sampleJson } from '../utils/sampleData';
import './TreeEditor.css';

// ─── JSON path builder ────────────────────────────────────────────────────────
const buildPath = (ancestors) =>
  '$' + ancestors.map(a => (typeof a === 'number' ? `[${a}]` : `.${a}`)).join('');

// ─── Stats ────────────────────────────────────────────────────────────────────
const computeStats = (data) => {
  let objects = 0, arrays = 0, primitives = 0, depth = 0;
  const walk = (v, d = 0) => {
    if (d > depth) depth = d;
    if (v === null || typeof v !== 'object') { primitives++; return; }
    if (Array.isArray(v)) { arrays++; v.forEach(c => walk(c, d + 1)); }
    else { objects++; Object.values(v).forEach(c => walk(c, d + 1)); }
  };
  walk(data);
  return { objects, arrays, primitives, depth };
};

// ─── Check if node matches search ────────────────────────────────────────────
const nodeMatchesSearch = (name, value, query) => {
  if (!query) return false;
  const q = query.toLowerCase();
  if (String(name).toLowerCase().includes(q)) return true;
  if (typeof value === 'string' && value.toLowerCase().includes(q)) return true;
  if (typeof value === 'number' && String(value).includes(q)) return true;
  return false;
};

// ─── Tree Node ────────────────────────────────────────────────────────────────
const TreeNode = ({ name, value, depth = 0, forceExpand, searchQuery, ancestors = [], onCopyPath }) => {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const isExpandable = type === 'object' || type === 'array';
  const [expanded, setExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const isOpen = forceExpand !== undefined ? forceExpand : expanded;
  const currentPath = buildPath([...ancestors, ...(name !== undefined ? [name] : [])]);

  const childEntries = isExpandable
    ? (type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value))
    : [];
  const isEmpty = childEntries.length === 0;

  const isHighlighted = searchQuery && nodeMatchesSearch(name, value, searchQuery);

  const handleToggle = () => {
    if (forceExpand === undefined) setExpanded(e => !e);
  };

  const handleCopyValue = (e) => {
    e.stopPropagation();
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const showExpanded = forceExpand !== undefined ? forceExpand : expanded;

  const renderSummary = () => {
    if (type === 'array') return <span className="tv-summary">({value.length} items)</span>;
    if (type === 'object') return <span className="tv-summary">({Object.keys(value).length} keys)</span>;
    return null;
  };

  const renderValue = () => {
    if (type === 'string') return <span className="tv-val tv-str">"{value}"</span>;
    if (type === 'number') return <span className="tv-val tv-num">{value}</span>;
    if (type === 'boolean') return <span className="tv-val tv-bool">{String(value)}</span>;
    if (type === 'null') return <span className="tv-val tv-null">null</span>;
    return null;
  };

  return (
    <div className={`tv-node${isHighlighted ? ' tv-node--match' : ''}`}>
      <div
        className={`tv-row ${isExpandable && !isEmpty ? 'tv-clickable' : ''}`}
        style={{ paddingLeft: depth * 18 + 'px' }}
        onClick={isExpandable && !isEmpty ? handleToggle : undefined}
        title={currentPath}
      >
        {/* Toggle icon */}
        <span className="tv-toggle-icon">
          {isExpandable && !isEmpty
            ? (showExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
            : <span className="tv-toggle-ph" />}
        </span>

        {/* Key */}
        {name !== undefined && (
          <>
            <span className="tv-key">{typeof name === 'number' ? `[${name}]` : `"${name}"`}</span>
            <span className="tv-colon">: </span>
          </>
        )}

        {/* Value or bracket + summary */}
        {isExpandable ? (
          <>
            <span className="tv-bracket">{type === 'array' ? '[' : '{'}</span>
            {!showExpanded && !isEmpty && renderSummary()}
            {isEmpty && <span className="tv-bracket">{type === 'array' ? ']' : '}'}</span>}
          </>
        ) : renderValue()}

        {/* Copy button (shows on hover via CSS) */}
        <button
          className={`tv-copy-btn${copied ? ' tv-copy-btn--done' : ''}`}
          onClick={handleCopyValue}
          title={`Copy value — path: ${currentPath}`}
        >
          {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
        </button>
      </div>

      {/* Children */}
      {isExpandable && !isEmpty && showExpanded && (
        <div className="tv-children">
          {childEntries.map(([k, v]) => (
            <TreeNode
              key={k}
              name={k}
              value={v}
              depth={depth + 1}
              forceExpand={forceExpand}
              searchQuery={searchQuery}
              ancestors={[...ancestors, ...(name !== undefined ? [name] : [])]}
              onCopyPath={onCopyPath}
            />
          ))}
          <div className="tv-row" style={{ paddingLeft: depth * 18 + 'px' }}>
            <span className="tv-toggle-ph" />
            <span className="tv-bracket">{type === 'array' ? ']' : '}'}</span>
          </div>
        </div>
      )}

      {/* Collapsed summary bracket */}
      {isExpandable && !isEmpty && !showExpanded && (
        <span className="tv-bracket-inline">{type === 'array' ? ']' : '}'}</span>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TreeEditor = () => {
  const [codeValue, setCodeValue] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState('');
  const [forceExpand, setForceExpand] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Live validation status (driven by codeValue)
  const liveStatus = useMemo(() => {
    const t = codeValue.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [codeValue]);

  // Live input stats
  const liveStats = useMemo(() => {
    if (!codeValue) return null;
    return {
      lines: codeValue.split('\n').length,
      chars: codeValue.length,
      kb: (new Blob([codeValue]).size / 1024).toFixed(1),
    };
  }, [codeValue]);

  // Auto-parse on input change (debounced 400ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const t = codeValue.trim();
    if (!t) { setJsonData(null); setError(''); return; }
    debounceRef.current = setTimeout(() => {
      try {
        setJsonData(JSON.parse(t));
        setError('');
        setForceExpand(undefined);
      } catch (e) {
        setJsonData(null);
        setError(e.message);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [codeValue]);

  const handleClear = useCallback(() => {
    setCodeValue(''); setJsonData(null); setError('');
    setForceExpand(undefined); setSearchQuery('');
  }, []);

  const handleSample = useCallback(() => {
    setCodeValue(sampleJson); setError(''); setSearchQuery('');
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCodeValue(ev.target.result); setSearchQuery(''); };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const stats = jsonData !== null ? computeStats(jsonData) : null;

  return (
    <ToolLayout
      title="JSON Tree Viewer"
      description="Visualize, search, and explore JSON as an interactive collapsible tree."
      icon={TreePine}
    >
      {/* ── Toolbar ── */}
      <ActionBar>
        <button className="btn btn-ghost" onClick={handleSample}>
          <FileText size={15} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} /> Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".json,.txt,application/json"
          style={{ display: 'none' }} onChange={handleFileUpload} />
        <CopyButton text={codeValue} />
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={15} /> Clear
        </button>
      </ActionBar>

      {/* ── Status bar ── */}
      <div className="tv-status-bar">
        <div className="tv-status-left">
          {!codeValue.trim() && (
            <span className="tv-status-idle">Paste JSON — tree renders automatically</span>
          )}
          {liveStatus?.valid === true && (
            <span className="tv-status-valid"><CheckCircle size={13} /> Valid JSON</span>
          )}
          {liveStatus?.valid === false && (
            <span className="tv-status-invalid"><XCircle size={13} /> {liveStatus.message}</span>
          )}
        </div>
        {liveStats && (
          <div className="tv-meta-stats">
            <span>{liveStats.lines} lines</span>
            <span className="tv-stats-sep">·</span>
            <span>{liveStats.chars.toLocaleString()} chars</span>
            <span className="tv-stats-sep">·</span>
            <span>{liveStats.kb} KB</span>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tv-layout">
        {/* ── Left: JSON Input ── */}
        <div className="panel">
          <div className="panel-header">JSON Input</div>
          <CodeEditor
            value={codeValue}
            onChange={setCodeValue}
            placeholder="Paste JSON here — tree updates automatically..."
            height="490px"
          />
        </div>

        {/* ── Right: Tree View ── */}
        <div className="panel">
          <div className="panel-header">
            <span>Tree View</span>
            {jsonData !== null && (
              <div className="tv-controls">
                <button className="btn btn-ghost btn-xs" onClick={() => setForceExpand(true)} title="Expand all">
                  <ChevronsDown size={13} /> Expand
                </button>
                <button className="btn btn-ghost btn-xs" onClick={() => setForceExpand(false)} title="Collapse all">
                  <ChevronsUp size={13} /> Collapse
                </button>
                <button className="btn btn-ghost btn-xs" onClick={() => setForceExpand(undefined)}>
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          {jsonData !== null && (
            <div className="tv-search-wrap">
              <Search size={13} className="tv-search-icon" />
              <input
                className="tv-search-input"
                type="text"
                placeholder="Search keys and values..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="tv-search-clear" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Stats bar */}
          {stats && (
            <div className="tv-stats">
              <BarChart2 size={13} />
              <span><strong>{stats.objects}</strong> objects</span>
              <span className="tv-stats-sep">·</span>
              <span><strong>{stats.arrays}</strong> arrays</span>
              <span className="tv-stats-sep">·</span>
              <span><strong>{stats.primitives}</strong> values</span>
              <span className="tv-stats-sep">·</span>
              <span>depth <strong>{stats.depth}</strong></span>
            </div>
          )}

          {/* Tree container */}
          <div className="te-tree-container">
            {jsonData !== null ? (
              <TreeNode
                value={jsonData}
                depth={0}
                forceExpand={forceExpand}
                searchQuery={searchQuery}
                ancestors={[]}
              />
            ) : (
              <div className="te-placeholder">
                <TreePine size={32} strokeWidth={1.2} />
                <p>Paste JSON in the left panel — <br />the tree renders automatically</p>
              </div>
            )}
          </div>

          {/* Color legend */}
          {jsonData !== null && (
            <div className="tv-legend">
              <span className="tv-legend-item"><span className="tv-key tv-legend-swatch">"key"</span> Keys</span>
              <span className="tv-legend-item"><span className="tv-val tv-str tv-legend-swatch">"str"</span> String</span>
              <span className="tv-legend-item"><span className="tv-val tv-num tv-legend-swatch">42</span> Number</span>
              <span className="tv-legend-item"><span className="tv-val tv-bool tv-legend-swatch">true</span> Boolean</span>
              <span className="tv-legend-item"><span className="tv-val tv-null tv-legend-swatch">null</span> Null</span>
            </div>
          )}
        </div>
      </div>

      <SeoContent
        title="JSON Tree Viewer — Visualize & Search JSON Structure Online"
        description={[
          'The JSON Tree Viewer transforms raw JSON text into an interactive, collapsible tree. Paste JSON and the tree renders automatically — no button click required. Click any node to expand or collapse it.',
          'Search across all keys and values, copy individual node values with one click, and see the full JSON path on hover. Supports file upload, Expand All / Collapse All, and a stats bar showing total objects, arrays, and values.',
        ]}
        features={[
          { title: 'Auto-Render on Paste', desc: 'The tree updates automatically as you type or paste — no "View Tree" button needed.' },
          { title: 'Search Keys & Values', desc: 'Filter and highlight matching nodes across the entire tree by typing in the search box.' },
          { title: 'Copy Node Values', desc: 'Hover any node and click the copy icon to copy that node\'s value to clipboard instantly.' },
          { title: 'JSON Path on Hover', desc: 'Hover any row to see its full JSONPath (e.g. $.author.name) in the tooltip.' },
          { title: 'Stats Overview', desc: 'A stats bar shows total objects, arrays, primitive values, and nesting depth.' },
          { title: 'File Upload', desc: 'Upload any .json file directly and the tree renders immediately.' },
        ]}
        faq={[
          { q: 'Does the tree update automatically?', a: 'Yes — the tree re-renders automatically 400ms after you stop typing or pasting, with no button click required.' },
          { q: 'Can I search for a specific key or value?', a: 'Yes — type in the search box above the tree to highlight all matching keys and values.' },
          { q: 'How do I copy a node\'s value?', a: 'Hover any row in the tree and click the copy icon that appears on the right side. It copies the node\'s value to your clipboard.' },
          { q: 'What does the JSON Path tooltip show?', a: 'When you hover a row, a tooltip shows the full JSONPath to that node, like $.users[0].email, which you can use with tools like jq or JSONPath expressions.' },
          { q: 'Is there a size limit?', a: 'The tool runs in your browser. Very large JSON (several MB) may impact performance. For huge files consider command-line tools like jq.' },
        ]}
      />
    </ToolLayout>
  );
};

export default TreeEditor;
