// Generates public/sitemap.xml from live CMS content before each build, so
// search engines get every menu-linked page and every news article instead
// of just the handful of static routes we could otherwise hardcode.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE_ORIGIN = "https://fjsti.uz";
const API_BASE = "https://api.fermi.uz/v1";

const EXCLUDED_PREFIXES = ["/admin", "/kirish", "/royxatdan-otish", "/parolni-tiklash", "/email-tasdiqlash", "/search"];

const STATIC_ROUTES = [
  "/",
  "/institut",
  "/qabul",
  "/aloqa",
  "/virtual-qabulxona",
  "/yangiliklar",
  "/galereya",
  "/video",
  "/schedule",
];

function isIncludable(path) {
  if (!path || !path.startsWith("/") || path === "/#" || path.includes("#")) return false;
  return !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function collectMenuHrefs(nodes, out) {
  for (const node of nodes) {
    if (isIncludable(node.href)) out.add(node.href.split("?")[0]);
    if (node.children?.length) collectMenuHrefs(node.children, out);
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function collectMenuUrls() {
  const urls = new Set(STATIC_ROUTES);
  try {
    const body = await fetchJson(`${API_BASE}/menu?lang=uz`);
    const menu = body.data ?? body;
    if (Array.isArray(menu)) collectMenuHrefs(menu, urls);
  } catch (err) {
    console.warn("[sitemap] menu fetch failed, continuing with static routes only:", err.message);
  }
  return urls;
}

async function collectNewsUrls() {
  const urls = [];
  let page = 1;
  for (;;) {
    let body;
    try {
      body = await fetchJson(`${API_BASE}/news?page=${page}&lang=uz`);
    } catch (err) {
      console.warn(`[sitemap] news page ${page} fetch failed, stopping:`, err.message);
      break;
    }
    const items = body.data ?? [];
    for (const item of items) {
      if (item.slug) urls.push(`/detail/${item.slug}`);
    }
    const meta = body.meta;
    if (!meta || items.length === 0 || page * meta.pageSize >= meta.total) break;
    page += 1;
  }
  return urls;
}

async function main() {
  const [menuUrls, newsUrls] = await Promise.all([collectMenuUrls(), collectNewsUrls()]);
  const all = new Set([...menuUrls, ...newsUrls]);

  const body = [...all]
    .sort()
    .map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`[sitemap] wrote ${all.size} URLs to ${outPath}`);
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  process.exitCode = 1;
});
