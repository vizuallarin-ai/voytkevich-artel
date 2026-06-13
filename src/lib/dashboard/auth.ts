export const DASHBOARD_COOKIE = "dashboard_token";

export function isDashboardAuthConfigured(): boolean {
  return Boolean(process.env.DASHBOARD_ACCESS_TOKEN?.trim());
}

/** Constant-time-ish compare — works in Edge, Node and client bundles. */
export function verifyDashboardToken(token: string | undefined | null): boolean {
  const expected = process.env.DASHBOARD_ACCESS_TOKEN?.trim();
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token || token.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function getDashboardAuthWarning(): string | null {
  if (process.env.NODE_ENV === "production" && !isDashboardAuthConfigured()) {
    return "Dashboard не защищён: задайте DASHBOARD_ACCESS_TOKEN перед production.";
  }
  return null;
}
