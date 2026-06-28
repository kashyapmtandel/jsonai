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
    route: '/minifier',
    title: 'JSON Minifier | JSON AI',
    description: 'Minify JSON to remove whitespace, reduce payload size, and save tokens in AI prompts.',
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
  {
    route: '/about',
    title: 'About JSON AI | JSON AI',
    description: 'Learn about JSON AI, a fast privacy-first toolkit for formatting, validating, converting, and exploring JSON.',
  },
  {
    route: '/contact',
    title: 'Contact JSON AI | JSON AI',
    description: 'Contact the JSON AI team with feedback, support questions, and product suggestions.',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | JSON AI',
    description: 'Read how JSON AI protects your privacy with client-side JSON tools and local browser processing.',
  },
  {
    route: '/terms',
    title: 'Terms of Service | JSON AI',
    description: 'Review the terms for using JSON AI browser-based JSON tools and AI-assisted utilities.',
  },
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const replaceMeta = (html, replacements) => {
  let updated = html;
  for (const { tag, attr, attrValue, value, contentAttr = 'content' } of replacements) {
    if (tag === 'title') {
      updated = updated.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(value)}</title>`);
      continue;
    }

    const anchor = `${attr}="${attrValue}"`;
    const anchorIndex = updated.indexOf(anchor);
    if (anchorIndex === -1) {
      console.warn(`Meta tag not found: <${tag} ${anchor}>`);
      continue;
    }

    const start = updated.lastIndexOf('<', anchorIndex);
    const end = updated.indexOf('>', anchorIndex);
    if (start === -1 || end === -1) {
      console.warn(`Could not locate full tag for <${tag} ${anchor}>`);
      continue;
    }

    const tagText = updated.slice(start, end + 1);
    const attrPattern = new RegExp(`\\b${contentAttr}=(['"])(.*?)\\1`, 'i');
    if (!attrPattern.test(tagText)) {
      console.warn(`Attribute ${contentAttr} not found on <${tag} ${anchor}>`);
      continue;
    }

    const replacementTag = tagText.replace(attrPattern, `${contentAttr}=$1${escapeHtml(value)}$1`);
    updated = updated.slice(0, start) + replacementTag + updated.slice(end + 1);
  }
  return updated;
};

const createRouteFile = ({ route, title, description }) => {
  const routePath = route.replace(/^\//, '');
  const targetDir = path.join(distDir, routePath);
  fs.mkdirSync(targetDir, { recursive: true });

  const pageUrl = `${siteUrl}${route}`;
  const html = replaceMeta(indexHtml, [
    { tag: 'title', value: title },
    { tag: 'meta', attr: 'name', attrValue: 'description', value: description },
    { tag: 'meta', attr: 'property', attrValue: 'og:title', value: title },
    { tag: 'meta', attr: 'property', attrValue: 'og:description', value: description },
    { tag: 'meta', attr: 'property', attrValue: 'og:url', value: pageUrl },
    { tag: 'meta', attr: 'property', attrValue: 'twitter:title', value: title },
    { tag: 'meta', attr: 'property', attrValue: 'twitter:description', value: description },
    { tag: 'meta', attr: 'property', attrValue: 'twitter:url', value: pageUrl },
    { tag: 'link', attr: 'rel', attrValue: 'canonical', value: pageUrl, contentAttr: 'href' },
  ]);

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
};

for (const routeData of routes) {
  createRouteFile(routeData);
}

const create404File = () => {
  const html = replaceMeta(indexHtml, [
    { tag: 'title', value: '404 Page Not Found | JSON AI' },
    { tag: 'meta', attr: 'name', attrValue: 'description', value: 'The requested JSON AI page could not be found.' },
    { tag: 'link', attr: 'rel', attrValue: 'canonical', value: siteUrl, contentAttr: 'href' },
  ]).replace('</head>', '  <meta name="robots" content="noindex, follow" />\n</head>');

  fs.writeFileSync(path.join(distDir, '404.html'), html, 'utf8');
};

create404File();

console.log('Prerendered metadata pages generated for routes:');
console.log(routes.map((route) => route.route).join(', '));
