const fs = require('fs');

const css = fs.readFileSync('index.css', 'utf8');
const lines = css.split('\n');

console.log('Scanning index.css for potential mobile layout breaking rules:');

lines.forEach((line, i) => {
  if (
    line.includes('grid-template-columns') ||
    line.includes('min-width') ||
    line.includes('width:') && !line.includes('100%') && !line.includes('max-width') && !line.includes('auto')
  ) {
    if (i < 2740) { // before responsive overrides
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
});
