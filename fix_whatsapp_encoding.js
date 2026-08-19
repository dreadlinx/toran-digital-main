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
let fixedCount = 0;

htmlFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes("wa.me/27696219479?text=")) {
    let modified = content.replace(/(href="https:\/\/wa\.me\/27696219479\?text=[^"]*)/g, (match) => {
      return match.replace(/'/g, '%27');
    });
    if (modified !== content) {
      fs.writeFileSync(f, modified, 'utf8');
      fixedCount++;
    }
  }
});

console.log(`Successfully fixed WhatsApp URL encoding across ${fixedCount} files!`);
