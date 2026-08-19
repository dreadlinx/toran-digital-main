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
console.log('Auditing and repairing all HTML files:', htmlFiles.length);

let jsInjected = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const depth = file.split(path.sep).length - 1;
  const relJs = depth === 0 ? 'index.js' : depth === 1 ? '../index.js' : '../../index.js';
  
  // Ensure index.js is linked
  if (!content.includes('index.js')) {
    content = content.replace('</body>', `<script src="${relJs}"></script>\n</body>`);
    fs.writeFileSync(file, content);
    jsInjected++;
    console.log(`Injected index.js in ${file}`);
  }
}

console.log(`Finished checking scripts. Injected in ${jsInjected} files.`);
