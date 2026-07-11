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

const inferType = (value, key = '') => {
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
    for (const [k, val] of Object.entries(value)) {
      properties[k] = inferType(val, k);
    }
    return { type: 'object', properties, required };
  }
  if (typeof value === 'string') {
    const base = {};
    // Detect common formats
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) base.format = 'date-time';
    else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) base.format = 'date';
    else if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) base.format = 'email';
    else if (/^https?:\/\//.test(value)) base.format = 'uri';
    const desc = describeKey(key, 'string', base.format);
    return { type: 'string', ...base, ...(desc ? { description: desc } : {}) };
  }
  if (typeof value === 'number') {
    const isInt = Number.isInteger(value);
    const desc = describeKey(key, isInt ? 'integer' : 'number');
    return { type: isInt ? 'integer' : 'number', ...(desc ? { description: desc } : {}) };
  }
  if (typeof value === 'boolean') {
    const desc = describeKey(key, 'boolean');
    return { type: 'boolean', ...(desc ? { description: desc } : {}) };
  }
  return {};
};

// ─── Smart field description generator ────────────────────────────────────────
// Infers human-readable descriptions from key names using common naming patterns.
// No AI/LLM required — pure pattern matching.
const DESCRIPTION_PATTERNS = [
  // IDs
  [/^_?id$/i,                            () => 'Unique identifier'],
  [/^(.+)[_-]?id$/i,                     (m) => `Unique identifier for the ${humanize(m[1])}`],
  [/^uuid$/i,                            () => 'Universally unique identifier (UUID)'],
  [/^slug$/i,                            () => 'URL-friendly identifier slug'],

  // Names
  [/^(first|given)[_-]?name$/i,          () => 'First (given) name'],
  [/^(last|family|sur)[_-]?name$/i,      () => 'Last (family) name'],
  [/^(display|full|user)[_-]?name$/i,    (m) => `${capitalize(m[1])} name`],
  [/^(nick|middle)[_-]?name$/i,          (m) => `${capitalize(m[1])} name`],
  [/^name$/i,                            () => 'Name'],
  [/^title$/i,                           () => 'Title or heading'],
  [/^label$/i,                           () => 'Display label'],

  // Contact
  [/^e?-?mail$/i,                        () => 'Email address'],
  [/^phone(_number)?$/i,                 () => 'Phone number'],
  [/^(mobile|cell)(_number)?$/i,         () => 'Mobile phone number'],
  [/^fax$/i,                             () => 'Fax number'],

  // Web
  [/^(web)?site$/i,                      () => 'Website URL'],
  [/^(home)?page$/i,                     () => 'Web page URL'],
  [/^url$/i,                             () => 'URL link'],
  [/^href$/i,                            () => 'Hyperlink reference'],
  [/^(avatar|profile)[_-]?(image|img|pic|photo|url)?$/i, () => 'Profile image URL'],
  [/^(thumbnail|thumb)(_url)?$/i,        () => 'Thumbnail image URL'],
  [/^icon(_url)?$/i,                     () => 'Icon URL'],

  // Location / Address
  [/^(street|address)[_-]?(line)?[_-]?\d?$/i,  () => 'Street address'],
  [/^city$/i,                            () => 'City name'],
  [/^state$/i,                           () => 'State or province'],
  [/^(zip|postal)[_-]?(code)?$/i,        () => 'Postal / ZIP code'],
  [/^country(_code)?$/i,                 () => 'Country or country code'],
  [/^(lat|latitude)$/i,                  () => 'Latitude coordinate'],
  [/^(lng|lon|longitude)$/i,             () => 'Longitude coordinate'],
  [/^region$/i,                          () => 'Geographic region'],
  [/^timezone$/i,                        () => 'Timezone identifier'],

  // Timestamps
  [/^created[_-]?(at|on|date|time)?$/i,  () => 'Timestamp of creation'],
  [/^updated[_-]?(at|on|date|time)?$/i,  () => 'Timestamp of last update'],
  [/^deleted[_-]?(at|on|date|time)?$/i,  () => 'Timestamp of deletion'],
  [/^modified[_-]?(at|on|date|time)?$/i, () => 'Timestamp of last modification'],
  [/^(published|pub)[_-]?(at|on|date)?$/i, () => 'Publication date'],
  [/^(start|begin)[_-]?(date|time|at)?$/i, () => 'Start date/time'],
  [/^(end|finish)[_-]?(date|time|at)?$/i,  () => 'End date/time'],
  [/^(expir|expire)[_-]?(s|es|y|at|date)?$/i, () => 'Expiry date'],
  [/^(date|timestamp)$/i,               () => 'Date or timestamp'],
  [/^(birth[_-]?date|dob)$/i,           () => 'Date of birth'],

  // Booleans
  [/^is[_-]?(.+)$/i,                    (m) => `Whether the item is ${humanize(m[1])}`],
  [/^has[_-]?(.+)$/i,                   (m) => `Whether the item has ${humanize(m[1])}`],
  [/^can[_-]?(.+)$/i,                   (m) => `Whether the item can ${humanize(m[1])}`],
  [/^(enabled|disabled|active|verified|visible|public|private|archived|locked|blocked|deleted|completed|approved)$/i,
                                         (m) => `Whether the item is ${m[1].toLowerCase()}`],

  // Counts / metrics
  [/^(count|total|num|number)[_-]?(of)?[_-]?(.+)?$/i, (m) => m[3] ? `Total number of ${humanize(m[3])}` : 'Total count'],
  [/^(.+)[_-]?count$/i,                 (m) => `Number of ${humanize(m[1])}`],
  [/^(size|length)$/i,                  () => 'Size or length'],
  [/^(width|height)$/i,                 (m) => capitalize(m[1])],
  [/^(age)$/i,                          () => 'Age'],
  [/^(score|rating|rank)$/i,            (m) => capitalize(m[1])],
  [/^(priority|order|position|index|sort[_-]?order)$/i, (m) => `Sort ${humanize(m[1])}`],

  // Money
  [/^(price|cost|amount|fee|charge)$/i,  (m) => `${capitalize(m[1])} value`],
  [/^(currency|currency[_-]?code)$/i,   () => 'Currency code (e.g., USD, EUR)'],
  [/^(balance|total|subtotal|tax|discount)$/i, (m) => capitalize(m[1])],
  [/^(salary|wage|income|revenue)$/i,    (m) => capitalize(m[1])],

  // Auth / security
  [/^(password|passwd|pwd)$/i,           () => 'Password (hashed)'],
  [/^(token|access[_-]?token|refresh[_-]?token|api[_-]?key)$/i, (m) => humanize(m[0])],
  [/^(role|permission|scope)$/i,         (m) => `User ${m[1].toLowerCase()}`],
  [/^(secret|key)$/i,                   (m) => `Secret ${m[1].toLowerCase()}`],

  // Content
  [/^(description|desc|summary|bio|about)$/i, (m) => `${capitalize(m[1])} text`],
  [/^(content|body|text|message|comment|note)$/i, (m) => `${capitalize(m[1])} content`],
  [/^(subject|topic|headline)$/i,        (m) => capitalize(m[1])],
  [/^tags?$/i,                           () => 'Tags or labels'],
  [/^(category|categories|type|kind|group)$/i, (m) => capitalize(m[1])],
  [/^(status|state)$/i,                  () => 'Current status'],
  [/^(lang|language|locale)$/i,          () => 'Language or locale code'],
  [/^(color|colour)$/i,                  () => 'Color value'],
  [/^(version|ver)$/i,                   () => 'Version number'],
  [/^(format|mime[_-]?type|content[_-]?type)$/i, () => 'Format or MIME type'],

  // Data
  [/^(data|payload|metadata|meta|config|settings|options|params|parameters|preferences|attributes|properties)$/i,
                                         (m) => capitalize(m[1])],
  [/^(items|entries|records|results|rows|list|values|children|members|users|elements)$/i,
                                         (m) => `List of ${m[1].toLowerCase()}`],
  [/^(source|origin|from|sender)$/i,     (m) => capitalize(m[1])],
  [/^(target|destination|to|recipient)$/i, (m) => capitalize(m[1])],
  [/^(parent|owner|author|creator|assignee)$/i, (m) => capitalize(m[1])],
  [/^(image|img|photo|picture|logo|banner)(_url)?$/i, (m) => `${capitalize(m[1])} URL`],
  [/^(file|document|attachment)(_url|_path|_name)?$/i, (m) => `${capitalize(m[1])}${m[2] ? ' ' + humanize(m[2]) : ''}`],

  // Misc
  [/^(plan|tier|level|subscription)$/i,  (m) => `${capitalize(m[1])} type`],
  [/^(duration|interval|timeout|ttl|delay)$/i, (m) => `${capitalize(m[1])} value`],
  [/^(limit|max|min|threshold)$/i,       (m) => `${capitalize(m[1])} value`],
  [/^(ip|ip[_-]?address)$/i,            () => 'IP address'],
  [/^(user[_-]?agent|ua)$/i,            () => 'User agent string'],
  [/^(ref|reference)$/i,                () => 'Reference value'],
  [/^(code|error[_-]?code)$/i,          () => 'Code identifier'],
];

/**
 * Infer a description from a JSON key name, its value type, and optional format.
 * Returns a description string or null if no pattern matches.
 */
const describeKey = (key, type, format) => {
  if (!key) return null;

  // Check format-based descriptions first
  if (format === 'email')     return 'Email address';
  if (format === 'uri')       return 'URL link';
  if (format === 'date-time') return 'ISO 8601 date-time string';
  if (format === 'date')      return 'ISO 8601 date string';

  // Run through pattern table
  for (const [pattern, generator] of DESCRIPTION_PATTERNS) {
    const match = key.match(pattern);
    if (match) return generator(match);
  }

  return null;
};

/** Convert snake_case / camelCase / kebab-case key name to readable text */
const humanize = (str) =>
  str
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();

/** Capitalize first letter */
const capitalize = (str) => {
  const h = humanize(str);
  return h.charAt(0).toUpperCase() + h.slice(1);
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
