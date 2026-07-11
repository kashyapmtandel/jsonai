import { useState, useMemo, useCallback, useRef } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import ActionBar from '../components/ActionBar';
import CopyButton from '../components/CopyButton';
import SeoContent from '../components/SeoContent';
import { GitCompare, Trash2, FileText, RefreshCw, Upload, CheckCircle, XCircle, ArrowLeftRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { computeDiff, formatDiffAsHtml, getDiffStats, generateDiffSummary } from '../utils/jsonDiff';
import { sampleJson } from '../utils/sampleData';
import './DiffTool.css';

const sampleRight = JSON.stringify(
  {
    ...JSON.parse(sampleJson),
    version: '2.0.0',
    description: 'Updated JSON toolkit with more features',
    features: [
      'Format & Beautify', 'Validate', 'Convert', 'Diff & Compare',
      'Path Finder', 'Schema Generator', 'Tree Viewer', 'AI Assistant',
      'Escape & Unescape', 'NEW: Base64 Encoder',
    ],
    stats: { tools: 10, users: 75000, rating: 4.95 },
  },
  null, 2
);

const DiffTool = () => {
  const [left, setLeft]     = useState('');
  const [right, setRight]   = useState('');
  const [diffHtml, setDiffHtml] = useState('');
  const [stats, setStats]   = useState(null);
  const [summary, setSummary] = useState([]);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [error, setError]   = useState('');
  const leftFileRef  = useRef(null);
  const rightFileRef = useRef(null);

  // Live validation status for both panels
  const leftStatus = useMemo(() => {
    const t = left.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [left]);

  const rightStatus = useMemo(() => {
    const t = right.trim();
    if (!t) return null;
    try { JSON.parse(t); return { valid: true }; }
    catch (e) { return { valid: false, message: e.message }; }
  }, [right]);

  const handleCompare = useCallback(() => {
    if (!left.trim() || !right.trim()) {
      setError('Please provide JSON in both panels.');
      return;
    }
    try {
      const delta = computeDiff(left, right);
      setDiffHtml(formatDiffAsHtml(delta));
      setStats(getDiffStats(delta));
      setSummary(generateDiffSummary(delta));
      setSummaryOpen(true);
      setError('');
    } catch (e) {
      setError(e.message);
      setDiffHtml('');
      setStats(null);
      setSummary([]);
    }
  }, [left, right]);

  const loadSample = useCallback(() => {
    setLeft(sampleJson);
    setRight(sampleRight);
    setError('');
    setDiffHtml('');
    setStats(null);
  }, []);

  const handleSwap = useCallback(() => {
    setLeft(right);
    setRight(left);
    setDiffHtml('');
    setStats(null);
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeft(''); setRight(''); setDiffHtml(''); setStats(null); setSummary([]); setError('');
  }, []);

  const handleFileUpload = (side) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      side === 'left' ? setLeft(ev.target.result) : setRight(ev.target.result);
      setDiffHtml(''); setStats(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const StatusPill = ({ status }) => {
    if (!status) return <span className="diff-status-idle">Paste JSON</span>;
    if (status.valid) return <span className="diff-status-valid"><CheckCircle size={12} /> Valid</span>;
    return <span className="diff-status-invalid"><XCircle size={12} /> Invalid</span>;
  };

  return (
    <ToolLayout
      title="JSON Diff"
      description="Compare two JSON documents with semantic diff highlighting."
      icon={GitCompare}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleCompare}>
          <GitCompare size={15} /> Compare
        </button>
        <button className="btn btn-ghost" onClick={loadSample}>
          <FileText size={15} /> Sample
        </button>
        <button className="btn btn-secondary" onClick={handleSwap}>
          <RefreshCw size={15} /> Swap
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>
          <Trash2 size={15} /> Clear
        </button>
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats bar after compare */}
      {stats && (
        <div className="diff-summary-bar">
          <div className="diff-summary-left">
            {stats.total === 0 ? (
              <span className="diff-identical"><CheckCircle size={14} /> Identical — no differences found</span>
            ) : (
              <>
                <span className="diff-stat diff-stat--added">+{stats.added} added</span>
                <span className="diff-stat diff-stat--removed">−{stats.removed} removed</span>
                <span className="diff-stat diff-stat--changed">~{stats.changed} changed</span>
              </>
            )}
          </div>
          {stats.total > 0 && (
            <span className="diff-total">{stats.total} difference{stats.total !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {/* Smart Change Summary */}
      {summary.length > 0 && (
        <div className="diff-smart-summary">
          <button
            className="diff-smart-summary-toggle"
            onClick={() => setSummaryOpen(!summaryOpen)}
          >
            <Sparkles size={14} />
            <span>Smart Change Summary</span>
            <span className="diff-smart-count">{summary.length} change{summary.length !== 1 ? 's' : ''}</span>
            {summaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {summaryOpen && (
            <ul className="diff-smart-list">
              {summary.map((item, i) => (
                <li key={i} className={`diff-smart-item diff-smart-item--${item.type}`}>
                  <span className="diff-smart-bullet">
                    {item.type === 'added' ? '+' : item.type === 'removed' ? '−' : '~'}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="diff-panels">
        {/* Left */}
        <div className="panel">
          <div className="panel-header">
            <span>Original</span>
            <div className="diff-panel-meta">
              <StatusPill status={leftStatus} />
              <button className="btn btn-ghost btn-xs" onClick={() => leftFileRef.current?.click()} title="Upload JSON file">
                <Upload size={12} />
              </button>
              <input ref={leftFileRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleFileUpload('left')} />
            </div>
          </div>
          <CodeEditor value={left} onChange={setLeft} placeholder="Paste original JSON..." height="380px" />
        </div>

        {/* Right */}
        <div className="panel">
          <div className="panel-header">
            <span>Modified</span>
            <div className="diff-panel-meta">
              <StatusPill status={rightStatus} />
              <button className="btn btn-ghost btn-xs" onClick={() => rightFileRef.current?.click()} title="Upload JSON file">
                <Upload size={12} />
              </button>
              <input ref={rightFileRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleFileUpload('right')} />
            </div>
          </div>
          <CodeEditor value={right} onChange={setRight} placeholder="Paste modified JSON..." height="380px" />
        </div>
      </div>

      {/* Diff result */}
      {diffHtml && (
        <div className="diff-result-wrap">
          <div className="diff-result-header">
            <span>Diff Result</span>
            <div className="diff-legend">
              <span className="diff-legend-item diff-legend--added">Added</span>
              <span className="diff-legend-item diff-legend--removed">Removed</span>
              <span className="diff-legend-item diff-legend--changed">Changed</span>
            </div>
          </div>
          <div className="diff-result" dangerouslySetInnerHTML={{ __html: diffHtml }} />
        </div>
      )}

      {!diffHtml && !error && (left.trim() || right.trim()) && (
        <div className="diff-empty-result">
          <ArrowLeftRight size={24} strokeWidth={1.3} />
          <p>Fill both panels and click <strong>Compare</strong></p>
        </div>
      )}

      <SeoContent
        title="Free Online JSON Diff & Compare Tool"
        description={[
          'Our Free JSON Diff Tool instantly compares two JSON objects and highlights every added, removed, and modified field with colour-coded highlighting.',
          'Whether you are debugging a broken API response, comparing config files, or reviewing a merge conflict, the visual diff highlights every change precisely. 100% client-side — your data never leaves the browser.',
        ]}
        features={[
          { title: 'Side-by-Side Comparison', desc: 'View original and modified JSON next to each other with colour-coded highlights for every change.' },
          { title: 'Deep Object Comparison', desc: 'Detects changes deep inside nested arrays and complex objects, regardless of formatting.' },
          { title: 'Live Validation', desc: 'Each panel shows a live Valid/Invalid status so you catch JSON errors before comparing.' },
          { title: 'File Upload', desc: 'Upload .json files directly into either panel without copying and pasting.' },
          { title: 'Swap Panels', desc: 'One-click swap reverses Original and Modified so you can compare in both directions.' },
          { title: 'Secure Processing', desc: 'Everything runs in your browser. No JSON is sent to any server.' },
        ]}
        faq={[
          { q: 'How do I compare two JSON files?', a: 'Paste your first JSON in the Original panel and second JSON in the Modified panel, then click Compare.' },
          { q: 'What do the colours mean?', a: 'Green = added in the modified version. Red = removed from the original. Yellow = value was changed.' },
          { q: 'Can I upload JSON files?', a: 'Yes — click the upload icon in either panel header to load a .json file directly.' },
        ]}
      />
    </ToolLayout>
  );
};

export default DiffTool;
