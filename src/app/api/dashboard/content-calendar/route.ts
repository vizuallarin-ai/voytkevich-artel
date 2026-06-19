import { NextResponse } from "next/server";
import { calendarService } from "@/lib/content-calendar/calendar-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const data = await calendarService.getDashboardData(date ?? undefined);
  return NextResponse.json(data);
}
