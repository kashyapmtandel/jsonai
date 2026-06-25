import * as yaml from 'js-yaml';
import Papa from 'papaparse';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as TOML from 'smol-toml';

// JSON to YAML
export const jsonToYaml = (jsonText) => {
  const parsed = JSON.parse(jsonText);
  return yaml.dump(parsed, { indent: 2, lineWidth: -1 });
};

// YAML to JSON
export const yamlToJson = (yamlText) => {
  const parsed = yaml.load(yamlText);
  return JSON.stringify(parsed, null, 2);
};

// JSON to CSV
export const jsonToCsv = (jsonText) => {
  const parsed = JSON.parse(jsonText);
  const data = Array.isArray(parsed) ? parsed : [parsed];
  return Papa.unparse(data);
};

// CSV to JSON
export const csvToJson = (csvText) => {
  const result = Papa.parse(csvText, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return JSON.stringify(result.data, null, 2);
};

// JSON to XML
export const jsonToXml = (jsonText) => {
  const parsed = JSON.parse(jsonText);
  const builder = new XMLBuilder({
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
  });
  const wrapped = { root: parsed };
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(wrapped);
};

// XML to JSON
export const xmlToJson = (xmlText) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
  });
  const result = parser.parse(xmlText);
  return JSON.stringify(result, null, 2);
};

// JSON to TOML
export const jsonToToml = (jsonText) => {
  const parsed = JSON.parse(jsonText);
  return TOML.stringify(parsed);
};

// TOML to JSON
export const tomlToJson = (tomlText) => {
  const parsed = TOML.parse(tomlText);
  return JSON.stringify(parsed, null, 2);
};
