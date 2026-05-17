import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
const siteUrl = (process.env.SITE_URL || process.env.URL || 'https://openhuman.ai').replace(/\/+$/, '');

const htmlFiles = (await fs.readdir(rootDir)).filter((fileName) => fileName.endsWith('.html'));

const routes = htmlFiles
  .filter((fileName) => fileName !== 'index_origin.html')
  .map((fileName) => (fileName === 'index.html' ? '/' : `/${fileName}`))
  .sort((left, right) => {
    if (left === '/') return -1;
    if (right === '/') return 1;
    return left.localeCompare(right);
  });

if (routes.length === 0) {
  throw new Error('No HTML entry files found to include in the sitemap.');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap written to ${path.relative(rootDir, outputPath)}`);
