import { promises as fs } from "fs";
import path from "path";
import type { StoredAnalyticsEvent } from "@/types/analytics";

const DATA_DIR = path.join(process.cwd(), ".data");
const EVENTS_FILE = path.join(DATA_DIR, "analytics-events.json");
const MAX_EVENTS = 10_000;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

export async function readEventsFromFile(): Promise<StoredAnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredAnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendEventToFile(event: StoredAnalyticsEvent): Promise<void> {
  const events = await readEventsFromFile();
  events.unshift(event);
  const trimmed = events.slice(0, MAX_EVENTS);
  await ensureDataDir();
  await fs.writeFile(EVENTS_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
}

export function isAnalyticsFileStoreEnabled(): boolean {
  return process.env.ANALYTICS_FILE_STORE !== "false";
}
