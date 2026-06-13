const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "va_utm";
const ATTRIBUTION_KEY = "va_attribution";

export type UtmParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type AttributionData = {
  landingPage?: string;
  currentPage?: string;
  referrer?: string;
  firstTouch?: string;
  lastTouch?: string;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getUtmFromUrl(url?: string): UtmParams {
  if (typeof window === "undefined" && !url) return {};
  try {
    const parsed = new URL(url ?? window.location.href);
    const utm: UtmParams = {};
    for (const key of UTM_KEYS) {
      const val = parsed.searchParams.get(key);
      if (!val) continue;
      const short = key.replace("utm_", "") as keyof UtmParams;
      utm[short] = val;
    }
    return utm;
  } catch {
    return {};
  }
}

export function saveUtmToStorage(utm?: UtmParams): void {
  const storage = safeStorage();
  if (!storage) return;

  const incoming = utm ?? getUtmFromUrl();
  if (!Object.keys(incoming).length) return;

  try {
    const existing = getStoredUtm();
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...incoming }));
  } catch {
    /* ignore */
  }
}

export function getStoredUtm(): UtmParams {
  const storage = safeStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

export function getAttributionData(): AttributionData {
  const storage = safeStorage();
  const currentPage = typeof window !== "undefined" ? window.location.pathname : undefined;
  const referrer = typeof document !== "undefined" ? document.referrer || undefined : undefined;

  if (!storage) {
    return { currentPage, referrer };
  }

  try {
    const raw = storage.getItem(ATTRIBUTION_KEY);
    const stored = raw ? (JSON.parse(raw) as AttributionData) : {};
    return {
      ...stored,
      currentPage,
      referrer: referrer ?? stored.referrer,
      lastTouch: currentPage ?? stored.lastTouch,
    };
  } catch {
    return { currentPage, referrer };
  }
}

export function initAttribution(): void {
  if (typeof window === "undefined") return;
  const storage = safeStorage();
  if (!storage) return;

  saveUtmToStorage();

  try {
    const existing = getAttributionData();
    const landing = existing.landingPage ?? window.location.pathname;
    const next: AttributionData = {
      landingPage: landing,
      firstTouch: existing.firstTouch ?? window.location.pathname,
      lastTouch: window.location.pathname,
      referrer: document.referrer || existing.referrer,
      currentPage: window.location.pathname,
    };
    storage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function buildLeadAnalyticsFromClient(): {
  utm: UtmParams;
  traffic: AttributionData;
} {
  return {
    utm: getStoredUtm(),
    traffic: getAttributionData(),
  };
}
