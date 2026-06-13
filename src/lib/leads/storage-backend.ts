export type LeadStorageBackend = "file" | "supabase" | "none";

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function resolveLeadStorage(): LeadStorageBackend {
  const mode = (process.env.LEADS_STORAGE ?? "auto").trim().toLowerCase();

  if (mode === "none" || process.env.LEADS_FILE_STORE === "false" && !isSupabaseConfigured()) {
    return "none";
  }

  if (mode === "supabase") {
    return isSupabaseConfigured() ? "supabase" : "none";
  }

  if (mode === "file") {
    return process.env.LEADS_FILE_STORE === "false" ? "none" : "file";
  }

  // auto: Supabase when configured, otherwise persistent file store (VPS / local)
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.LEADS_FILE_STORE !== "false") return "file";
  return "none";
}

export type AnalyticsStorageBackend = "file" | "supabase" | "none";

export function resolveAnalyticsStorage(): AnalyticsStorageBackend {
  const mode = (process.env.ANALYTICS_STORAGE ?? "auto").trim().toLowerCase();

  if (mode === "none" || (process.env.ANALYTICS_FILE_STORE === "false" && !isSupabaseConfigured())) {
    return "none";
  }

  if (mode === "supabase") {
    return isSupabaseConfigured() ? "supabase" : "none";
  }

  if (mode === "file") {
    return process.env.ANALYTICS_FILE_STORE === "false" ? "none" : "file";
  }

  if (isSupabaseConfigured()) return "supabase";
  if (process.env.ANALYTICS_FILE_STORE !== "false") return "file";
  return "none";
}
