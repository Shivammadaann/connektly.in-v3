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

  // Make all H1 and H2 uniform size
  html = html.replace(/\.page-hero h1\s*\{\s*margin:\s*0\.5rem\s+auto\s+0;\s*font-family:\s*"Sora",\s*sans-serif;\s*font-size:\s*clamp\(2\.25rem,\s*3\.5vw,\s*3\.25rem\);/g, 
  `.page-hero h1 {
      margin: 0.5rem auto 0;
      font-family: "Sora", sans-serif;
      font-size: clamp(2.2rem, 3.8vw, 3.8rem);`);

  html = html.replace(/font-size:\s*clamp\(2\.15rem,\s*3\.2vw,\s*3\.15rem\);/g, `font-size: clamp(2.2rem, 3.8vw, 3.8rem);`);

  html = html.replace(/font-size:\s*clamp\(2\.1rem,\s*4vw,\s*4\.35rem\);/g, `font-size: clamp(2.2rem, 3.8vw, 3.8rem);`);

  html = html.replace(/font-size:\s*clamp\(2\.75rem,\s*4\.9vw,\s*5\.44rem\)\s*!important;/g, `font-size: clamp(2.8rem, 4.2vw, 4.2rem) !important; text-align: center; margin-left: auto; margin-right: auto; justify-content: center;`);

  // Ensure hero content is center aligned
  html = html.replace(/\.hero__content\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*gap:\s*1\.6rem;/g, 
  `.hero__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.6rem;`);

  html = html.replace(/\.hero__content\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*flex-start;/g, 
  `.hero__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;`);

  html = html.replace(/\.page-hero__lede\s*\{[\s\S]*?\}/g, 
  `.page-hero__lede {
      margin: 1.25rem auto 0;
      color: var(--muted);
      font-size: clamp(1rem, 1.25vw, 1.15rem);
      line-height: 1.6;
      max-width: 60ch;
      text-align: center;
    }`);

  // Broadcast layout and solution panels center alignment adjustments?
  // They are two-column grid. Let's keep them left aligned inside their panel?
  // User ONLY said: "fix and organize H1 of each section, every h1 should be same size, centre aligned"
  
  html = html.replace(/\.copy-panel h2\s*\{/, '.copy-panel h2 {\n      text-align: center;');

  // Make sure eyebrow background is fixed dynamically across all sections
  // We did this in the previous step.

  fs.writeFileSync(file, html);
});

console.log('done unifying sizing and alignment');
