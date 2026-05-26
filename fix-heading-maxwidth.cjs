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

  // Change .section-heading max-width from 860px to 100%
  html = html.replace(/\.section-heading\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*center;\s*text-align:\s*center;\s*gap:\s*0\.9rem;\s*max-width:\s*860px;/g,
  `.section-heading {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.9rem;
      max-width: 100%;`);

  html = html.replace(/\.section-heading--split\s*\{\s*max-width:\s*860px;\s*\}/g,
  `.section-heading--split {
      max-width: 100%;
    }`);

  // Also remove inner div from section-heading--split so flex-direction column directly affects the elements and it centers beautifully
  html = html.replace(/<div class="section-heading section-heading--split reveal">\s*<div>\s*<span class="eyebrow">Key features and capabilities<\/span>\s*<h2>One platform, three focused playbooks\.<\/h2>\s*<\/div>\s*<\/div>/g, 
  `<div class="section-heading section-heading--split reveal">
        <span class="eyebrow">Key features and capabilities</span>
        <h2>One platform, three focused playbooks.</h2>
      </div>`);

  fs.writeFileSync(file, html);
});

console.log('Fixed wrapper width for H1 text line block');
