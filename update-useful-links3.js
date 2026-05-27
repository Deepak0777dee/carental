const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const regex = /<ul>\s*<li><a href="about\.html">About us<\/a><\/li>\s*<li><a href="contact\.html">Contact us<\/a><\/li>\s*<li><a href="404\.html">Gallery<\/a><\/li>\s*<li><a href="404\.html">Blog<\/a><\/li>\s*<li><a href="404\.html">F\.A\.Q<\/a><\/li>\s*<\/ul>/g;

const newLinks = `<ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="contact.html">Contact us</a></li>
            <li><a href="about.html">About us</a></li>
            <li><a href="vehicles.html">Vehicles</a></li>
            <li><a href="details.html">Details</a></li>
          </ul>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, newLinks);
    fs.writeFileSync(f, content);
  }
});
console.log("Useful links updated again");
