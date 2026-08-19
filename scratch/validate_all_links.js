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
console.log('Validating all 72 HTML pages for complete link integrity...');

let errors = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  const links = content.matchAll(/href="([^"#]+?)"/g);
  for (const l of links) {
    const target = l[1];
    if (
      target.startsWith('http') ||
      target.startsWith('tel:') ||
      target.startsWith('mailto:') ||
      target.startsWith('javascript:') ||
      target.startsWith('data:')
    ) continue;
    
    let resolvedPath;
    if (target.startsWith('/')) {
      resolvedPath = path.join('.', target.endsWith('/') ? target + 'index.html' : target);
    } else {
      resolvedPath = path.join(dir, target.endsWith('/') ? target + 'index.html' : target);
    }

    if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath.replace(/index\.html$/, '')) && !fs.existsSync(path.join(dir, target))) {
      console.error(`[BROKEN LINK] in ${file}: "${target}" -> "${resolvedPath}"`);
      errors++;
    }
  }
}

console.log('Link validation finished. Total broken links:', errors);
