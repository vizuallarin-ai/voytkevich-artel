import type { DashboardRole } from "@/lib/dashboard/roles";

export const DASHBOARD_COOKIE = "dashboard_token";
export const DEFAULT_DASHBOARD_USERNAME = "stroistroy";
export const DEFAULT_MANAGER_USERNAME = "manager";
export const DEFAULT_DIRECTOR_USERNAME = "director";

const SESSION_MESSAGE = "stroistroy-dashboard-v2";

const ROLE_PREFIX: Record<DashboardRole, string> = {
  manager: "m",
  director: "d",
  admin: "a",
};

type CredentialSet = {
  username: string;
  password: string;
  role: DashboardRole;
};

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

function getCredentialSets(): CredentialSet[] {
  const sets: CredentialSet[] = [];

  const adminPass = process.env.DASHBOARD_PASSWORD?.trim();
  if (adminPass) {
    sets.push({ username: getDashboardUsername(), password: adminPass, role: "admin" });
  }

  const managerPass = process.env.DASHBOARD_MANAGER_PASSWORD?.trim();
  if (managerPass) {
    sets.push({
      username: (process.env.DASHBOARD_MANAGER_USERNAME ?? DEFAULT_MANAGER_USERNAME).trim(),
      password: managerPass,
      role: "manager",
    });
  }

  const directorPass = process.env.DASHBOARD_DIRECTOR_PASSWORD?.trim();
  if (directorPass) {
    sets.push({
      username: (process.env.DASHBOARD_DIRECTOR_USERNAME ?? DEFAULT_DIRECTOR_USERNAME).trim(),
      password: directorPass,
      role: "director",
    });
  }

  return sets;
}

export function isDashboardAuthConfigured(): boolean {
  return Boolean(
    process.env.DASHBOARD_PASSWORD?.trim() ||
      process.env.DASHBOARD_MANAGER_PASSWORD?.trim() ||
      process.env.DASHBOARD_DIRECTOR_PASSWORD?.trim() ||
      process.env.DASHBOARD_ACCESS_TOKEN?.trim(),
  );
}

export function verifyDashboardCredentials(
  username: string,
  password: string,
): DashboardRole | null {
  for (const set of getCredentialSets()) {
    if (timingSafeEqual(username.trim(), set.username) && timingSafeEqual(password, set.password)) {
      return set.role;
    }
  }
  return null;
}

function getSecretForRole(role: DashboardRole): string {
  if (role === "admin") return process.env.DASHBOARD_PASSWORD?.trim() ?? "";
  if (role === "manager") return process.env.DASHBOARD_MANAGER_PASSWORD?.trim() ?? "";
  return process.env.DASHBOARD_DIRECTOR_PASSWORD?.trim() ?? "";
}

function getUsernameForRole(role: DashboardRole): string {
  if (role === "admin") return getDashboardUsername();
  if (role === "manager") {
    return (process.env.DASHBOARD_MANAGER_USERNAME ?? DEFAULT_MANAGER_USERNAME).trim();
  }
  return (process.env.DASHBOARD_DIRECTOR_USERNAME ?? DEFAULT_DIRECTOR_USERNAME).trim();
}

/** Session cookie value after login with username + password. */
export async function deriveDashboardSessionToken(role: DashboardRole): Promise<string> {
  const password = getSecretForRole(role);
  const username = getUsernameForRole(role);
  if (!password) return "";

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${role}:${username}:${SESSION_MESSAGE}`),
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${ROLE_PREFIX[role]}:${hex}`;
}

export async function verifyDashboardToken(
  token: string | undefined | null,
): Promise<DashboardRole | null> {
  const legacy = process.env.DASHBOARD_ACCESS_TOKEN?.trim();
  if (legacy && token && timingSafeEqual(token, legacy)) {
    return "admin";
  }

  if (!token) {
    return process.env.NODE_ENV !== "production" ? "admin" : null;
  }

  const prefix = token.charAt(0);
  const roleByPrefix: Record<string, DashboardRole> = {
    m: "manager",
    d: "director",
    a: "admin",
  };
  const role = roleByPrefix[prefix];
  if (!role || !token.includes(":")) return null;

  const expected = await deriveDashboardSessionToken(role);
  if (!expected || token.length !== expected.length) return null;
  return timingSafeEqual(token, expected) ? role : null;
}

export function getDashboardAuthWarning(): string | null {
  if (process.env.NODE_ENV === "production" && !isDashboardAuthConfigured()) {
    return "Dashboard не защищён: задайте DASHBOARD_PASSWORD или пароли ролей в env.";
  }
  return null;
}
