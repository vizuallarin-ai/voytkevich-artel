import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { filterLeads, leadsToCsv } from "@/lib/leads/lead-filters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = await getAllLeads(false);
  const filtered = filterLeads(leads, {
    status: searchParams.get("status") as never,
    sourceType: searchParams.get("sourceType") as never,
    search: searchParams.get("search") ?? undefined,
  });

  const csv = leadsToCsv(filtered);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
