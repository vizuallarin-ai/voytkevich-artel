/**
 * Импорт проектов с megaartel.ru (фото, площадь, цена).
 * Запуск: node scripts/scrape-megaartel-projects.mjs
 */
import fs from "fs";

const BASE = "https://megaartel.ru";
const SKIP_IMG = /favicon|logo|calc|arrow|telegram|yt\.png|ig\.png|tt\.png|price\.png/i;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VoytkevichSiteImport/1.0)" },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function extractProjectLinks(html) {
  const re = /href="(https:\/\/megaartel\.ru\/projects\/[a-z0-9-]+\/)"/gi;
  const set = new Set();
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (!u.includes("/page/") && !u.includes("?")) set.add(u);
  }
  return [...set];
}

function extractImages(html) {
  const re = /https:\/\/megaartel\.ru\/wp-content\/uploads\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi;
  const imgs = new Set();
  let m;
  while ((m = re.exec(html))) {
    const url = m[0].replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp))/i, "");
    if (!SKIP_IMG.test(url) && !url.includes(".webp")) imgs.add(url);
  }
  // prefer full jpg over numbered gallery
  return [...imgs].filter((u) => !u.match(/\/\d+x\d+\./)).sort();
}

function extractPlan(html) {
  const m = html.match(
    /https:\/\/megaartel\.ru\/wp-content\/uploads\/[^"'\s]*planirovka[^"'\s]*\.png/i
  );
  return m ? m[0].replace(/-\d+x\d+(?=\.png)/i, "") : null;
}

function extractTitle(html) {
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (og) return og[1].split("|")[0].trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)</i);
  return h1 ? h1[1].trim() : "Проект";
}

function extractPrice(html) {
  const meta = html.match(/property="product:price:amount"\s+content="(\d+)"/i);
  if (meta) return parseInt(meta[1], 10);

  const offers = html.match(/"price"\s*:\s*"?(\d+)"?/i);
  if (offers) {
    const p = parseInt(offers[1], 10);
    if (p >= 100_000) return p;
  }

  const amounts = [...html.matchAll(/woocommerce-Price-amount amount">([\d,]+)/gi)]
    .map((m) => parseInt(m[1].replace(/[\s,]/g, ""), 10))
    .filter((p) => p >= 100_000);
  if (amounts.length) return Math.max(...amounts);

  const cost = html.match(/Стоимость:\s*([\d\s,]+)/i);
  if (cost) {
    const p = parseInt(cost[1].replace(/[\s,]/g, ""), 10);
    if (p >= 100_000) return p;
  }

  return null;
}

/** Цены с листинга /projects/ (запасной источник) */
function extractListingPrices(html) {
  const map = new Map();
  const re =
    /projects\/([a-z0-9-]+)\/[\s\S]{0,4000}?<bdi>([\d,]+)<span class="woocommerce-Price-currencySymbol">/gi;
  let m;
  while ((m = re.exec(html))) {
    const slug = m[1];
    if (slug === "feed" || slug.startsWith("page")) continue;
    const price = parseInt(m[2].replace(/[\s,]/g, ""), 10);
    if (price >= 100_000) map.set(slug, price);
  }
  return map;
}

function extractMeta(html) {
  const areaM = html.match(/Площадь:\s*(\d+)\s*м/i) || html.match(/(\d+)\s*м\s*2/i);
  const floorsM = html.match(/Этажность:\s*(\d)/i);
  const materialM = html.match(/Материал:\s*([^<\n]+)/i);

  return {
    area: areaM ? parseInt(areaM[1], 10) : null,
    price: extractPrice(html),
    floors: floorsM ? parseInt(floorsM[1], 10) : null,
    material: materialM ? materialM[1].trim() : null,
  };
}

function slugFromUrl(url) {
  return url.replace(/\/$/, "").split("/").pop();
}

function mapMaterial(raw) {
  if (!raw) return "каркас";
  const s = raw.toLowerCase();
  if (s.includes("брус") || s.includes("бревн")) return "брус";
  if (s.includes("газобетон")) return "газобетон";
  if (s.includes("кирпич")) return "кирпич";
  if (s.includes("каркас")) return "каркас";
  return "каркас";
}

async function main() {
  const links = new Set();
  const listingPrices = new Map();

  for (let page = 1; page <= 5; page++) {
    const url = page === 1 ? `${BASE}/projects/` : `${BASE}/projects/page/${page}/`;
    try {
      const html = await fetchText(url);
      extractProjectLinks(html).forEach((l) => links.add(l));
      extractListingPrices(html).forEach((price, slug) => listingPrices.set(slug, price));
      console.log(`page ${page}: +${extractProjectLinks(html).length} links`);
    } catch (e) {
      console.warn(`page ${page} skip:`, e.message);
      break;
    }
  }

  const projects = [];
  const list = [...links].filter((u) => !u.endsWith("/feed/"));

  for (const url of list) {
    try {
      await new Promise((r) => setTimeout(r, 400));
      const html = await fetchText(url);
      const images = extractImages(html);
      const plan = extractPlan(html);
      const title = extractTitle(html);
      const meta = extractMeta(html);
      const slug = slugFromUrl(url);
      const price = meta.price ?? listingPrices.get(slug) ?? null;

      if (images.length === 0) {
        console.warn("no images:", slug);
        continue;
      }

      projects.push({
        slug,
        url,
        name: title,
        area: meta.area,
        price,
        floors: meta.floors,
        material: meta.material,
        images: images.slice(0, 12),
        floorPlan: plan,
      });
      console.log("ok", slug, meta.area, "m²", price ? `${(price / 1e6).toFixed(2)}M` : "no price", images.length, "img");
    } catch (e) {
      console.warn("fail", url, e.message);
    }
  }

  const out = `src/data/megaartel-scraped.json`;
  fs.writeFileSync(out, JSON.stringify(projects, null, 2), "utf8");
  console.log(`\nSaved ${projects.length} projects → ${out}`);
}

main();
