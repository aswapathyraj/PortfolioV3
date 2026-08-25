/**
 * Generates public/sitemap.xml from the same data the site renders, so adding a
 * project to src/data/projects.js keeps the sitemap correct with no extra step.
 * Runs on `npm run build` via the prebuild script.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const { siteConfig } = await import(
  new URL('../src/config.js', import.meta.url).href
)
const { projects } = await import(
  new URL('../src/data/projects.js', import.meta.url).href
)

const origin = (siteConfig.siteUrl || '').replace(/\/+$/, '')
const today = new Date().toISOString().slice(0, 10)

const routes = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  ...projects
    .filter((project) => project.status !== 'placeholder')
    .map((project) => ({
      path: `/projects/${project.slug}`,
      priority: '0.8',
      changefreq: 'yearly',
    })),
]

const urls = routes
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

await writeFile(resolve(root, 'public/sitemap.xml'), xml, 'utf8')

if (!origin) {
  console.log(
    '[sitemap] note: siteConfig.siteUrl is empty, so sitemap URLs are relative. ' +
      'Set it in src/config.js before deploying.',
  )
}
console.log(`[sitemap] wrote ${routes.length} routes to public/sitemap.xml`)
