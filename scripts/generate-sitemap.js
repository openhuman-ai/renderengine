import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
const siteUrl = (process.env.SITE_URL || process.env.URL || 'https://openhuman.ai').replace(/\/+$/, '');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${siteUrl}/</loc>
	</url>

	<url>
		<loc>https://sdk.openhuman.ai/</loc>
	</url>

	<url>
		<loc>https://developer.openhuman.ai/</loc>
	</url>
</urlset>
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap written to ${path.relative(rootDir, outputPath)}`);
