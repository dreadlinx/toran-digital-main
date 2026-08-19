const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.agents' && file !== '.git' && file !== 'scratch') {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(ROOT_DIR);
console.log(`Auditing ${htmlFiles.length} total HTML pages...`);

const titlesMap = new Map();
const descriptionsMap = new Map();
const canonicalsMap = new Map();
const schemaErrors = [];
const h1Errors = [];
const brokenLinks = [];
const unencodedWa = [];

function getMetaContent(html, nameOrProp, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  const regex1 = new RegExp(`<meta[^>]*?${attr}=["']${nameOrProp}["'][^>]*?content="([^"]*)"`, 'i');
  const regex2 = new RegExp(`<meta[^>]*?content="([^"]*)"[^>]*?${attr}=["']${nameOrProp}["']`, 'i');
  const m1 = html.match(regex1);
  if (m1) return m1[1];
  const m2 = html.match(regex2);
  if (m2) return m2[1];
  return null;
}

htmlFiles.forEach(f => {
  const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');

  // Title
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  if (title) {
    if (!titlesMap.has(title)) titlesMap.set(title, []);
    titlesMap.get(title).push(relPath);
  }

  // Description
  const desc = getMetaContent(html, 'description', false);
  if (desc) {
    if (!descriptionsMap.has(desc)) descriptionsMap.set(desc, []);
    descriptionsMap.get(desc).push(relPath);
  }

  // Canonical
  const canonMatch = html.match(/<link[^>]*?rel=["']canonical["'][^>]*?href=["']([^"']*)["']/i) ||
                     html.match(/<link[^>]*?href=["']([^"']*)["'][^>]*?rel=["']canonical["']/i);
  const canonical = canonMatch ? canonMatch[1].trim() : null;
  if (canonical) {
    if (!canonicalsMap.has(canonical)) canonicalsMap.set(canonical, []);
    canonicalsMap.get(canonical).push(relPath);
  }

  // Headings
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) {
    h1Errors.push({ relPath, count: h1s.length });
  }

  // Schemas
  const scriptBlocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  scriptBlocks.forEach((block, idx) => {
    try {
      JSON.parse(block[1].trim());
    } catch (e) {
      schemaErrors.push({ relPath, error: e.message, blockIdx: idx });
    }
  });

  // WhatsApp unencoded apostrophe
  const waMatches = [...html.matchAll(/href=["'](https:\/\/wa\.me\/[^"']*'[^"']*)["']/gi)];
  if (waMatches.length > 0) {
    unencodedWa.push({ relPath, count: waMatches.length });
  }
});

// Sitemap check
const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const sitemapLocs = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());

const duplicateTitles = [...titlesMap.entries()].filter(([t, paths]) => paths.length > 1);
const duplicateDescriptions = [...descriptionsMap.entries()].filter(([d, paths]) => paths.length > 1);
const duplicateCanonicals = [...canonicalsMap.entries()].filter(([c, paths]) => paths.length > 1);

console.log('\n================ VALIDATION RESULTS ================');
console.log(`Total HTML Files: ${htmlFiles.length}`);
console.log(`Total URLs in Sitemap: ${sitemapLocs.length}`);
console.log(`Duplicate Titles: ${duplicateTitles.length}`);
if (duplicateTitles.length > 0) console.log(JSON.stringify(duplicateTitles, null, 2));

console.log(`Duplicate Descriptions: ${duplicateDescriptions.length}`);
if (duplicateDescriptions.length > 0) console.log(JSON.stringify(duplicateDescriptions, null, 2));

console.log(`Duplicate Canonicals: ${duplicateCanonicals.length}`);
if (duplicateCanonicals.length > 0) console.log(JSON.stringify(duplicateCanonicals, null, 2));

console.log(`H1 Errors (pages != 1 H1): ${h1Errors.length}`);
console.log(`JSON-LD Schema Errors: ${schemaErrors.length}`);
console.log(`Unencoded WhatsApp URLs: ${unencodedWa.length}`);

console.log('====================================================');
