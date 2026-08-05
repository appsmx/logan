import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.outcome === "string") data.outcome = body.outcome;
    if (typeof body.evidence === "string") data.evidence = body.evidence;
    if (body.verifiedAt === null) {
      data.verifiedAt = null;
    } else if (typeof body.verifiedAt === "string") {
      data.verifiedAt = new Date(body.verifiedAt);
    }
    const updated = await db.hypothesis.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
