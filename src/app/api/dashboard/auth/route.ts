import { NextResponse } from "next/server";
import { DASHBOARD_COOKIE, verifyDashboardToken } from "@/lib/dashboard/auth";

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  if (!verifyDashboardToken(body.token)) {
    return NextResponse.json({ ok: false, message: "Неверный токен доступа" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASHBOARD_COOKIE, body.token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DASHBOARD_COOKIE);
  return res;
}
