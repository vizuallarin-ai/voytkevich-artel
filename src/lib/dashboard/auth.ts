export const DASHBOARD_COOKIE = "dashboard_token";
export const DEFAULT_DASHBOARD_USERNAME = "stroistroy";

const SESSION_MESSAGE = "stroistroy-dashboard-v1";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function getDashboardUsername(): string {
  return (process.env.DASHBOARD_USERNAME ?? DEFAULT_DASHBOARD_USERNAME).trim();
}

export function isDashboardAuthConfigured(): boolean {
  return Boolean(
    process.env.DASHBOARD_PASSWORD?.trim() || process.env.DASHBOARD_ACCESS_TOKEN?.trim(),
  );
}

export function verifyDashboardCredentials(username: string, password: string): boolean {
  const expectedUser = getDashboardUsername();
  const expectedPass = process.env.DASHBOARD_PASSWORD?.trim();
  if (!expectedPass) return false;
  return timingSafeEqual(username.trim(), expectedUser) && timingSafeEqual(password, expectedPass);
}

/** Session cookie value after login with username + password. */
export async function deriveDashboardSessionToken(): Promise<string> {
  const password = process.env.DASHBOARD_PASSWORD?.trim();
  const username = getDashboardUsername();
  if (!password) return "";

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${username}:${SESSION_MESSAGE}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyDashboardToken(token: string | undefined | null): Promise<boolean> {
  const legacy = process.env.DASHBOARD_ACCESS_TOKEN?.trim();
  if (legacy) {
    if (!token || token.length !== legacy.length) {
      /* fall through */
    } else if (timingSafeEqual(token, legacy)) {
      return true;
    }
  }

  const expectedSession = await deriveDashboardSessionToken();
  if (!expectedSession) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token || token.length !== expectedSession.length) return false;
  return timingSafeEqual(token, expectedSession);
}

export function getDashboardAuthWarning(): string | null {
  if (process.env.NODE_ENV === "production" && !isDashboardAuthConfigured()) {
    return "Dashboard не защищён: задайте DASHBOARD_PASSWORD в env.";
  }
  return null;
}
