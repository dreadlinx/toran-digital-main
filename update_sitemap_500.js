const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.agents' && file !== '.git' && file !== 'scratch' && file !== '.system_generated') {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(ROOT_DIR);
console.log(`Found ${htmlFiles.length} total HTML files on disk.`);

// Build clean list of canonical URLs
const urlEntries = [];

htmlFiles.forEach(f => {
  const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
  let urlPath = relPath.replace(/\/index\.html$/, '/').replace(/^index\.html$/, '');
  if (!urlPath.endsWith('/') && urlPath !== '') urlPath += '/';
  const url = `https://torandigital.co.za/${urlPath}`;

  let priority = '0.8';
  let changefreq = 'monthly';

  if (url === 'https://torandigital.co.za/') {
    priority = '1.0';
    changefreq = 'weekly';
  } else if (urlPath.startsWith('services/') || urlPath.startsWith('web-design/') || urlPath.startsWith('vehicle-branding/') || urlPath.startsWith('mobile-apps/') || urlPath.startsWith('dstv-installations/') || urlPath.startsWith('seo-marketing/') || urlPath.startsWith('graphic-design/')) {
    priority = '0.9';
    changefreq = 'weekly';
  } else if (urlPath === 'areas/') {
    priority = '0.9';
    changefreq = 'weekly';
  } else if (urlPath.startsWith('blog/')) {
    priority = '0.7';
    changefreq = 'monthly';
  } else if (urlPath === 'privacy-policy/' || urlPath === 'terms/') {
    priority = '0.3';
    changefreq = 'yearly';
  }

  urlEntries.push({
    url,
    priority,
    changefreq,
    lastmod: '2026-08-19'
  });
});

// Sort URLs alphabetically
urlEntries.sort((a, b) => a.url.localeCompare(b.url));

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.map(e => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), xmlContent, 'utf8');
console.log(`Generated sitemap.xml with ${urlEntries.length} total URLs.`);
