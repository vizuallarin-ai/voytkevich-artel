import { NextResponse } from "next/server";
import { scheduleService } from "@/lib/content-calendar/schedule-service";

type Params = { params: Promise<{ calendarItemId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { calendarItemId } = await params;
    const body = await request.json();
    if (body.action === "cancel") {
      const item = await scheduleService.cancelScheduledContent(calendarItemId);
      return NextResponse.json({ item });
    }
    if (body.scheduledAt) {
      const item = await scheduleService.rescheduleContent(calendarItemId, body.scheduledAt);
      return NextResponse.json({ item });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
