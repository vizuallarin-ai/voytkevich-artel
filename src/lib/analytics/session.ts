const SESSION_KEY = "va_session_id";
const SESSION_META_KEY = "va_session_meta";

export type SessionMeta = {
  sessionId: string;
  firstVisitAt: string;
  lastVisitAt: string;
  pagesViewed: number;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateSessionId(): string {
  const storage = safeStorage();
  if (!storage) return generateId();

  try {
    const existing = storage.getItem(SESSION_KEY);
    if (existing) return existing;

    const id = generateId();
    storage.setItem(SESSION_KEY, id);
    const now = new Date().toISOString();
    storage.setItem(
      SESSION_META_KEY,
      JSON.stringify({ sessionId: id, firstVisitAt: now, lastVisitAt: now, pagesViewed: 1 } satisfies SessionMeta),
    );
    return id;
  } catch {
    return generateId();
  }
}

export function getSessionMeta(): SessionMeta | undefined {
  const storage = safeStorage();
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(SESSION_META_KEY);
    return raw ? (JSON.parse(raw) as SessionMeta) : undefined;
  } catch {
    return undefined;
  }
}

export function incrementPagesViewed(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    const meta = getSessionMeta();
    if (!meta) return;
    meta.pagesViewed += 1;
    meta.lastVisitAt = new Date().toISOString();
    storage.setItem(SESSION_META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function buildSessionAnalytics() {
  const sessionId = getOrCreateSessionId();
  const meta = getSessionMeta();
  return {
    sessionId,
    firstVisitAt: meta?.firstVisitAt,
    lastVisitAt: meta?.lastVisitAt ?? new Date().toISOString(),
    pagesViewed: meta?.pagesViewed ?? 1,
  };
}
