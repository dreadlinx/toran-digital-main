const fs = require('fs');
const path = require('path');

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
console.log('Synchronizing navigation active states and footers across all HTML files:', htmlFiles.length);

let modified = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const isHome = file === 'index.html';

  // 1. Remove hardcoded active on Home for non-home pages
  if (!isHome) {
    if (content.includes('<a class="active" href="../">Home</a>')) {
      content = content.replace('<a class="active" href="../">Home</a>', '<a href="../">Home</a>');
      changed = true;
    }
    if (content.includes('<a class="active" href="../../">Home</a>')) {
      content = content.replace('<a class="active" href="../../">Home</a>', '<a href="../../">Home</a>');
      changed = true;
    }
    if (content.includes('<a class="mobile-nav-link active" href="../">Home</a>')) {
      content = content.replace('<a class="mobile-nav-link active" href="../">Home</a>', '<a class="mobile-nav-link" href="../">Home</a>');
      changed = true;
    }
    if (content.includes('<a class="mobile-nav-link active" href="../../">Home</a>')) {
      content = content.replace('<a class="mobile-nav-link active" href="../../">Home</a>', '<a class="mobile-nav-link" href="../../">Home</a>');
      changed = true;
    }
  }

  // 2. Normalize footer markup if needed
  const depth = file.split(path.sep).length - 1;
  const rel = depth === 0 ? '' : depth === 1 ? '../' : '../../';

  if (!isHome && content.includes('<footer class="site-footer">')) {
    // Check if footer-top-banner is missing
    if (!content.includes('footer-top-banner')) {
      content = content.replace(
        '<footer class="site-footer">\n<div class="container">',
        `<footer class="site-footer">\n<div class="container">\n<div class="footer-top-banner">\n  <div class="footer-mega-title">TORAN <span class="accent-red">DIGITAL</span></div>\n</div>`
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    modified++;
  }
}

console.log(`Successfully normalized ${modified} files.`);
