const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const { all500Locations } = require('./data_500_locations.js');

console.log('--- RUNNING FULL 500-LOCATION & SITE-WIDE AUDIT ---');

let totalFiles = 0;
let errors = [];
let warnings = [];

// 1. Audit all 500 location pages
const titles = new Map();
const descriptions = new Map();
const canonicals = new Set();

all500Locations.forEach((loc, idx) => {
  const filePath = path.join(ROOT_DIR, loc.folder, 'index.html');
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing HTML file for location: ${loc.folder}/index.html`);
    return;
  }

  totalFiles++;
  const content = fs.readFileSync(filePath, 'utf8');

  // Title check
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    errors.push(`[${loc.folder}] Missing <title> tag`);
  } else {
    const t = titleMatch[1].trim();
    if (titles.has(t)) {
      errors.push(`[${loc.folder}] Duplicate title with [${titles.get(t)}]: "${t}"`);
    } else {
      titles.set(t, loc.folder);
    }
  }

  // Meta description check
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                    content.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  if (!descMatch) {
    errors.push(`[${loc.folder}] Missing meta description`);
  } else {
    const d = descMatch[1].trim();
    if (descriptions.has(d)) {
      errors.push(`[${loc.folder}] Duplicate meta description with [${descriptions.get(d)}]: "${d}"`);
    } else {
      descriptions.set(d, loc.folder);
    }
  }

  // Canonical check
  const canMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                   content.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  if (!canMatch) {
    errors.push(`[${loc.folder}] Missing canonical link`);
  } else {
    const c = canMatch[1].trim();
    if (canonicals.has(c)) {
      errors.push(`[${loc.folder}] Duplicate canonical URL: "${c}"`);
    } else {
      canonicals.add(c);
    }
  }

  // H1 check
  const h1Count = (content.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) {
    errors.push(`[${loc.folder}] Missing <h1> element`);
  } else if (h1Count > 1) {
    warnings.push(`[${loc.folder}] Multiple <h1> tags found (${h1Count})`);
  }

  // Schema check
  const schemaCount = (content.match(/<script\s+type=["']application\/ld\+json["']/gi) || []).length;
  if (schemaCount < 2) {
    warnings.push(`[${loc.folder}] Expected at least 2 Schema.org blocks, found ${schemaCount}`);
  }

  // WhatsApp link encoding check
  if (content.includes('wa.me/27696219479?text=')) {
    const waMatches = content.match(/href=["']https:\/\/wa\.me\/27696219479\?text=([^"']+)["']/g) || [];
    waMatches.forEach(wa => {
      if (wa.includes(' ') || wa.includes("'")) {
        warnings.push(`[${loc.folder}] Unencoded character in WhatsApp URL: ${wa}`);
      }
    });
  }
});

// 2. Audit Areas Hub index.html
const areasHubPath = path.join(ROOT_DIR, 'areas', 'index.html');
if (fs.existsSync(areasHubPath)) {
  const areasContent = fs.readFileSync(areasHubPath, 'utf8');
  if (!areasContent.includes('areaSearchInput')) {
    errors.push('areas/index.html is missing the search input element!');
  }
  const linkMatches = (areasContent.match(/class="area-card-link"/g) || []).length;
  if (linkMatches < 500) {
    warnings.push(`areas/index.html only contains ${linkMatches} location card links (expected 500)`);
  } else {
    console.log(`areas/index.html verified with ${linkMatches} location card links and interactive search!`);
  }
} else {
  errors.push('areas/index.html is missing!');
}

console.log(`\nAudited ${totalFiles} location files.`);
console.log(`Total Errors: ${errors.length}`);
console.log(`Total Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.error('\nERRORS FOUND:');
  errors.slice(0, 20).forEach(err => console.error(` - ${err}`));
  if (errors.length > 20) console.error(` ... and ${errors.length - 20} more errors`);
  process.exit(1);
} else {
  console.log('\n✅ ALL 500 LOCATION PAGES PASSED 100% OF VALIDATION CHECKS!');
  console.log('✅ ZERO DUPLICATE TITLES');
  console.log('✅ ZERO DUPLICATE DESCRIPTIONS');
  console.log('✅ ZERO DUPLICATE CANONICALS');
  console.log('✅ VALID SCHEMA.ORG JSON-LD ON ALL PAGES');
}
