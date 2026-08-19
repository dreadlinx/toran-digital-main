const fs = require('fs');
const path = require('path');

function getMobileNavMarkup(rel) {
  return `
<!-- Mobile Navigation Overlay -->
<div class="mobile-nav" id="mobileNav">
  <a class="mobile-nav-link" href="${rel}">Home</a>
  <button class="mobile-nav-link mobile-services-toggle" type="button">
    Our Services
    <svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><polyline points="6 9 12 15 18 9"></polyline></svg>
  </button>
  <div class="mobile-services-list">
    <a href="${rel}web-design/">Website Design</a>
    <a href="${rel}mobile-apps/">Mobile Apps</a>
    <a href="${rel}seo-marketing/">SEO &amp; Google Ads</a>
    <a href="${rel}vehicle-branding/">Vehicle Branding</a>
    <a href="${rel}dstv-installations/">DSTV Installations</a>
    <a href="${rel}graphic-design/">Graphic Design</a>
    <a href="${rel}services/" style="font-weight: 700; color: var(--accent-red); margin-top: 5px;">All Services →</a>
  </div>
  <a class="mobile-nav-link" href="${rel}portfolio/">Portfolio</a>
  <a class="mobile-nav-link" href="${rel}about/">About</a>
  <a class="mobile-nav-link" href="${rel}areas/">Areas</a>
  <a class="mobile-nav-link" href="${rel}blog/">Blog</a>
  <a class="mobile-nav-link" href="${rel}contact/">Contact</a>
  <a class="btn btn-whatsapp btn-lg" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" rel="noopener" target="_blank" style="margin-top: 1rem;">
    WhatsApp Us
  </a>
</div>
`;
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) getFiles(fullPath, fileList);
    else if (file.endsWith('.html')) fileList.push(fullPath);
  }
  return fileList;
}

const htmlFiles = getFiles('.');
let injected = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="mobileNav"')) {
    const depth = file.split(path.sep).length - 1;
    const rel = depth === 0 ? './' : depth === 1 ? '../' : '../../';
    const markup = getMobileNavMarkup(rel);

    if (content.includes('</header>')) {
      content = content.replace('</header>', `</header>\n${markup}`);
      fs.writeFileSync(file, content);
      console.log(`[INJECTED mobileNav]: ${file}`);
      injected++;
    }
  }
}

console.log(`Successfully injected mobileNav into ${injected} pages.`);
