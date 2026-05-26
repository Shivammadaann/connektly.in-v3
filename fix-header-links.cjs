const fs = require('fs');
const globalJs = 'components/global.js';
let content = fs.readFileSync(globalJs, 'utf8');

// Replace folder links with exact index.html links to avoid SPA fallback in Vite dev server
content = content.replace(/href="\/product\/whatsapp\/?(\b|")/g, 'href="/product/whatsapp/index.html"');
content = content.replace(/href="\/product\/messenger\/?(\b|")/g, 'href="/product/messenger/index.html"');
content = content.replace(/href="\/product\/instagram\/?(\b|")/g, 'href="/product/instagram/index.html"');
content = content.replace(/href="\/product\/whatsapp-calling\/?(\b|")/g, 'href="/product/whatsapp/index.html"'); // temp fallback
content = content.replace(/href="\/product\/broadcast\/?(\b|")/g, 'href="/product/whatsapp/index.html"'); // temp fallback
content = content.replace(/href="\/product\/team-inbox\/?(\b|")/g, 'href="/product/whatsapp/index.html"'); // temp fallback
content = content.replace(/href="\/product\/automation\/?(\b|")/g, 'href="/product/whatsapp/index.html"'); // temp fallback

content = content.replace(/href="\/features\/?(\b|")/g, 'href="/features/index.html"');
content = content.replace(/href="\/pricing\/?(\b|")/g, 'href="/pricing/index.html"');
content = content.replace(/href="\/contact\/?(\b|")/g, 'href="/contact/index.html"');
content = content.replace(/href="\/faq\/?(\b|")/g, 'href="/faq/index.html"');
content = content.replace(/href="\/privacy-policy\/?(\b|")/g, 'href="/privacy-policy/index.html"');
content = content.replace(/href="\/terms-of-service\/?(\b|")/g, 'href="/terms-of-service/index.html"');

content = content.replace(/href="\/solutions\/whatsapp-api\/?(\b|")/g, 'href="/product/whatsapp/index.html"');
content = content.replace(/href="\/solutions\/unified-inbox\/?(\b|")/g, 'href="/product/whatsapp/index.html"');

fs.writeFileSync(globalJs, content);

console.log('fixed header links to use index.html directly');
