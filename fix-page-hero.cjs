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

  html = html.replace(/\.page-hero\s*\{\s*padding:\s*6rem\s*1rem\s*3rem;\s*margin:\s*0\s*auto;\s*max-width:\s*1200px;/g, 
  `.page-hero {
      padding: 6rem 1rem 3rem;
      margin: 0 auto;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;`);
      
  html = html.replace(/\.page-hero h1\s*\{\s*margin:\s*0\.5rem\s+auto\s+0;\s*font-family:\s*"Sora",\s*sans-serif;\s*font-size:\s*clamp\(2\.2rem,\s*3\.8vw,\s*3\.8rem\);/g, 
  `.page-hero h1 {
      margin: 0.5rem auto 0;
      font-family: "Sora", sans-serif;
      font-size: clamp(2.2rem, 3.8vw, 3.8rem);
      text-align: center;`);
      
  fs.writeFileSync(file, html);
});
console.log('done aligning page-hero');
