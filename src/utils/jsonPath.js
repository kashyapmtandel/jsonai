import { JSONPath } from 'jsonpath-plus';

export const queryJsonPath = (json, path) => {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  const result = JSONPath({ path, json: data, resultType: 'all' });
  return result.map(item => ({
    path: item.path,
    pointer: item.pointer,
    value: item.value,
  }));
};

export const getPathForNode = (obj, targetPath = []) => {
  // Build JSONPath string from array of keys
  return '$' + targetPath.map(key => {
    if (typeof key === 'number') return `[${key}]`;
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return `.${key}`;
    return `['${key}']`;
  }).join('');
};

export const flattenPaths = (obj, prefix = '$') => {
  const paths = [];
  const walk = (current, path) => {
    paths.push({ path, value: current, type: typeof current });
    if (current !== null && typeof current === 'object') {
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          walk(item, `${path}[${index}]`);
        });
      } else {
        Object.keys(current).forEach(key => {
          const safePath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
            ? `${path}.${key}` 
            : `${path}['${key}']`;
          walk(current[key], safePath);
        });
      }
    }
  };
  walk(obj, prefix);
  return paths;
};
