const fs = require('fs');

const globalJs = 'components/global.js';

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

  // Left align Hero
  html = html.replace(/\.hero__content\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*center;\s*text-align:\s*center;/g, 
  `.hero__content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;`);

  html = html.replace(/max-width: 12\.6ch !important;\s*margin-top: 0\.92rem !important;\s*font-size: clamp\(2\.8rem, 4\.2vw, 4\.2rem\) !important; text-align: center; margin-left: auto; margin-right: auto; justify-content: center;/g, 
  `max-width: 12.6ch !important;
      margin-top: 0.92rem !important;
      font-size: clamp(2.8rem, 4.2vw, 4.2rem) !important;
      text-align: left;
      margin-left: 0;
      margin-right: auto;
      justify-content: flex-start;`);

  fs.writeFileSync(file, html);
});
console.log('done hero');
