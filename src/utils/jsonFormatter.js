export const formatJson = (text, indent = 2) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed, null, indent);
};

export const minifyJson = (text) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed);
};

export const sortJsonKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
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
