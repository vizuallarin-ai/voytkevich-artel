import { promises as fs } from "fs";
import path from "path";
import type { StoredLead } from "@/types/lead";

const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

export async function readLeadsFromFile(): Promise<StoredLead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeLeadsToFile(leads: StoredLead[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export async function appendLeadToFile(lead: StoredLead): Promise<void> {
  const leads = await readLeadsFromFile();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    leads[idx] = lead;
  } else {
    leads.unshift(lead);
  }
  await writeLeadsToFile(leads);
}

export async function updateLeadInFile(lead: StoredLead): Promise<boolean> {
  const leads = await readLeadsFromFile();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx < 0) return false;
  leads[idx] = lead;
  await writeLeadsToFile(leads);
  return true;
}

export function isFileStoreEnabled(): boolean {
  return process.env.LEADS_FILE_STORE !== "false";
}
