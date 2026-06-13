import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DASHBOARD_COOKIE, verifyDashboardToken } from "@/lib/dashboard/auth";

const PUBLIC_PATHS = ["/dashboard/login"];

function isProtectedApi(pathname: string, method: string): boolean {
  if (pathname === "/api/leads" && method === "GET") return true;
  if (pathname.startsWith("/api/leads/") && pathname !== "/api/leads") return true;
  if (pathname === "/api/dashboard/export") return true;
  if (pathname === "/api/dashboard/analytics-export") return true;
  if (pathname === "/api/analytics/report" && method === "GET") return true;
  return false;
}

export function middleware(request: NextRequest) {
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

  const token =
    request.cookies.get(DASHBOARD_COOKIE)?.value ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!verifyDashboardToken(token)) {
    if (isDashboard) {
      const login = new URL("/dashboard/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/leads", "/api/leads/:path*", "/api/dashboard/:path*", "/api/analytics/report"],
};
