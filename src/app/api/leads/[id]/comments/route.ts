import { NextResponse } from "next/server";
import { postLeadComment } from "@/lib/leads/lead-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: { text?: string; authorName?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "empty_comment" }, { status: 422 });
  }

  const lead = await postLeadComment(id, body.text, body.authorName);
  if (!lead) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
