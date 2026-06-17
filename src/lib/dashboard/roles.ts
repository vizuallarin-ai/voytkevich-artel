export type DashboardRole = "manager" | "director" | "admin";

export const DASHBOARD_ROLE_LABELS: Record<DashboardRole, string> = {
  manager: "Менеджер",
  director: "Руководитель",
  admin: "Администратор",
};

const ROLE_RANK: Record<DashboardRole, number> = {
  manager: 1,
  director: 2,
  admin: 3,
};

/** Минимальная роль для доступа к маршруту. */
export function requiredRoleForPath(pathname: string): DashboardRole {
  if (pathname.startsWith("/dashboard/seo")) return "admin";
  if (pathname === "/api/dashboard/test-telegram") return "admin";
  if (
    pathname.startsWith("/dashboard/analytics") ||
    pathname === "/api/analytics/report" ||
    pathname === "/api/dashboard/analytics-export"
  ) {
    return "director";
  }
  return "manager";
}

export function canAccessPath(role: DashboardRole, pathname: string): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[requiredRoleForPath(pathname)];
}

export function filterNavSectionsForRole<T extends { minRole: DashboardRole }>(
  sections: T[],
  role: DashboardRole,
): T[] {
  return sections.filter((s) => ROLE_RANK[role] >= ROLE_RANK[s.minRole]);
}
