const fs = require('fs');
const path = require('path');

const utilityBar = `
<!-- ==================== TOP UTILITY BAR ==================== -->
<div class="studio-utility-bar">
  <div class="container">
    <div class="utility-bar-inner">
      <div class="utility-left">
        <span class="live-status-indicator">
          <span class="live-status-dot"></span>
          <span>Field Crews Active: JHB &amp; Pretoria</span>
        </span>
        <span class="jhb-clock" id="jhbClock">JHB GMT+2 — 12:00:00</span>
      </div>
      <div class="utility-right">
        <a class="utility-link" href="tel:+27696219479">Direct: +27 69 621 9479</a>
        <a class="utility-link" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" rel="noopener" target="_blank">WhatsApp Hotline</a>
      </div>
    </div>
  </div>
</div>
`;

const tacticalHud = `
<div class="tactical-hud">
  <a class="hud-btn whatsapp" href="https://wa.me/27696219479?text=Hi%20Toran%20Digital%2C%20I%27d%20like%20a%20free%20quote" target="_blank" rel="noopener">
    <span>WhatsApp</span>
  </a>
</div>
`;

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
console.log(`Processing ${htmlFiles.length} HTML pages for complete brutalist structure unification...`);

let count = 0;
for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Ensure bg-noise-overlay after <body>
  if (!content.includes('bg-noise-overlay')) {
    content = content.replace(/<body[^>]*>/, '$&\n<div class="bg-noise-overlay"></div>');
    changed = true;
  }

  // 2. Ensure studio-utility-bar before <header
  if (!content.includes('studio-utility-bar')) {
    content = content.replace(/<header class="site-header"/, `${utilityBar}\n<header class="site-header"`);
    changed = true;
  }

  // 3. Ensure tactical-hud before </body>
  if (!content.includes('tactical-hud')) {
    content = content.replace(/<\/body>/, `${tacticalHud}\n</body>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    count++;
  }
}

console.log(`Successfully unified brutalist components across ${count} pages.`);
