import { NextResponse } from "next/server";
import { calendarService } from "@/lib/content-calendar/calendar-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const data = await calendarService.getMonthData(year, month);
  return NextResponse.json(data);
}
