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

  // Fix max-width of 20ch
  html = html.replace(/\.hero__content\s*h1,\s*\.page-hero\s*h1,\s*\.section-heading\s*h2\s*\{\s*max-width:\s*20ch;\s*\}/g,
  `.hero__content h1,
      .page-hero h1 {
        max-width: 20ch;
      }
      .section-heading h2 {
        max-width: none;
      }`);

  // Also remove max-width 20ch for .section-heading h2 in any other media query if exists
  html = html.replace(/\.page-hero\s*h1,\s*\.section-heading\s*h2\s*\{\s*max-width:\s*20ch;\s*\}/g,
  `.page-hero h1 {
        max-width: 20ch;
      }
      .section-heading h2 {
        max-width: none;
      }`);

  // Re-left align .copy-panel h2
  html = html.replace(/\.copy-panel h2\s*\{\s*text-align:\s*center;/g, '.copy-panel h2 {');
  
  // Re-left align omnichannel h2
  html = html.replace(/\.omnichannel__layout\s*\.copy-panel\s*h2\s*\{\s*text-align:\s*center;/g, '.omnichannel__layout .copy-panel h2 {');

  // Make text-align left for FAQ and Omnichannel panels specifically just in case
  html = html.replace(/\.faq__intro\s*h2\s*\{/g, '.faq__intro h2 {\n      text-align: left;');
  html = html.replace(/\.copy-panel\s*h2\s*\{/g, '.copy-panel h2 {\n      text-align: left;');

  // Make sure .section-heading has max-width: none for h2 so they stay on a single line where possible
  // Update: "words are not in a single line." 

  // Make sure .section-heading h2 specifically doesn't have restrictive max-width
  
  fs.writeFileSync(file, html);
});

console.log('Fixed H1 wrap and Omnichannel/FAQ alignment');
