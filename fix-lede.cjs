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

  html = html.replace(/\.hero__lede\s*\{\s*max-width:\s*55ch\s*!important;\s*margin-top:\s*0\.82rem\s*!important;\s*font-size:\s*1\.12rem\s*!important;\s*line-height:\s*1\.65\s*!important;\s*text-align:\s*center;\s*margin-left:\s*auto;\s*margin-right:\s*auto;\s*\}/g, 
  `.hero__lede {
      max-width: 55ch !important;
      margin-top: 0.82rem !important;
      font-size: 1.12rem !important;
      line-height: 1.65 !important;
      text-align: left;
      margin-left: 0;
      margin-right: auto;
    }`);

  html = html.replace(/\.hero__actions\s*\{\s*display:\s*flex;\s*gap:\s*0\.8rem;\s*margin-top:\s*0\.85rem;\s*justify-content:\s*center;/g, 
  `.hero__actions {
      display: flex;
      gap: 0.8rem;
      margin-top: 0.85rem;
      justify-content: flex-start;`);

  fs.writeFileSync(file, html);
});
console.log('done hero lede and actions');
