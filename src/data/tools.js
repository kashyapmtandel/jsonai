import {
  Wand2, ShieldCheck, ArrowLeftRight, GitCompare,
  Search, FileJson, TreePine, Sparkles, Lock, Code2, Minimize2, BotMessageSquare
} from 'lucide-react';

const tools = [
  {
    title: 'AI Assistant',
    description: 'AI-powered JSON generation, explanation, and schema suggestions.',
    icon: Sparkles,
    to: '/json-ai-assistant/',
    color: '#8b5cf6',
  },
  {
    title: 'JSON Formatter',
    description: 'Format, beautify, and minify JSON with customizable indentation.',
    icon: Wand2,
    to: '/json-formatter/',
    color: '#6366f1',
  },
  {
    title: 'JSON Validator',
    description: 'Validate JSON with detailed error messages and line-level feedback.',
    icon: ShieldCheck,
    to: '/json-validator/',
    color: '#22c55e',
  },
  {
    title: 'Tree Viewer',
    description: 'Visualize JSON as an interactive collapsible tree. Expand and explore nested data.',
    icon: TreePine,
    to: '/json-editor/',
    color: '#14b8a6',
  },
  {
    title: 'JSON Prompt Builder',
    description: 'Convert verbose AI prompts into compact JSON format to save 50–75% tokens on every API call.',
    icon: BotMessageSquare,
    to: '/json-prompt-builder/',
    color: '#a855f7',
  },
  {
    title: 'Type Generator',
    description: 'Instantly convert JSON into production-ready TypeScript, Zod, Python, Go, Rust, and PHP.',
    icon: Code2,
    to: '/json-type-generator/',
    color: '#3b82f6',
  },
  {
    title: 'Schema Generator',
    description: 'Auto-generate JSON Schema and validate data against schemas.',
    icon: FileJson,
    to: '/json-schema/',
    color: '#ec4899',
  },
  {
    title: 'JSON Minifier',
    description: 'Strip whitespace from JSON to save LLM tokens and reduce GPT-4, Claude, and Gemini API costs.',
    icon: Minimize2,
    to: '/json-minifier/',
    color: '#f97316',
  },
  {
    title: 'JSON Converter',
    description: 'Convert between JSON, CSV, YAML, XML, and TOML formats.',
    icon: ArrowLeftRight,
    to: '/json-converter/',
    color: '#06b6d4',
  },
  {
    title: 'JSON Diff',
    description: 'Compare two JSON documents with semantic diff highlighting.',
    icon: GitCompare,
    to: '/json-diff/',
    color: '#f59e0b',
  },
  {
    title: 'Path Finder',
    description: 'Query JSON with JSONPath and interactively explore paths.',
    icon: Search,
    to: '/json-path-finder/',
    color: '#a855f7',
  },
  {
    title: 'Escape Tool',
    description: 'Escape and unescape JSON strings for safe embedding.',
    icon: Lock,
    to: '/json-escape/',
    color: '#f59e0b',
  },
];

export default tools;
