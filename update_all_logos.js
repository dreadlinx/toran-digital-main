const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

// 1. Ensure logo files exist
const newLogoSource = path.join(ROOT_DIR, 'assets', 'toran_logo_webweave (1).webp');
const newLogoDestAssets = path.join(ROOT_DIR, 'assets', 'toran_logo.webp');
const newLogoDestLogo = path.join(ROOT_DIR, 'logo', 'toran_logo.webp');
const newLogoDestLogoPng = path.join(ROOT_DIR, 'logo', 'toran_logo.webp');

if (fs.existsSync(newLogoSource)) {
  fs.copyFileSync(newLogoSource, newLogoDestAssets);
  fs.copyFileSync(newLogoSource, newLogoDestLogo);
  fs.copyFileSync(newLogoSource, newLogoDestLogoPng);
  console.log('Successfully synchronized new logo to assets/ and logo/ directories.');
}

// 2. Scan and replace logo paths across all HTML and JS files
function updateFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.agents', 'scratch', '.system_generated'].includes(entry.name)) {
        updateFiles(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace toran_logo.webp with toran_logo.webp
      if (content.includes('toran_logo.webp')) {
        content = content.replace(/toran_logo_perfect\.png/g, 'toran_logo.webp');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

updateFiles(ROOT_DIR);
console.log('Successfully updated logo references across all HTML and JS files.');
