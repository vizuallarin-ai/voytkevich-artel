import fs from "fs";
import path from "path";

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(ent.name)) {
      let c = fs.readFileSync(p, "utf8");
      if (c.includes("motion-safe")) {
        fs.writeFileSync(p, c.replaceAll("motion-safe", "div"));
        console.log("fixed", p);
      }
    }
  }
}

walk("src");
