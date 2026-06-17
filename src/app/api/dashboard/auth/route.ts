import { NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  deriveDashboardSessionToken,
  verifyDashboardCredentials,
  verifyDashboardToken,
} from "@/lib/dashboard/auth";
import { DASHBOARD_ROLE_LABELS } from "@/lib/dashboard/roles";

type AuthBody = {
  username?: string;
  password?: string;
  /** @deprecated legacy token login */
  token?: string;
};

export async function POST(request: Request) {
  let body: AuthBody;
  try {
    body = (await request.json()) as AuthBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  let sessionValue: string | null = null;
  let role = null as Awaited<ReturnType<typeof verifyDashboardToken>>;

  if (body.username && body.password) {
    role = verifyDashboardCredentials(body.username, body.password);
    if (!role) {
      return NextResponse.json({ ok: false, message: "Неверный логин или пароль" }, { status: 401 });
    }
    sessionValue = await deriveDashboardSessionToken(role);
  } else if (body.token) {
    role = await verifyDashboardToken(body.token);
    if (!role) {
      return NextResponse.json({ ok: false, message: "Неверный токен доступа" }, { status: 401 });
    }
    sessionValue = body.token;
  } else {
    return NextResponse.json({ ok: false, message: "Укажите логин и пароль" }, { status: 400 });
  }

  const res = NextResponse.json({
    ok: true,
    role,
    roleLabel: role ? DASHBOARD_ROLE_LABELS[role] : undefined,
  });
  res.cookies.set(DASHBOARD_COOKIE, sessionValue!, {
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
