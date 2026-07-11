import * as jsondiffpatch from 'jsondiffpatch';
import { format as formatHtml } from 'jsondiffpatch/formatters/html';

const diffpatcher = jsondiffpatch.create({
  objectHash: (obj) => JSON.stringify(obj),
  arrays: {
    detectMove: true,
  },
});

export const computeDiff = (left, right) => {
  const leftObj = typeof left === 'string' ? JSON.parse(left) : left;
  const rightObj = typeof right === 'string' ? JSON.parse(right) : right;
  return diffpatcher.diff(leftObj, rightObj);
};

export const formatDiffAsHtml = (delta) => {
  if (!delta) return '<p class="diff-identical">Both JSON documents are identical.</p>';
  return formatHtml(delta, undefined);
};

export const getDiffStats = (delta) => {
  if (!delta) return { added: 0, removed: 0, changed: 0, total: 0 };
  let added = 0, removed = 0, changed = 0;
  
  const walk = (d) => {
    if (!d || typeof d !== 'object') return;
    for (const key of Object.keys(d)) {
      if (key === '_t') continue;
      const val = d[key];
      if (Array.isArray(val)) {
        if (val.length === 1) added++;
        else if (val.length === 3 && val[2] === 0) removed++;
        else if (val.length === 2) changed++;
      } else if (typeof val === 'object') {
        walk(val);
      }
    }
  };
  walk(delta);
  return { added, removed, changed, total: added + removed + changed };
};

// ─── Natural language diff summary ───────────────────────────────────────────
// Generates human-readable bullet-point descriptions of what changed.
// No AI/LLM required — walks the jsondiffpatch delta tree.

/** Truncate a value for display */
const truncate = (val, maxLen = 40) => {
  const s = typeof val === 'string' ? `"${val}"` : JSON.stringify(val);
  return s && s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
};

export const generateDiffSummary = (delta, leftObj, rightObj) => {
  if (!delta) return [];
  const lines = [];

  const walk = (d, path = '') => {
    if (!d || typeof d !== 'object') return;

    const isArrayDelta = d._t === 'a';

    for (const key of Object.keys(d)) {
      if (key === '_t') continue;

      const val = d[key];
      const displayKey = isArrayDelta ? key.replace(/^_/, '') : key;
      const fullPath = path ? `${path}.${displayKey}` : displayKey;

      if (Array.isArray(val)) {
        if (val.length === 1) {
          // Added
          lines.push({ type: 'added', text: `Added "${fullPath}" with value ${truncate(val[0])}` });
        } else if (val.length === 3 && val[2] === 0) {
          // Removed
          lines.push({ type: 'removed', text: `Removed "${fullPath}" (was ${truncate(val[0])})` });
        } else if (val.length === 2) {
          // Changed
          lines.push({ type: 'changed', text: `Changed "${fullPath}" from ${truncate(val[0])} → ${truncate(val[1])}` });
        } else if (val.length === 3 && val[2] === 2) {
          // Text diff (long strings) — simplify
          lines.push({ type: 'changed', text: `Modified text in "${fullPath}"` });
        } else if (val.length === 3 && val[2] === 3) {
          // Array move
          lines.push({ type: 'changed', text: `Moved item in "${fullPath}"` });
        }
      } else if (typeof val === 'object') {
        // Nested changes
        walk(val, fullPath);
      }
    }
  };

  walk(delta);

  // Sort: added first, then changed, then removed
  const order = { added: 0, changed: 1, removed: 2 };
  lines.sort((a, b) => order[a.type] - order[b.type]);

  return lines;
};

