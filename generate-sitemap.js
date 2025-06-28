const fs = require("fs");
const path = require("path");

const baseUrl = "https://sitemap-test.vercel.app"; // Change to your actual domain
const rootDir = path.resolve(__dirname);

// Walk through directory and find HTML files
function walkDir(dir, callback) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const filepath = path.join(dir, item);
    const stat = fs.statSync(filepath);

    const isHidden = filepath.includes("node_modules") || filepath.includes(".git") || filepath.includes(".github");
    if (isHidden) continue;

    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (filepath.endsWith(".html")) {
      callback(filepath, stat.mtime);
    }
  }
}

// Convert route and collect modified time
const urls = [];
walkDir(rootDir, (filePath, mtime) => {
  let route = path.relative(rootDir, filePath).replace(/\\/g, "/"); // Normalize path
  route = route.replace(/index\.html$/, "").replace(/\/$/, ""); // Remove index.html
  if (route === "") route = "/";
  else route = "/" + route;

  const lastmod = new Date(mtime).toISOString().split("T")[0]; // YYYY-MM-DD
  urls.push({ route, lastmod });
});

// Sort by path depth: homepage first
urls.sort((a, b) => a.route.split("/").length - b.route.split("/").length);

// Generate sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ route, lastmod }) => {
  return `  <url>
    <loc>${baseUrl}${route === "/" ? "/" : route + "/"}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}).join("\n")}
</urlset>`;

fs.writeFileSync(path.join(rootDir, "sitemap.xml"), sitemap);
console.log("✅ Sitemap generated with individual lastmod dates.");
