import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DASHBOARD_COOKIE, verifyDashboardToken } from "@/lib/dashboard/auth";
import { DASHBOARD_ROLE_LABELS } from "@/lib/dashboard/roles";

export async function GET() {
  const token = (await cookies()).get(DASHBOARD_COOKIE)?.value;
  const role = await verifyDashboardToken(token);
  if (!role) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ role, roleLabel: DASHBOARD_ROLE_LABELS[role] });
}
