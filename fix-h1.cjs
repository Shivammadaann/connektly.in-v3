const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // Fix Eyebrow
  html = html.replace(/\.eyebrow\s*\{[\s\S]*?color:\s*rgba\(19, 54, 41, 0\.72\);[\s\S]*?\}/, `.eyebrow {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: var(--green-deep);
      padding: 0.42rem 0.72rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      box-shadow: 0 4px 12px rgba(24, 60, 47, 0.04);
      margin-bottom: 0.5rem;
    }`);
    
  // Center H1s / section headings
  html = html.replace(/\.section-heading\s*\{\s*display:\s*grid;\s*gap:\s*0\.9rem;\s*max-width:\s*760px;\s*padding:\s*2rem\s*0;\s*\}/, `.section-heading {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.9rem;
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 0;
    }`);

  html = html.replace(/\.section-heading--split\s*\{\s*max-width:\s*none;\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(280px,\s*430px\);\s*align-items:\s*end;\s*\}/, `.section-heading--split {
      max-width: 860px;
    }`);

  // Replace heading font sizing so they are same size
  // Wait, let's just make sure we replace the right blocks.
  // Using string replacements for safer operations.

  // Remove ##0b6fff error and fix it
  html = html.replace(/color: ##0b6fff;/g, 'color: #0b6fff;');

  // Update nav links to have trailing slashes
  html = html.replace(/href="\/pricing"/g, 'href="/pricing/"');
  html = html.replace(/href="\/features"/g, 'href="/features/"');
  html = html.replace(/href="\/contact"/g, 'href="/contact/"');
  html = html.replace(/href="\/product\/whatsapp"/g, 'href="/product/whatsapp/"');

  // Center align text
  html = html.replace(/\.section-heading p \{/g, '.section-heading p {\n      text-align: center;');

  fs.writeFileSync(file, html);
});
console.log('done updating h1 and eyebrows');
