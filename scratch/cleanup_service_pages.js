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
console.log('Cleaning up duplicate whatsapp-float and normalizing service pages across:', htmlFiles.length);

let cleanedFloats = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Remove duplicate whatsapp-float
  if (content.includes('class="whatsapp-float"')) {
    content = content.replace(/<!-- WhatsApp Floating Widget -->[\s\S]*?<div class="whatsapp-float">[\s\S]*?<\/div>/g, '');
    content = content.replace(/<div class="whatsapp-float">[\s\S]*?<\/div>/g, '');
    changed = true;
    cleanedFloats++;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

console.log(`Successfully removed duplicate whatsapp-float from ${cleanedFloats} files.`);
