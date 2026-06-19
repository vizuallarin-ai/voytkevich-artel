import { NextResponse } from "next/server";
import { calendarService } from "@/lib/content-calendar/calendar-service";

export async function GET() {
  const data = await calendarService.getQueueData();
  return NextResponse.json(data);
}
