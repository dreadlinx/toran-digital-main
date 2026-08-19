const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve('c:/Users/lovec/Downloads/toran-digital-main 3/toran-digital-main');

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

function getMetaContent(html, nameOrProp, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  // Match tag with attr first or content first
  const regex1 = new RegExp(`<meta[^>]*?${attr}=["']${nameOrProp}["'][^>]*?content=["']([^"']*)["']`, 'i');
  const regex2 = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?${attr}=["']${nameOrProp}["']`, 'i');
  const m1 = html.match(regex1);
  if (m1) return m1[1];
  const m2 = html.match(regex2);
  if (m2) return m2[1];
  return null;
}

const report = [];

htmlFiles.forEach(f => {
  const relPath = path.relative(ROOT_DIR, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const desc = getMetaContent(html, 'description', false);
  const robots = getMetaContent(html, 'robots', false);
  const ogTitle = getMetaContent(html, 'og:title', true);
  const ogDesc = getMetaContent(html, 'og:description', true);
  const ogImage = getMetaContent(html, 'og:image', true);
  const ogUrl = getMetaContent(html, 'og:url', true);
  const ogType = getMetaContent(html, 'og:type', true);
  const twCard = getMetaContent(html, 'twitter:card', false);
  const twTitle = getMetaContent(html, 'twitter:title', false);
  const twDesc = getMetaContent(html, 'twitter:description', false);
  const twImage = getMetaContent(html, 'twitter:image', false);

  const canonMatch = html.match(/<link[^>]*?rel=["']canonical["'][^>]*?href=["']([^"']*)["']/i) ||
                     html.match(/<link[^>]*?href=["']([^"']*)["'][^>]*?rel=["']canonical["']/i);
  const canonical = canonMatch ? canonMatch[1].trim() : null;

  report.push({
    relPath,
    title,
    titleLen: title ? title.length : 0,
    desc,
    descLen: desc ? desc.length : 0,
    canonical,
    robots,
    ogTitle,
    ogDesc,
    ogImage,
    ogUrl,
    ogType,
    twCard,
    twTitle,
    twDesc,
    twImage
  });
});

const missingDesc = report.filter(r => !r.desc);
const missingOgTitle = report.filter(r => !r.ogTitle);
const missingOgDesc = report.filter(r => !r.ogDesc);
const missingOgImage = report.filter(r => !r.ogImage);
const missingTwCard = report.filter(r => !r.twCard);
const missingCanonical = report.filter(r => !r.canonical);

console.log('=== ACCURATE META TAG AUDIT ===');
console.log(`Total Pages: ${report.length}`);
console.log(`Missing Meta Descriptions: ${missingDesc.length}`);
missingDesc.forEach(r => console.log(`  - ${r.relPath}`));

console.log(`\nMissing Canonical URLs: ${missingCanonical.length}`);
console.log(`\nMissing og:title: ${missingOgTitle.length}`);
console.log(`Missing og:description: ${missingOgDesc.length}`);
console.log(`Missing og:image: ${missingOgImage.length}`);
console.log(`Missing twitter:card: ${missingTwCard.length}`);

if (missingOgImage.length > 0) {
  console.log('\nPages with missing OG Image:');
  missingOgImage.forEach(r => console.log(`  - ${r.relPath}`));
}

