import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseAlts(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};
    if (typeof body.roleId === "string") data.roleId = body.roleId;
    if (typeof body.decId === "string") data.decId = body.decId;
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.problem === "string") data.problem = body.problem;
    if (Array.isArray(body.alternatives)) {
      data.alternatives = JSON.stringify(
        body.alternatives.filter((x): x is string => typeof x === "string"),
      );
    }
    if (typeof body.decision === "string") data.decision = body.decision;
    if (typeof body.justification === "string")
      data.justification = body.justification;
    if (typeof body.consequences === "string")
      data.consequences = body.consequences;
    if (typeof body.status === "string") data.status = body.status;

    const updated = await db.decision.update({ where: { id }, data });
    return NextResponse.json({
      id: updated.id,
      projectId: updated.projectId,
      roleId: updated.roleId,
      decId: updated.decId,
      title: updated.title,
      problem: updated.problem,
      alternatives: parseAlts(updated.alternatives),
      decision: updated.decision,
      justification: updated.justification,
      consequences: updated.consequences,
      status: updated.status,
      date: updated.date,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.decision.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
