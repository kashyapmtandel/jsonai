export const escapeJson = (text) => {
  // Escape a string so it can be safely embedded inside a JSON string value
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b');
};

export const unescapeJson = (text) => {
  // Unescape a JSON-escaped string
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\f/g, '\f')
    .replace(/\\b/g, '\b')
    .replace(/\\\"/g, '"')
    .replace(/\\\\/g, '\\');
};

export const stringifyJsonString = (text) => {
  // Take raw text and wrap it as a JSON string value
  return JSON.stringify(text);
};

export const parseJsonString = (text) => {
  // Take a JSON string value and parse it to raw text
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'string') {
      throw new Error('Input is not a JSON string value');
    }
    return parsed;
  } catch (e) {
    throw new Error(`Invalid JSON string: ${e.message}`);
  }
};
