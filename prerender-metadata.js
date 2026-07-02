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
    route: '/',
    title: 'JSON AI - Free Online JSON Formatter, Validator & Editor',
    description: 'Format, validate, convert, diff, and explore JSON with AI-powered features. Free, fast, and privacy-first.',
    fallbackHtml: `
      <h2>JSON AI - Free Online JSON Formatter, Validator & Editor</h2>
      <p>Welcome to JSON AI, your all-in-one suite of secure, client-side, and AI-powered JSON utilities. Our tools help web developers, data analysts, and engineering teams format, validate, convert, compare, minify, and query JSON payloads instantly and privately.</p>
      <p>Every tool in the JSON AI suite executes directly in your browser. We never upload or save your sensitive JSON configurations, database models, API keys, or custom payloads. It is 100% secure, private, and optimized for immediate client-side execution.</p>
      <h3>Key Features</h3>
      <ul>
        <li>AI JSON Assistant: Instantly draft JSON stubs, get schema feedback, or clarify complex objects in plain human English using Google Gemini and OpenAI models.</li>
        <li>JSON Formatting & Minification: Format messy nested structures with custom tab spacing, or compress JSON data to save up to 75% tokens when building AI prompts.</li>
        <li>Syntax Error Correction: Identify missing commas, unquoted keys, and nested brackets with real-time, line-by-line syntax highlighting and error guides.</li>
        <li>Cross-Format Conversions: Convert standard JSON payloads into XML structures, clean YAML lists, TOML configs, or CSV spreadsheets for quick analysis.</li>
      </ul>
    `
  },
  {
    route: '/ai-assistant',
    title: 'AI JSON Generator & Assistant Online – Create & Explain JSON | JSON AI',
    description: 'AI-powered JSON generation, explanation, and schema suggestions for developers and teams.',
    fallbackHtml: `
      <h2>AI JSON Generator & Assistant Online</h2>
      <p>Say goodbye to manually typing out JSON stubs or wrestling with complex structures. Our AI JSON Generator uses advanced models like Google Gemini and OpenAI to write, fix, and explain JSON code for you instantly.</p>
      <p>Whether you need mock data for a database, a simulated API response, or help understanding a deeply nested JSON structure, this tool does the heavy lifting for you.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Generate JSON from Text: Type plain English (e.g., 'A list of 5 users with emails') and our AI will generate perfectly formatted JSON data in seconds.</li>
        <li>Explain JSON: Paste an obscure JSON payload and the AI will summarize its structure, purpose, and data types in plain language.</li>
        <li>Suggest Schema: Automatically generate a valid JSON Schema based on the data you provide to validate future inputs.</li>
      </ul>
    `
  },
  {
    route: '/prompt-builder',
    title: 'JSON Prompt Builder – Optimize AI Tokens & Prompts | JSON AI',
    description: 'Compress verbose AI prompts into token-efficient JSON prompts for Gemini, OpenAI, and Claude.',
    fallbackHtml: `
      <h2>JSON Prompt Builder</h2>
      <p>Every token in your system prompt costs money across thousands of API calls. Our JSON Prompt Builder uses AI to convert verbose natural language instructions into ultra-compact JSON representations, typically reducing token usage by 50–75%.</p>
      <p>LLMs like GPT-4, Claude, and Gemini are fully capable of following JSON-structured instructions with the same or better accuracy than prose, making this a powerful technique for production AI applications.</p>
      <h3>Key Features</h3>
      <ul>
        <li>AI-Powered Compression: Semantically restructures your prompt while preserving every constraint and instruction.</li>
        <li>Real Token Savings: See exact before/after token estimates to verify optimization.</li>
        <li>Drop-in Compatible: Output JSON works directly as a system message in any OpenAI, Anthropic, or Google AI API call.</li>
      </ul>
    `
  },
  {
    route: '/type-generator',
    title: 'JSON Type Generator – Convert JSON to TypeScript, Go, Rust | JSON AI',
    description: 'Convert JSON into TypeScript, Zod, Pydantic, Go, Rust, and PHP definitions instantly.',
    fallbackHtml: `
      <h2>JSON Type Generator</h2>
      <p>Stop writing manual type definitions. Use advanced AI to instantly convert unstructured JSON payloads into strict, production-ready code.</p>
      <p>Our generator uses context-aware models to infer accurate Enums, deeply nested unions, and edge-case types, outputting perfect TypeScript, Zod, Pydantic, Go, Rust, and PHP.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Smart Inference: Infers enum values and strict types rather than defaulting to generic types.</li>
        <li>Multiple Languages: Instantly generate TypeScript Interfaces, Zod Schemas, Python Pydantic models, Go structs, Rust structs, and PHP classes.</li>
        <li>100% Client-Side Processing: Your structures are converted inside your browser using your own API key.</li>
      </ul>
    `
  },
  {
    route: '/schema',
    title: 'JSON Schema Generator – Generate & Validate JSON Schema | JSON AI',
    description: 'Generate JSON Schema from sample data and validate JSON against schema definitions.',
    fallbackHtml: `
      <h2>JSON Schema Generator & Validator</h2>
      <p>Create fully compliant JSON Schemas automatically from JSON instances. Perfect for documenting APIs, configuring system boundaries, and setting up runtime contract tests.</p>
      <p>Use this tool to rapidly create schemas for API validation, database modeling, and documentation. Everything is processed securely in your browser, guaranteeing zero data leakage.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Instant Generation: Paste any JSON object or array, and a fully compliant JSON Schema will be generated instantly.</li>
        <li>Type Detection: Intelligently infers primitive types (string, number, boolean) and detects complex nested objects and arrays.</li>
        <li>Secure Processing: Your sensitive JSON payload never leaves your computer. The schema is generated 100% locally.</li>
      </ul>
    `
  },
  {
    route: '/minifier',
    title: 'JSON Minifier – Compress JSON Online to Save AI Tokens | JSON AI',
    description: 'Minify JSON to remove whitespace, reduce payload size, and save tokens in AI prompts.',
    fallbackHtml: `
      <h2>JSON Minifier & Token Saver</h2>
      <p>Every whitespace character in your JSON costs real money when calling GPT-4, Claude, or Gemini APIs. Our JSON Minifier strips all unnecessary spaces, newlines, and indentation from your payload, reducing token count by up to 40%.</p>
      <p>Designed specifically for developers building AI-powered applications, this tool shows you exactly how many tokens and dollars you save across every major LLM provider.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Instant Token Count: See your before/after token estimate the moment you paste JSON.</li>
        <li>Multi-Model Cost Breakdown: Compare savings across GPT-4o, Claude 3.5, Gemini 1.5, and more with real pricing data.</li>
        <li>Instant Minification: Zero-latency processing. JSON is minified in your browser as you type.</li>
      </ul>
    `
  },
  {
    route: '/formatter',
    title: 'Free JSON Formatter & Beautifier Online – Read JSON Instantly | JSON AI',
    description: 'Beautify, minify, and reformat JSON with customizable indentation and style options.',
    fallbackHtml: `
      <h2>Free Online JSON Formatter & Beautifier</h2>
      <p>Our Free JSON Formatter is a powerful, client-side tool designed to instantly beautify, format, and structure your messy or minified JSON code into readable, perfectly indented structures.</p>
      <p>Unlike other online tools, this formatter processes everything securely within your browser. Your sensitive JSON data never touches a server, ensuring maximum privacy and lightning-fast speeds.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Instant Beautification: Formats unreadable, minified JSON strings into perfectly indented, human-readable code in milliseconds.</li>
        <li>100% Client-Side: Maximum privacy. No data is sent to external servers, making it safe for production data.</li>
        <li>Syntax Highlighting: Premium dark/light mode syntax highlighting powered by CodeMirror, ensuring perfect readability.</li>
        <li>Tab Size Control: Customize your indentation level with 2-space, 4-space, or tab configurations.</li>
      </ul>
    `
  },
  {
    route: '/validator',
    title: 'Free JSON Validator & Fixer – Validate JSON Online | JSON AI',
    description: 'Validate JSON structures with detailed error feedback and helpful line guidance.',
    fallbackHtml: `
      <h2>Free JSON Validator & Fixer</h2>
      <p>Our Free JSON Validator and Fixer is the most accurate, secure, and developer-friendly tool for detecting syntax errors and structural flaws in your JSON data.</p>
      <p>Whether you are working with standard APIs, validating a complex Swagger JSON, or checking an LD JSON snippet for SEO, our tool instantly finds missing commas, unquoted strings, and trailing brackets with pinpoint line-number accuracy.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Universal JSON Validator: Perfect for validating standard JSON, Swagger JSON configurations, and LD JSON structured data payloads.</li>
        <li>Precise Error Tracking: Unlike standard parsers, our engine pinpoints the exact line and character where the syntax error occurred, acting as a true JSON validator and fixer.</li>
        <li>Secure & Private: Your data never leaves your device. Perfect for validating production API payloads containing sensitive customer data.</li>
      </ul>
    `
  },
  {
    route: '/converter',
    title: 'Free JSON Converter – Convert JSON to YAML, CSV, XML, TOML | JSON AI',
    description: 'Convert JSON to CSV, YAML, XML, TOML, and back with a powerful browser-based tool.',
    fallbackHtml: `
      <h2>Free Online JSON Converter</h2>
      <p>Easily convert between JSON and other popular data formats like YAML, XML, and CSV. Our Free JSON Converter provides instant, bi-directional translation for all your data structure needs.</p>
      <p>Forget about writing custom parser scripts. Simply paste your data, and watch it transform securely in your browser without ever hitting an external server.</p>
      <h3>Key Features</h3>
      <ul>
        <li>JSON to YAML: Convert messy JSON objects into clean, human-readable YAML configurations perfectly suited for Docker, Kubernetes, or CI/CD pipelines.</li>
        <li>JSON to CSV: Flatten complex JSON arrays into simple comma-separated values (CSV) that you can instantly open in Excel or Google Sheets.</li>
        <li>JSON to XML: Transform modern JSON payloads into valid XML trees for legacy enterprise systems and SOAP APIs.</li>
        <li>100% Secure: Your data is converted securely within your local browser environment. We respect your privacy.</li>
      </ul>
    `
  },
  {
    route: '/diff',
    title: 'JSON Diff Checker – Compare Two JSON Files Side-by-Side | JSON AI',
    description: 'Compare two JSON documents side by side with semantic diff highlighting.',
    fallbackHtml: `
      <h2>Free Online JSON Diff & Compare Tool</h2>
      <p>Our Free JSON Diff Tool allows you to instantly compare two JSON objects and find the exact differences between them.</p>
      <p>Whether you are debugging a broken API response, comparing configuration files, or reviewing a git merge conflict, our visual Diff tool highlights every added, removed, and modified line perfectly.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Side-by-Side Comparison: View the original JSON and the modified JSON next to each other with perfect line-matching and color-coded highlights.</li>
        <li>Deep Object Comparison: Detects changes deep within nested arrays and complex objects without getting confused by formatting.</li>
        <li>Secure Processing: We compare your JSON strings directly inside your browser. No data is transmitted to our servers.</li>
      </ul>
    `
  },
  {
    route: '/path-finder',
    title: 'JSONPath Finder & Query Tool – Filter JSON Online | JSON AI',
    description: 'Explore JSON paths interactively and query data using JSONPath expressions.',
    fallbackHtml: `
      <h2>Free JSONPath Evaluator & Finder</h2>
      <p>Navigating deeply nested JSON payloads to find specific data points can be incredibly frustrating. Our JSON Path Finder allows you to write JSONPath queries and instantly visualize the extracted data.</p>
      <p>Perfect for developers writing automated API tests, debugging complex webhook payloads, or extracting nested properties without writing custom parser scripts.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Live Evaluation: Type your JSONPath query (e.g., '$.users[*].email') and see the results instantly.</li>
        <li>Interactive Explorer: Don't know the path? Just click through our interactive tree viewer on the left, and the correct JSONPath will be automatically generated for you!</li>
        <li>Zero Data Leakage: Your JSON data is parsed and evaluated entirely inside your browser. Nothing is ever uploaded to a server.</li>
      </ul>
    `
  },
  {
    route: '/editor',
    title: 'Visual JSON Tree Editor – Edit JSON Interactively Online | JSON AI',
    description: 'Visual JSON tree editor with inline node editing and live code sync.',
    fallbackHtml: `
      <h2>Interactive JSON Tree Viewer & Editor</h2>
      <p>Sometimes raw code is just too hard to read. Our JSON Tree Viewer provides a clean, interactive, hierarchical view of your data.</p>
      <p>Expand and collapse nested objects, visualize deep array structures, and edit key-value pairs directly without worrying about breaking syntax rules.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Visual Hierarchy: Transforms massive blocks of code into an intuitive, collapsible folder-like structure that is easy to navigate.</li>
        <li>Safe Editing: Edit values directly in the UI. We ensure you can't accidentally delete a comma or quote and break your JSON payload.</li>
        <li>100% Client-Side: The tree visualization is rendered locally on your device, ensuring total privacy for sensitive data.</li>
      </ul>
    `
  },
  {
    route: '/escape',
    title: 'JSON Escape & Unescape Tool – Format Safe JSON Strings | JSON AI',
    description: 'Escape and unescape JSON strings for safe embedding in code and data formats.',
    fallbackHtml: `
      <h2>Free JSON String Escaper & Unescaper</h2>
      <p>Embedding JSON payloads inside other JSON strings, SQL databases, or bash scripts often requires escaping quotation marks and special characters. Our Free JSON Escape tool handles this tedious process instantly.</p>
      <p>Simply paste your JSON string and convert it into a perfectly escaped, flat string representation, or vice versa, completely securely inside your browser.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Escape to String: Transforms a standard JSON object into a flat string by escaping all internal double quotes with backslashes.</li>
        <li>Unescape (Parse): Takes a messy, backslash-escaped string and parses it back into a clean, hierarchical JSON object.</li>
        <li>Zero Data Leakage: We never send your sensitive SQL payloads or API secrets to a server. Everything happens locally.</li>
      </ul>
    `
  },
  {
    route: '/about',
    title: 'About JSON AI – Secure Browser-Based JSON Tools | JSON AI',
    description: 'Learn about JSON AI, a fast privacy-first toolkit for formatting, validating, converting, and exploring JSON.',
    fallbackHtml: `
      <h2>About JSON AI</h2>
      <p>JSON AI was built to solve a common developer problem: utility tools that send sensitive payloads to third-party servers. When formatting or validating customer data, databases configurations, or proprietary APIs, security is paramount.</p>
      <p>Our toolkit is completely serverless. Every action runs entirely within your browser client using modern WebAssembly, LocalStorage, and client-side scripts. Your data never leaves your computer.</p>
    `
  },
  {
    route: '/contact',
    title: 'Contact JSON AI – Send Feedback and Product Requests | JSON AI',
    description: 'Contact the JSON AI team with feedback, support questions, and product suggestions.',
    fallbackHtml: `
      <h2>Contact JSON AI</h2>
      <p>Have ideas for new JSON tools? Found a bug? Or just want to say hi? Contact the JSON AI developers. We are actively refining this toolkit to improve developer workflows around the world.</p>
    `
  },
  {
    route: '/privacy',
    title: 'Privacy Policy – 100% Client-Side JSON Processing | JSON AI',
    description: 'Read how JSON AI protects your privacy with client-side JSON tools and local browser processing.',
    fallbackHtml: `
      <h2>Privacy Policy</h2>
      <p>Your privacy is our number one priority. Unlike other tool suites, JSON AI does not host servers that parse, store, or transmit the JSON payloads you format, validate, minify, or convert.</p>
      <p>All scripts execute directly inside your browser. Any custom integrations, such as using the AI Assistant, run directly between your browser and the AI provider via your own secret local API keys.</p>
    `
  },
  {
    route: '/terms',
    title: 'Terms of Service – JSON AI Terms and Conditions | JSON AI',
    description: 'Review the terms for using JSON AI browser-based JSON tools and AI-assisted utilities.',
    fallbackHtml: `
      <h2>Terms of Service</h2>
      <p>By using JSON AI, you agree to run these tools directly in your browser. All tools are provided free of charge, with no guarantees of uptime or suitability for custom production tasks. Use responsibly.</p>
    `
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

const createRouteFile = ({ route, title, description, fallbackHtml = '' }) => {
  const routePath = route.replace(/^\//, '');
  const targetDir = path.join(distDir, routePath);
  fs.mkdirSync(targetDir, { recursive: true });

  const pageUrl = route === '/' ? `${siteUrl}/` : `${siteUrl}${route}/`;
  let html = replaceMeta(indexHtml, [
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

  // Inject Static Fallback Content inside the app shell
  if (fallbackHtml) {
    const fallbackSearch = '<p class="app-shell-fallback__text">Loading JSON AI - Free Online JSON Formatter, Validator & Editor...</p>';
    html = html.replace(
      fallbackSearch,
      `<p class="app-shell-fallback__text">Loading ${title}...</p>\n        <div class="static-fallback-seo-content" style="max-width: 800px; margin: 40px auto 0; text-align: left; opacity: 0.85; font-size: 0.95rem; line-height: 1.6;">${fallbackHtml}</div>`
    );
  }

  // Inject structured SoftwareApplication schema into head
  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "url": pageUrl,
    "description": description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript and a modern web browser.",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const schemaScript = `  <script type="application/ld+json">\n  ${JSON.stringify(toolSchema, null, 2)}\n  </script>\n</head>`;
  html = html.replace('</head>', schemaScript);

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
