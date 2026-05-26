const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// replace .page-hero h1 clamp
html = html.replace(
  /(\.page-hero h1\s*\{[\s\S]*?)font-size:\s*clamp\(2\.2rem,\s*3\.8vw,\s*3\.8rem\);/g,
  '$1font-size: clamp(1.76rem, 3.04vw, 3.04rem);'
);

// replace .doc-section h1 clamp
html = html.replace(
  /(\.doc-section h1\s*\{[\s\S]*?)font-size:\s*clamp\(2\.25rem,\s*3\.5vw,\s*3\.25rem\);/g,
  '$1font-size: clamp(1.8rem, 2.8vw, 2.6rem);'
);

// replace max-width: 760px page-hero h1, doc-section h1 clamp
html = html.replace(
  /font-size:\s*clamp\(2rem,\s*8vw,\s*3rem\);/g,
  'font-size: clamp(1.6rem, 6.4vw, 2.4rem);'
);

// replace max-width: 500px page-hero h1, doc-section h1 clamp
html = html.replace(
  /font-size:\s*clamp\(1\.8rem,\s*7\.5vw,\s*2\.25rem\);/g,
  'font-size: clamp(1.44rem, 6vw, 1.8rem);'
);

// Make sure other pages get it if spread
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) { 
            walk(file);
        } else if (file.endsWith('.html') && !file.includes('index.html')) {
            let html2 = fs.readFileSync(file, 'utf8');
            let updated = html2
                .replace(/font-size:\s*clamp\(2\.2rem,\s*3\.8vw,\s*3\.8rem\);/g, 'font-size: clamp(1.76rem, 3.04vw, 3.04rem);')
                .replace(/font-size:\s*clamp\(2\.25rem,\s*3\.5vw,\s*3\.25rem\);/g, 'font-size: clamp(1.8rem, 2.8vw, 2.6rem);')
                .replace(/font-size:\s*clamp\(2rem,\s*8vw,\s*3rem\);/g, 'font-size: clamp(1.6rem, 6.4vw, 2.4rem);')
                .replace(/font-size:\s*clamp\(1\.8rem,\s*7\.5vw,\s*2\.25rem\);/g, 'font-size: clamp(1.44rem, 6vw, 1.8rem);');
            if (html2 !== updated) {
                fs.writeFileSync(file, updated);
            }
        }
    });
}
walk('.');
fs.writeFileSync('index.html', html);
