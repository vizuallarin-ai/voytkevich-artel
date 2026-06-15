import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SPECS } from "./programmatic-seo-initial-queue.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const body = `import type { ProgrammaticSEOPage } from "@/types/programmatic-seo";
import { createQueuedProgrammaticPage, type QueuePageInput } from "@/lib/seo/programmatic-page-builder";
import { applyCannibalizationGuard } from "@/lib/seo/cannibalization-detector";
import { sortContentQueueByPriority } from "@/lib/seo/publishing-priority";

const SPECS: QueuePageInput[] = ${JSON.stringify(SPECS, null, 2)} as QueuePageInput[];

const rawQueue = SPECS.map((spec) => createQueuedProgrammaticPage(spec));

export const programmaticSeoInitialQueue: ProgrammaticSEOPage[] = rawQueue.map((page, _i, all) =>
  applyCannibalizationGuard(page, all),
);

export function getSortedProgrammaticQueue(): ProgrammaticSEOPage[] {
  return sortContentQueueByPriority(programmaticSeoInitialQueue);
}

export function getProgrammaticQueueStats() {
  const queue = programmaticSeoInitialQueue;
  const bySection = queue.reduce<Record<string, number>>((acc, p) => {
    acc[p.section] = (acc[p.section] ?? 0) + 1;
    return acc;
  }, {});
  const byStatus = queue.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: queue.length,
    bySection,
    byStatus,
    indexable: queue.filter((p) => p.indexing.indexable).length,
  };
}
`;

const outPath = path.join(root, "src/data/programmatic-seo-initial-queue.ts");
fs.writeFileSync(outPath, body, { encoding: "utf8" });
console.log("Generated", outPath, "items:", SPECS.length);
console.log("Cyrillic ok:", body.includes("Каркасные"));
