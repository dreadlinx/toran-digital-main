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
console.log('Verifying mobile navigation overlay across all pages:', htmlFiles.length);

let missing = 0;
let fixed = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="mobileNav"')) {
    console.log(`[MISSING mobileNav]: ${file}`);
    missing++;
  }
}

console.log(`Audit complete. Missing mobileNav count: ${missing}`);
