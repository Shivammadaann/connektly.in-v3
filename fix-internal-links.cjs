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

  // Same regex replacements for internal html content
  html = html.replace(/href="\/product\/whatsapp\/?(\b|")/g, 'href="/product/whatsapp/index.html"');
  html = html.replace(/href="\/product\/messenger\/?(\b|")/g, 'href="/product/messenger/index.html"');
  html = html.replace(/href="\/product\/instagram\/?(\b|")/g, 'href="/product/instagram/index.html"');

  html = html.replace(/href="\/features\/?(\b|")/g, 'href="/features/index.html"');
  html = html.replace(/href="\/pricing\/?(\b|")/g, 'href="/pricing/index.html"');
  html = html.replace(/href="\/contact\/?(\b|")/g, 'href="/contact/index.html"');
  html = html.replace(/href="\/faq\/?(\b|")/g, 'href="/faq/index.html"');
  html = html.replace(/href="\/book-demo\/?(\b|")/g, 'href="/book-demo/index.html"');

  fs.writeFileSync(file, html);
});
console.log('fixed internal html folder links');
