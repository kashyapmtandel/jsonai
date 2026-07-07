import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const hostname = 'https://jsonai.online'
const today = new Date().toISOString().split('T')[0]

const routes = [
  { loc: '/',              changefreq: 'daily',   priority: '1.0' },
  { loc: '/json-validator',     changefreq: 'weekly',  priority: '0.9' },
  { loc: '/json-formatter',     changefreq: 'weekly',  priority: '0.9' },
  { loc: '/json-editor',        changefreq: 'weekly',  priority: '0.9' },
  { loc: '/json-ai-assistant',  changefreq: 'weekly',  priority: '0.9' },
  { loc: '/json-minifier',      changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-diff',          changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-schema',        changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-converter',     changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-path-finder',   changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-type-generator',changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-prompt-builder',changefreq: 'weekly',  priority: '0.8' },
  { loc: '/json-escape',        changefreq: 'weekly',  priority: '0.8' },
  { loc: '/about',         changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact',       changefreq: 'monthly', priority: '0.6' },
  { loc: '/terms',         changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy',       changefreq: 'monthly', priority: '0.5' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${hostname}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`

writeFileSync(resolve(__dirname, '../dist/sitemap.xml'), xml)
console.log('✅ sitemap.xml generated with', routes.length, 'urls')