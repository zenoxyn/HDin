/**
 * Generates sitemap.xml for HDin
 * Runs during build via package.json "build" script
 */
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.SITE_URL || 'https://hdin.vercel.app';
const OUTPUT_DIR = path.resolve('dist');

const routes = [
  { url: '/', changefreq: 'monthly', priority: 1.0 },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const urls = routes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  const outputPath = path.join(OUTPUT_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log(`✓ sitemap.xml generated at ${outputPath}`);
}

generateSitemap();