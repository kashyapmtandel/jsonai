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
