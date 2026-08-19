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
console.log('Auditing total HTML pages:', htmlFiles.length);

let totalIssues = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // 1. Check stylesheet link
  const cssMatch = content.match(/href="([^"]*index\.css)"/);
  if (!cssMatch) {
    console.error(`[NO INDEX.CSS] ${file}`);
    totalIssues++;
  } else {
    const cssPath = path.join(dir, cssMatch[1]);
    if (!fs.existsSync(cssPath)) {
      console.error(`[BROKEN CSS LINK] ${file} -> ${cssMatch[1]}`);
      totalIssues++;
    }
  }

  // 2. Check JS link
  const jsMatch = content.match(/src="([^"]*index\.js)"/);
  if (!jsMatch) {
    console.warn(`[NO INDEX.JS] ${file}`);
  } else {
    const jsPath = path.join(dir, jsMatch[1]);
    if (!fs.existsSync(jsPath)) {
      console.error(`[BROKEN JS LINK] ${file} -> ${jsMatch[1]}`);
      totalIssues++;
    }
  }

  // 3. Check image sources
  const imgMatches = content.matchAll(/src="([^"]+?\.(?:webp|png|jpg|jpeg|svg))"/g);
  for (const m of imgMatches) {
    const imgSrc = m[1];
    if (imgSrc.startsWith('http')) continue;
    const imgPath = path.join(dir, imgSrc);
    if (!fs.existsSync(imgPath)) {
      console.error(`[MISSING IMAGE] in ${file}: ${imgSrc}`);
      totalIssues++;
    }
  }
}

console.log('Audit completed. Total critical issues:', totalIssues);
