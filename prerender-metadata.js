import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const siteUrl = 'https://jsonai.online';

const routes = [
  {
    route: '/ai-assistant',
    title: 'AI Assistant | JSON AI',
    description: 'AI-powered JSON generation, explanation, and schema suggestions for developers and teams.',
  },
  {
    route: '/prompt-builder',
    title: 'JSON Prompt Builder | JSON AI',
    description: 'Compress verbose AI prompts into token-efficient JSON prompts for Gemini, OpenAI, and Claude.',
  },
  {
    route: '/type-generator',
    title: 'Type Generator | JSON AI',
    description: 'Convert JSON into TypeScript, Zod, Pydantic, Go, Rust, and PHP definitions instantly.',
  },
  {
    route: '/schema',
    title: 'Schema Generator | JSON AI',
    description: 'Generate JSON Schema from sample data and validate JSON against schema definitions.',
  },
  {
    route: '/formatter',
    title: 'JSON Formatter | JSON AI',
    description: 'Beautify, minify, and reformat JSON with customizable indentation and style options.',
  },
  {
    route: '/validator',
    title: 'JSON Validator | JSON AI',
    description: 'Validate JSON structures with detailed error feedback and helpful line guidance.',
  },
  {
    route: '/converter',
    title: 'JSON Converter | JSON AI',
    description: 'Convert JSON to CSV, YAML, XML, TOML, and back with a powerful browser-based tool.',
  },
  {
    route: '/diff',
    title: 'JSON Diff | JSON AI',
    description: 'Compare two JSON documents side by side with semantic diff highlighting.',
  },
  {
    route: '/path-finder',
    title: 'Path Finder | JSON AI',
    description: 'Explore JSON paths interactively and query data using JSONPath expressions.',
  },
  {
    route: '/editor',
    title: 'Tree Editor | JSON AI',
    description: 'Visual JSON tree editor with inline node editing and live code sync.',
  },
  {
    route: '/escape',
    title: 'JSON Escape Tool | JSON AI',
    description: 'Escape and unescape JSON strings for safe embedding in code and data formats.',
  },
];

const replaceMeta = (html, replacements) => {
  let updated = html;
  for (const { selector, value } of replacements) {
    switch (selector) {
      case 'title':
        updated = updated.replace(/<title>.*?<\/title>/i, `<title>${value}</title>`);
        break;
      default:
        updated = updated.replace(
          new RegExp(`(<${selector}[^>]+content=")[^"]*("[^>]*>)`, 'i'),
          `$1${value}$2`
        );
    }
  }
  return updated;
};

const createRouteFile = ({ route, title, description }) => {
  const routePath = route.replace(/^\//, '');
  const targetDir = path.join(distDir, routePath);
  fs.mkdirSync(targetDir, { recursive: true });

  const pageUrl = `${siteUrl}${route}`;
  const html = replaceMeta(indexHtml, [
    { selector: 'title', value: title },
    { selector: 'meta name="description"', value: description },
    { selector: 'meta property="og:title"', value: title },
    { selector: 'meta property="og:description"', value: description },
    { selector: 'meta name="twitter:title"', value: title },
    { selector: 'meta name="twitter:description"', value: description },
    { selector: 'meta property="og:url"', value: pageUrl },
    { selector: 'link rel="canonical"', value: pageUrl },
  ]);

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
};

for (const routeData of routes) {
  createRouteFile(routeData);
}

console.log('Prerendered metadata pages generated for routes:');
console.log(routes.map((route) => route.route).join(', '));
