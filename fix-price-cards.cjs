const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\.compact-pricing-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*1fr\);\s*gap:\s*1\.5rem;\s*align-items:\s*stretch;\s*max-width:\s*1100px;\s*margin:\s*0\s*auto;\s*\}/, 
`.compact-pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      align-items: stretch;
      max-width: 1160px;
      margin: 0 auto;
    }`);
    
fs.writeFileSync('index.html', html);
console.log('updated width of price cards grid');
