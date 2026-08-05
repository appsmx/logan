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
    if (typeof body.notes === "string") data.notes = body.notes;
    if (body.completedAt === null) {
      data.completedAt = null;
    } else if (typeof body.completedAt === "string") {
      data.completedAt = new Date(body.completedAt);
    }
    const updated = await db.phaseProgress.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
