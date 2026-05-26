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

  // Let's ensure text-wrap: balance is REMOVED from .section-heading h2 just in case
  // But we didn't find any.
  // We'll forcefully add CSS to make sure .section-heading h2 is truly centered and single line.
  
  html = html.replace(/<\/style>/, 
  `  .section-heading {
      align-items: center !important;
      text-align: center !important;
      max-width: 100% !important;
    }
    .section-heading h2 {
      text-align: center !important;
      white-space: nowrap !important;
      max-width: 100% !important;
    }
    @media (max-width: 1024px) {
      .section-heading h2 {
        white-space: normal !important;
      }
    }
    
    .faq__intro h2, .omnichannel .copy-panel h2 {
      text-align: left !important;
      white-space: normal !important;
    }
  </style>`);
  
  // Wait, I shouldn't just append to </style> because there might be multiple </style>
  html = html.replace(/<\/head>/, 
  `<style>
    .section-heading {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      max-width: 100% !important;
    }
    .section-heading h2 {
      text-align: center !important;
      white-space: nowrap !important;
      max-width: 100% !important;
    }
    @media (max-width: 1024px) {
      .section-heading h2 {
        white-space: normal !important;
      }
    }
    
    .faq__intro h2, .omnichannel .copy-panel h2 {
      text-align: left !important;
      white-space: normal !important;
    }
  </style>
  </head>`);

  // Remove inner divs from section-heading--split just in case (we did for index.html, let's do globally)
  html = html.replace(/<div class="section-heading section-heading--split reveal">\s*<div>/g, '<div class="section-heading section-heading--split reveal">');
  html = html.replace(/<\/h2>\s*<\/div>\s*<\/div>/g, '</h2>\n      </div>');

  fs.writeFileSync(file, html);
});

console.log('Fixed single line and center align globally');
