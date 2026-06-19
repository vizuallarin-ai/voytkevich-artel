import { NextResponse } from "next/server";
import { semanticClusterService } from "@/lib/content-prioritization/semantic-cluster-service";

export async function GET() {
  const clusters = await semanticClusterService.list();
  return NextResponse.json({ clusters });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === "recalculate" && body.clusterId) {
    const cluster = await semanticClusterService.recalculate(body.clusterId);
    return NextResponse.json({ cluster });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
