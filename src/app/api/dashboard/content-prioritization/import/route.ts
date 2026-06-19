import { NextResponse } from "next/server";
import { keywordDemandService, priorityService } from "@/lib/content-prioritization/priority-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.csv) {
      const result = await keywordDemandService.importCSV(body.csv);
      await priorityService.recalculateAll();
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "csv required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
