import { NextResponse } from "next/server";
import { scheduleService } from "@/lib/content-calendar/schedule-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.package) {
      const items = await scheduleService.schedulePublicationPackage(body.contentItemId, body.package);
      return NextResponse.json({ items }, { status: 201 });
    }
    const item = await scheduleService.scheduleContent(body.contentItemId, body.scheduledAt, {
      publicationType: body.publicationType,
      platformId: body.platformId,
      publicationId: body.publicationId,
      forceWithWarnings: body.forceWithWarnings,
      priority: body.priority,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
