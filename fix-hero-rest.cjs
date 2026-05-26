const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\.hero__lede\s*\{\s*max-width:\s*55ch\s*!important;\s*margin-top:\s*1\.17rem\s*!important;\s*color:\s*#273246\s*!important;\s*font-size:\s*clamp\(0\.94rem,\s*1\.06vw,\s*1\.06rem\)\s*!important;\s*line-height:\s*1\.58\s*!important;\s*\}/, 
`.hero__lede {
      max-width: 55ch !important;
      margin-top: 1.17rem !important;
      color: #273246 !important;
      font-size: clamp(0.94rem, 1.06vw, 1.06rem) !important;
      line-height: 1.58 !important;
      text-align: left;
      margin-left: 0;
      margin-right: auto;
    }`);
    
html = html.replace(/\.hero__actions\s*\{\s*margin:\s*1\.6rem\s*0\s*0\s*!important;\s*\}/, 
`.hero__actions {
      margin: 1.6rem 0 0 !important;
      display: flex;
      justify-content: flex-start;
    }`);

html = html.replace(/\.hero__metrics\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);\s*gap:\s*0\.7rem;\s*max-width:\s*539px;\s*margin:\s*1\.43rem\s*0\s*0;\s*padding:\s*0;\s*list-style:\s*none;\s*\}/, 
`.hero__metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.7rem;
      max-width: 539px;
      margin: 1.43rem auto 0 0;
      padding: 0;
      list-style: none;
    }`);

fs.writeFileSync('index.html', html);
console.log('done hero rest');
