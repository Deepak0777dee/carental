const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<strong>\+91 70107 92745<\/strong>/g, '<strong><a href="tel:+917010792745" style="color: inherit; text-decoration: none;">+91 70107 92745</a></strong>');
  content = content.replace(/<strong>info@thestackly\.com<\/strong>/g, '<strong><a href="mailto:info@thestackly.com" style="color: inherit; text-decoration: none;">info@thestackly.com</a></strong>');
  fs.writeFileSync(f, content);
});
console.log("Done");
