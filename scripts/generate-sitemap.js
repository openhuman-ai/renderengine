import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
const siteUrl = (process.env.SITE_URL || process.env.URL || 'https://openhuman.ai').replace(/\/+$/, '');
const developerSiteUrl = process.env.DEVELOPER_SITE_URL || 'https://developer.openhuman.ai';
const sdkSiteUrl = process.env.SDK_SITE_URL || 'https://sdk.openhuman.ai';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		<loc>${developerSiteUrl}/sitemap-0.xml</loc>
	</sitemap>

	<sitemap>
		<loc>${sdkSiteUrl}/sitemap.xml</loc>
	</sitemap>
</sitemapindex>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${siteUrl}/</loc>
	</url>

	<url>
		<loc>${sdkSiteUrl}/</loc>
	</url>

	<url>
		<loc>${developerSiteUrl}/</loc>
	</url>
</urlset>
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap written to ${path.relative(rootDir, outputPath)}`);
