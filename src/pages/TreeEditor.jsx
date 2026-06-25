import { useState, useCallback } from 'react';
import ToolLayout from '../components/ToolLayout';
import CodeEditor from '../components/CodeEditor';
import CopyButton from '../components/CopyButton';
import ActionBar from '../components/ActionBar';
import SeoContent from '../components/SeoContent';
import { TreePine, FileText, Trash2, Download, ChevronRight, ChevronDown, Plus, X, ChevronsUpDown } from 'lucide-react';
import { sampleJson } from '../utils/sampleData';
import './TreeEditor.css';

const TypeBadge = ({ type }) => {
  const colors = {
    object: '#6366f1', array: '#06b6d4', string: '#22c55e',
    number: '#f59e0b', boolean: '#f97316', null: '#64748b',
  };
  const labels = { object: 'obj', array: 'arr', string: 'str', number: 'num', boolean: 'bool', null: 'null' };
  return <span className="te-type-badge" style={{ background: `${colors[type]}22`, color: colors[type] }}>{labels[type]}</span>;
};

const EditableTreeNode = ({ name, value, path, onUpdate, onDelete, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 3);
  const [editing, setEditing] = useState(null); // 'key' | 'value' | null
  const [editValue, setEditValue] = useState('');

  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const isExpandable = type === 'object' || type === 'array';
  const children = isExpandable ? (type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value)) : [];

  const startEditValue = () => {
    if (isExpandable) return;
    setEditing('value');
    setEditValue(type === 'string' ? value : JSON.stringify(value));
  };

  const commitEdit = () => {
    if (editing === 'value') {
      let newVal;
      const trimmed = editValue.trim();
      if (trimmed === 'null') newVal = null;
      else if (trimmed === 'true') newVal = true;
      else if (trimmed === 'false') newVal = false;
      else if (!isNaN(Number(trimmed)) && trimmed !== '') newVal = Number(trimmed);
      else newVal = editValue;
      onUpdate(path, newVal);
    }
    setEditing(null);
  };

  const handleChildUpdate = (childPath, newVal) => onUpdate(childPath, newVal);

  const handleChildDelete = (childPath) => onDelete(childPath);

  const addChild = () => {
    if (type === 'array') {
      const newArr = [...value, ''];
      onUpdate(path, newArr);
    } else if (type === 'object') {
      const key = `newKey${Object.keys(value).length}`;
      onUpdate(path, { ...value, [key]: '' });
    }
  };

  const renderValue = () => {
    if (editing === 'value') {
      return (
        <input
          className="te-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
          autoFocus
        />
      );
    }
    if (type === 'string') return <span className="te-val te-val-str" onDoubleClick={startEditValue}>"{value}"</span>;
    if (type === 'number') return <span className="te-val te-val-num" onDoubleClick={startEditValue}>{value}</span>;
    if (type === 'boolean') return <span className="te-val te-val-bool" onDoubleClick={startEditValue}>{String(value)}</span>;
    if (type === 'null') return <span className="te-val te-val-null" onDoubleClick={startEditValue}>null</span>;
    if (type === 'array') return <span className="te-count">[{value.length} items]</span>;
    if (type === 'object') return <span className="te-count">{'{' + Object.keys(value).length + ' keys}'}</span>;
    return null;
  };

  return (
    <div className="te-node">
      <div className="te-row">
        <span style={{ width: depth * 20 + 'px', flexShrink: 0 }} />
        {isExpandable ? (
          <button className="te-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span className="te-toggle-ph" />}
        {name !== undefined && (
          <span className="te-key">{typeof name === 'number' ? `[${name}]` : name}</span>
        )}
        {name !== undefined && <span className="te-colon">:</span>}
        {renderValue()}
        <TypeBadge type={type} />
        <div className="te-actions">
          {isExpandable && (
            <button className="te-action-btn" onClick={addChild} title="Add child">
              <Plus size={12} />
            </button>
          )}
          {path.length > 0 && (
            <button className="te-action-btn te-delete-btn" onClick={() => onDelete(path)} title="Delete">
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      {isExpandable && expanded && (
        <div className="te-children">
          {children.map(([key, val]) => {
            const childPath = [...path, key];
            return (
              <EditableTreeNode
                key={childPath.join('.')}
                name={key}
                value={val}
                path={childPath}
                onUpdate={handleChildUpdate}
                onDelete={handleChildDelete}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const TreeEditor = () => {
  const [jsonData, setJsonData] = useState(null);
  const [codeValue, setCodeValue] = useState('');
  const [error, setError] = useState('');

  const syncFromCode = useCallback((text) => {
    setCodeValue(text);
    if (!text.trim()) {
      setJsonData(null);
      setError('');
      return;
    }
    try {
      setJsonData(JSON.parse(text));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const syncFromTree = useCallback((newData) => {
    setJsonData(newData);
    setCodeValue(JSON.stringify(newData, null, 2));
    setError('');
  }, []);

  const handleUpdate = (path, newValue) => {
    if (path.length === 0) {
      syncFromTree(newValue);
      return;
    }
    const clone = JSON.parse(JSON.stringify(jsonData));
    let target = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]];
    }
    target[path[path.length - 1]] = newValue;
    syncFromTree(clone);
  };

  const handleDelete = (path) => {
    if (path.length === 0) return;
    const clone = JSON.parse(JSON.stringify(jsonData));
    let target = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]];
    }
    const key = path[path.length - 1];
    if (Array.isArray(target)) {
      target.splice(key, 1);
    } else {
      delete target[key];
    }
    syncFromTree(clone);
  };

  const handleDownload = () => {
    if (!codeValue) return;
    const blob = new Blob([codeValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="Tree Editor"
      description="Visual tree editor with inline editing, add/delete nodes, and code sync."
      icon={TreePine}
    >
      <ActionBar>
        <button className="btn btn-ghost" onClick={() => syncFromCode(sampleJson)}>
          <FileText size={16} /> Sample
        </button>
        <button className="btn btn-ghost" onClick={() => { setCodeValue(''); setJsonData(null); setError(''); }}>
          <Trash2 size={16} /> Clear
        </button>
        <CopyButton text={codeValue} />
        <button className="btn btn-ghost" onClick={handleDownload} disabled={!codeValue}>
          <Download size={16} /> Download
        </button>
      </ActionBar>

      {error && <div className="error-banner">{error}</div>}

      <div className="te-layout">
        <div className="panel">
          <div className="panel-header">
            <span>Tree View</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>Double-click values to edit</span>
          </div>
          <div className="te-tree-container">
            {jsonData !== null ? (
              <EditableTreeNode
                value={jsonData}
                path={[]}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ) : (
              <div className="te-placeholder">Paste or load JSON to start editing</div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Code View</div>
          <CodeEditor value={codeValue} onChange={syncFromCode} placeholder="Paste JSON here..." height="500px" />
        </div>
      </div>

      <SeoContent 
        title="Interactive JSON Tree Viewer & Editor"
        description={[
          "Sometimes raw code is just too hard to read. Our JSON Tree Viewer provides a clean, interactive, hierarchical view of your data.",
          "Expand and collapse nested objects, visualize deep array structures, and edit key-value pairs directly without worrying about breaking syntax rules."
        ]}
        features={[
          { title: "Visual Hierarchy", desc: "Transforms massive blocks of code into an intuitive, collapsible folder-like structure that is easy to navigate." },
          { title: "Safe Editing", desc: "Edit values directly in the UI. We ensure you can't accidentally delete a comma or quote and break your JSON payload." },
          { title: "100% Client-Side", desc: "The tree visualization is rendered locally on your device, ensuring total privacy for sensitive data." }
        ]}
        faq={[
          { q: "Can I use this instead of a code editor?", a: "Yes! For many non-technical users, navigating a JSON Tree is much easier than looking at raw brackets and braces. It's perfect for product managers and QA engineers." },
          { q: "How do I export my changes?", a: "Once you have finished editing your JSON in the tree view, simply click the Download or Copy button to get the updated raw code." }
        ]}
      />
    </ToolLayout>
  );
};

export default TreeEditor;
