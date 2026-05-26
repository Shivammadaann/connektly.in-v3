const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update Growth
html = html.replace(/<ul class="compact-price-card__features">\s*<li>1,000 free conversations \/ mo<\/li>\s*<li>Standard API endpoints<\/li>\s*<li>Community support<\/li>\s*<li>Basic analytics<\/li>\s*<\/ul>\s*<a href="\/contact\/" class="compact-price-card__btn compact-price-card__btn--light">Get Started Free<\/a>/,
`<ul class="compact-price-card__features">
              <li>1,000 conversations included</li>
              <li>Standard API endpoints</li>
              <li>Community support</li>
            </ul>
            <a href="/contact/" class="compact-price-card__btn compact-price-card__btn--light">Get started &rarr;</a>`);

// Update Starter
html = html.replace(/<div class="compact-price-card__badge">MOST POPULAR<\/div>\s*<h3>Starter<\/h3>\s*<p class="compact-price-card__lede">For businesses that need reliable customer communication at scale\.<\/p>\s*<div class="compact-price-card__price">\s*<strong>₹1,999<span> \/month<\/span><\/strong>\s*<\/div>\s*<p class="compact-price-card__addon">\+ Meta conversational pricing<\/p>\s*<ul class="compact-price-card__features">\s*<li>Unlimited conversations<\/li>\s*<li>High throughput routing<\/li>\s*<li>Advanced webhook management<\/li>\s*<li>Template approval dashboard<\/li>\s*<li>Priority email support<\/li>\s*<\/ul>\s*<a href="\/contact\/" class="compact-price-card__btn compact-price-card__btn--primary">Start 14-Day Trial<\/a>/,
`<h3>Starter</h3>
            <div class="compact-price-card__price">
              <strong>₹1,999<span> /month</span></strong>
            </div>
            <ul class="compact-price-card__features">
              <li>Unlimited conversations</li>
              <li>High throughput routing</li>
              <li>Template dashboard + priority support</li>
            </ul>
            <a href="/contact/" class="compact-price-card__btn compact-price-card__btn--primary">Start 14-day trial &rarr;</a>`);

// Update Pro
html = html.replace(/<ul class="compact-price-card__features">\s*<li>Custom conversational pricing<\/li>\s*<li>Dedicated account manager<\/li>\s*<li>99\.99% uptime SLA<\/li>\s*<li>Custom integrations<\/li>\s*<\/ul>\s*<a href="\/contact\/" class="compact-price-card__btn compact-price-card__btn--light">Contact Sales<\/a>/,
`<ul class="compact-price-card__features">
              <li>Volume discounts</li>
              <li>Dedicated account manager</li>
              <li>99.99% SLA & custom integrations</li>
            </ul>
            <a href="/contact/" class="compact-price-card__btn compact-price-card__btn--light">Contact sales &rarr;</a>`);

// Also fix the intro copy
html = html.replace(/Start lean, scale up when your team needs deeper automation and\s*reporting./, 'Start free, scale when you need deeper automation.');

fs.writeFileSync('index.html', html);
console.log('Fixed price cards text');
