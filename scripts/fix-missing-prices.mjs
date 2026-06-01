import fs from "fs";

const FILE = "src/data/megaartel-scraped.json";
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

function extractPrice(html) {
  const meta = html.match(/property="product:price:amount"\s+content="(\d+)"/i);
  if (meta) return parseInt(meta[1], 10);
  const amounts = [...html.matchAll(/woocommerce-Price-amount amount">([\d,]+)/gi)]
    .map((m) => parseInt(m[1].replace(/[\s,]/g, ""), 10))
    .filter((p) => p >= 100_000);
  if (amounts.length) return Math.max(...amounts);
  return null;
}

for (const item of data) {
  if (item.price && item.price >= 500_000) continue;
  const res = await fetch(item.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PriceFix/1.0)" },
  });
  const html = await res.text();
  const price = extractPrice(html);
  if (price) {
    item.price = price;
    console.log("fixed", item.slug, price);
  } else {
    console.log("still missing", item.slug);
  }
  await new Promise((r) => setTimeout(r, 300));
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log("done");
