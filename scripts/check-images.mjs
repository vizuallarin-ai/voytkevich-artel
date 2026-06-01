import fs from "fs";
import path from "path";

function walk(dir, urls = new Set()) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, urls);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const match of text.matchAll(
      /https:\/\/(?:images\.unsplash\.com|placehold\.co)[^\s"'`${}]+/g,
    )) {
      if (!match[0].includes("${")) urls.add(match[0]);
    }
  }
  return urls;
}

const urls = [...walk("src")];
const bad = [];

for (const url of urls) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) bad.push({ url, status: res.status });
  } catch (err) {
    bad.push({ url, status: String(err) });
  }
}

console.log(`Checked ${urls.length} URLs`);
console.log(`Failed: ${bad.length}`);
for (const item of bad) {
  console.log(`${item.status}\t${item.url}`);
}
