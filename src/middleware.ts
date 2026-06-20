import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DASHBOARD_COOKIE, verifyDashboardToken } from "@/lib/dashboard/auth";
import { canAccessPath } from "@/lib/dashboard/roles";

const PUBLIC_PATHS = ["/dashboard/login"];

function isProtectedApi(pathname: string, method: string): boolean {
  if (pathname === "/api/leads" && method === "GET") return true;
  if (pathname.startsWith("/api/leads/") && pathname !== "/api/leads") return true;
  if (pathname === "/api/dashboard/export") return true;
  if (pathname === "/api/dashboard/analytics-export") return true;
  if (pathname === "/api/analytics/report" && method === "GET") return true;
  if (pathname === "/api/dashboard/me") return true;
  if (pathname.startsWith("/api/dashboard/ai-content")) return true;
  if (pathname.startsWith("/api/dashboard/content-distribution")) return true;
  if (pathname.startsWith("/api/dashboard/visual-content")) return true;
  if (pathname.startsWith("/api/dashboard/content-calendar")) return true;
  if (pathname.startsWith("/api/dashboard/content-prioritization")) return true;
  if (pathname.startsWith("/api/dashboard/seo-indexation")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApiRoute = isProtectedApi(pathname, method);

  if (!isDashboard && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/api/dashboard/auth") {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(DASHBOARD_COOKIE)?.value ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const role = await verifyDashboardToken(token);
  if (!role) {
    if (isDashboard) {
      const login = new URL("/dashboard/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canAccessPath(role, pathname)) {
    if (isDashboard) {
      const home = new URL("/dashboard", request.url);
      home.searchParams.set("denied", "1");
      return NextResponse.redirect(home);
    }
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/leads", "/api/leads/:path*", "/api/dashboard/:path*", "/api/analytics/report"],
};
