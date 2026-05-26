const fs = require('fs');

const globalJs = 'components/global.js';
let content = fs.readFileSync(globalJs, 'utf8');

content = content.replace(/href="\/product\/messenger"/g, 'href="/product/messenger/"');
content = content.replace(/href="\/product\/instagram"/g, 'href="/product/instagram/"');
content = content.replace(/href="\/privacy-policy"/g, 'href="/privacy-policy/"');
content = content.replace(/href="\/terms-of-service"/g, 'href="/terms-of-service/"');

fs.writeFileSync(globalJs, content);

console.log('done fixing remaining links');
