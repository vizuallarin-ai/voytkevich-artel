import { NextResponse } from "next/server";
import type { LeadStatus, StoredLead } from "@/types/lead";
import { fetchLead, patchLead, changeLeadStatus } from "@/lib/leads/lead-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const lead = await fetchLead(id);
  if (!lead) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Partial<StoredLead> & { status?: LeadStatus; lostReason?: StoredLead["lostReason"] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.status) {
    const lead = await changeLeadStatus(id, body.status, body.lostReason);
    if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ lead });
  }

  const { status: _s, lostReason: _l, ...patch } = body;
  const lead = await patchLead(id, patch);
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ lead });
}
