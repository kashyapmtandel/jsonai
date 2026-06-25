import { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { GitCompare, Trash2, FileText, RefreshCw } from 'lucide-react';
import { computeDiff, formatDiffAsHtml, getDiffStats } from '../utils/jsonDiff';
import { sampleJson } from '../utils/sampleData';
import './DiffTool.css';

const sampleRight = JSON.stringify(
  {
    ...JSON.parse(sampleJson),
    version: '2.0.0',
    description: 'Updated JSON toolkit with more features',
    features: [
      'Format & Beautify',
      'Validate',
      'Convert',
      'Diff & Compare',
      'Path Finder',
      'Schema Generator',
      'Tree Editor',
      'AI Assistant',
      'Escape & Unescape',
      'NEW: Base64 Encoder',
    ],
    stats: { tools: 10, users: 75000, rating: 4.95 },
  },
  null,
  2
);

const DiffTool = () => {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diffHtml, setDiffHtml] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handleCompare = () => {
    if (!left.trim() || !right.trim()) {
      setError('Please provide JSON in both panels.');
      return;
    }
    try {
      const delta = computeDiff(left, right);
      setDiffHtml(formatDiffAsHtml(delta));
      setStats(getDiffStats(delta));
      setError('');
    } catch (e) {
      setError(e.message);
      setDiffHtml('');
      setStats(null);
    }
  };

  const loadSample = () => {
    setLeft(sampleJson);
    setRight(sampleRight);
    setError('');
  };

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
    setDiffHtml('');
    setStats(null);
  };

  return (
    <ToolLayout
      title="JSON Diff"
      description="Compare two JSON documents with semantic diff highlighting."
      icon={GitCompare}
    >
      <ActionBar>
        <button className="btn btn-primary" onClick={handleCompare}>
          <GitCompare size={16} /> Compare
        </button>
        <button className="btn btn-ghost" onClick={loadSample}>
          <FileText size={16} /> Sample
        </button>
        <button className="btn btn-secondary" onClick={handleSwap}>
          <RefreshCw size={16} /> Swap
        </button>
        <button className="btn btn-ghost" onClick={() => { setLeft(''); setRight(''); setDiffHtml(''); setStats(null); setError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="diff-panels">
        <div className="panel">
          <div className="panel-header">Left (Original)</div>
          <CodeEditor value={left} onChange={setLeft} placeholder="Paste original JSON..." height="350px" />
        </div>
        <div className="panel">
          <div className="panel-header">Right (Modified)</div>
          <CodeEditor value={right} onChange={setRight} placeholder="Paste modified JSON..." height="350px" />
        </div>
      </div>

      {stats && (
        <div className="diff-stats">
          <span className="stat stat-added">+{stats.added} added</span>
          <span className="stat stat-removed">-{stats.removed} removed</span>
          <span className="stat stat-changed">~{stats.changed} changed</span>
          {stats.total === 0 && <span className="stat stat-identical">✓ Identical</span>}
        </div>
      )}

      {diffHtml && (
        <div
          className="diff-result"
          dangerouslySetInnerHTML={{ __html: diffHtml }}
        />
      )}

      <SeoContent 
        title="Free Online JSON Diff & Compare Tool"
        description={[
          "Our Free JSON Diff Tool allows you to instantly compare two JSON objects and find the exact differences between them.",
          "Whether you are debugging a broken API response, comparing configuration files, or reviewing a git merge conflict, our visual Diff tool highlights every added, removed, and modified line perfectly."
        ]}
        features={[
          { title: "Side-by-Side Comparison", desc: "View the original JSON and the modified JSON next to each other with perfect line-matching and color-coded highlights." },
          { title: "Deep Object Comparison", desc: "Detects changes deep within nested arrays and complex objects without getting confused by formatting." },
          { title: "Secure Processing", desc: "We compare your JSON strings directly inside your browser. No data is transmitted to our servers." }
        ]}
        faq={[
          { q: "How do I compare two JSON files?", a: "Paste your first JSON payload into the 'Original JSON' panel on the left, and your second JSON payload into the 'Modified JSON' panel on the right. The differences will be highlighted automatically." },
          { q: "What do the colors mean?", a: "Green highlighting indicates lines that were added in the modified version. Red highlighting indicates lines that were removed from the original version. Yellow usually indicates a modified value." }
        ]}
      />
    </ToolLayout>
  );
};

export default DiffTool;
