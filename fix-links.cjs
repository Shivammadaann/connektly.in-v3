const fs = require('fs');

const globalJs = 'components/global.js';
let content = fs.readFileSync(globalJs, 'utf8');

content = content.replace(/href="\/pricing"/g, 'href="/pricing/"');
content = content.replace(/href="\/features"/g, 'href="/features/"');
content = content.replace(/href="\/contact"/g, 'href="/contact/"');
content = content.replace(/href="\/product\/whatsapp"/g, 'href="/product/whatsapp/"');
content = content.replace(/href="\/faq"/g, 'href="/faq/"');

fs.writeFileSync(globalJs, content);

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

  // Add hover effects globally
  if(!html.includes('button:hover {')) {
    const hoverStyles = `
    a, button {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    a:hover {
      opacity: 0.85;
    }
    button:hover {
      transform: translateY(-2px);
    }
    .broadcast-card {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .solution-panel {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .feature-line {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .compact-price-card {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .broadcast-card:hover, .solution-panel:hover, .feature-line:hover, .compact-price-card:hover {
      transform: translateY(-4px);
    }
    `;
    html = html.replace('</style>', hoverStyles + '\n  </style>');
  }
  
  html = html.replace(/\.section-heading\s*h2,\s*\.trust__content\s*h2,\s*\.contact__card\s*h2\s*\{\s*font-size:\s*clamp\(2rem,\s*3\.3vw,\s*3\.35rem\);\s*\}/, 
  `.section-heading h2,
    .trust__content h2,
    .contact__card h2 {
      font-size: clamp(2.2rem, 3.8vw, 3.8rem);
    }`);

  fs.writeFileSync(file, html);
});

console.log('done updating links and hover effects');
