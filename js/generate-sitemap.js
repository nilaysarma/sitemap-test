// js/generate-sitemap.js
const fs = require("fs");
const path = require("path");

const baseUrl = "https://sitemap-test.vercel.app"; // Change to your domain
const rootDir = path.resolve(__dirname, ".."); // go up from /js to root

function walkDir(dir, callback) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const filepath = path.join(dir, item);
    const stat = fs.statSync(filepath);

    const isHidden = filepath.includes("node_modules") || filepath.includes(".git") || filepath.includes(".github") || filepath.includes("js");
    if (isHidden) continue;

    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (filepath.endsWith(".html")) {
      callback(filepath, stat.mtime);
    }
  }
}

function getRoute(filepath) {
  let relative = path.relative(rootDir, filepath).replace(/\\/g, "/");
  relative = relative.replace(/index\.html$/, "").replace(/\/$/, "");
  return relative === "" ? "/" : "/" + relative;
}

const urls = [];
walkDir(rootDir, (filePath, mtime) => {
  const route = getRoute(filePath);
  const lastmod = new Date(mtime).toISOString().split("T")[0];
  urls.push({ route, lastmod });
});

urls.sort((a, b) => a.route.split("/").length - b.route.split("/").length);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ route, lastmod }) => `  <url>
    <loc>${baseUrl}${route === "/" ? "/" : route + "/"}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join("\n")}
</urlset>`;

fs.writeFileSync(path.join(rootDir, "sitemap.xml"), sitemap);
console.log("✅ sitemap.xml generated in root.");
