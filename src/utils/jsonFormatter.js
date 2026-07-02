export const formatJson = (text, indent = 2) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed, null, indent);
};

export const minifyJson = (text) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed);
};

export const sortJsonKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(sortJsonKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortJsonKeys(obj[key]);
      return sorted;
    }, {});
  }
  return obj;
};

export const formatWithSortedKeys = (text, indent = 2) => {
  const parsed = JSON.parse(text);
  const sorted = sortJsonKeys(parsed);
  return JSON.stringify(sorted, null, indent);
};

/**
 * Best-effort JSON repair:
 * - Strips markdown code fences
 * - Removes JS // and block comments
 * - Converts Python/JS literals (True, False, None, undefined, NaN)
 * - Replaces single-quoted strings with double-quoted
 * - Adds double quotes to unquoted object keys
 * - Removes trailing commas before } or ]
 */
export const repairJson = (text, indent = 2) => {
  let s = text.trim();
  if (!s) throw new Error('Input is empty');

  // Strip markdown code fences ```json ... ```
  s = s.replace(/^```(?:json|javascript|js)?\s*\n?/i, '').replace(/\n?```\s*$/, '');

  // Remove JS block comments /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove single-line // comments (avoid stripping http://)
  s = s.replace(/([^:'"])(\/\/[^\n]*)/g, '$1');

  // Python/JS literals → JSON
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
  s = s.replace(/\bNone\b/g, 'null').replace(/\bundefined\b/g, 'null');
  s = s.replace(/\bNaN\b/g, 'null');

  // Replace single-quoted strings with double-quoted
  s = s.replace(/'((?:[^'\\]|\\.)*)'/g, (_, content) => {
    const escaped = content.replace(/\\'/g, "'").replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  // Add double quotes to unquoted object keys: { key: → { "key":
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1');

  const parsed = JSON.parse(s);
  return JSON.stringify(parsed, null, indent);
};
