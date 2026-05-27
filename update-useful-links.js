const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const oldLinks = `          <ul>
            <li><a href="about.html">About us</a></li>
            <li><a href="contact.html">Contact us</a></li>
            <li><a href="404.html">Gallery</a></li>
            <li><a href="404.html">Blog</a></li>
            <li><a href="404.html">F.A.Q</a></li>
          </ul>`;

const newLinks = `          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="vehicles.html">Vehicles</a></li>
            <li><a href="details.html">Details</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact Us</a></li>
          </ul>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(oldLinks)) {
    content = content.replace(oldLinks, newLinks);
    fs.writeFileSync(f, content);
  }
});
console.log("Useful links updated");
