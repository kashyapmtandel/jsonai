import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, verbose: true });

// Generate JSON Schema from a JSON value
export const generateSchema = (value, title = 'Generated Schema') => {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title,
    ...inferType(value),
  };
  return schema;
};

const inferType = (value) => {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: 'array', items: {} };
    // Try to infer a common schema from items
    const itemSchemas = value.map(item => inferType(item));
    // If all items have the same type, use that
    const types = [...new Set(itemSchemas.map(s => s.type))];
    if (types.length === 1) {
      // Merge object properties if all objects
      if (types[0] === 'object') {
        const mergedProps = {};
        const allRequired = new Set();
        itemSchemas.forEach(s => {
          if (s.properties) {
            Object.entries(s.properties).forEach(([k, v]) => {
              if (!mergedProps[k]) mergedProps[k] = v;
            });
          }
          if (s.required) s.required.forEach(r => allRequired.add(r));
        });
        return {
          type: 'array',
          items: {
            type: 'object',
            properties: mergedProps,
            required: [...allRequired],
          },
        };
      }
      return { type: 'array', items: itemSchemas[0] };
    }
    return { type: 'array', items: { oneOf: itemSchemas } };
  }
  if (typeof value === 'object') {
    const properties = {};
    const required = Object.keys(value);
    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferType(val);
    }
    return { type: 'object', properties, required };
  }
  if (typeof value === 'string') {
    // Detect common formats
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return { type: 'string', format: 'date-time' };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { type: 'string', format: 'date' };
    if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) return { type: 'string', format: 'email' };
    if (/^https?:\/\//.test(value)) return { type: 'string', format: 'uri' };
    return { type: 'string' };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }
  if (typeof value === 'boolean') return { type: 'boolean' };
  return {};
};

// Validate JSON against a schema
export const validateSchema = (jsonData, schema) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema;
    const validate = ajv.compile(schemaObj);
    const valid = validate(data);
    return {
      valid,
      errors: validate.errors || [],
    };
  } catch (e) {
    return {
      valid: false,
      errors: [{ message: e.message }],
    };
  }
};
