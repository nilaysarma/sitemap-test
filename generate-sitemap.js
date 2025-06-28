// generate-sitemap.js
const fs = require("fs");
const path = require("path");

const baseUrl = "https://sitemap-test.vercel.app"; // 🔁 Replace with your actual domain
const directory = path.join(__dirname);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    const isExcluded = filepath.includes(".git") || filepath.includes("node_modules") || filepath.includes(".github");
    if (isExcluded) return;

    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (file.endsWith(".html")) {
      callback(filepath.replace(__dirname, ""));
    }
  });
}

const urls = [];
walkDir(directory, (relativePath) => {
  let route = relativePath.replace(/\\/g, "/");
  route = route.replace(/index\.html$/, "").replace(/^\//, ""); // remove index.html and leading slash
  urls.push(`${baseUrl}/${route}`);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

fs.writeFileSync(path.join(directory, "sitemap.xml"), sitemap);
console.log("✅ Sitemap generated in root.");
