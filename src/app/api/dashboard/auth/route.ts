import { NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  deriveDashboardSessionToken,
  verifyDashboardCredentials,
  verifyDashboardToken,
} from "@/lib/dashboard/auth";

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

  if (body.username && body.password) {
    if (!verifyDashboardCredentials(body.username, body.password)) {
      return NextResponse.json({ ok: false, message: "Неверный логин или пароль" }, { status: 401 });
    }
    sessionValue = await deriveDashboardSessionToken();
  } else if (body.token) {
    if (!(await verifyDashboardToken(body.token))) {
      return NextResponse.json({ ok: false, message: "Неверный токен доступа" }, { status: 401 });
    }
    sessionValue = body.token;
  } else {
    return NextResponse.json({ ok: false, message: "Укажите логин и пароль" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASHBOARD_COOKIE, sessionValue, {
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
