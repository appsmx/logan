import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseJsonArr<T>(raw: string, fallback: T[]): T[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v as T[];
    return fallback;
  } catch {
    return fallback;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const list = await db.sessionContext.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((s) => ({
        id: s.id,
        projectId: s.projectId,
        status: s.status,
        advance: s.advance,
        objectiveCompleted: s.objectiveCompleted,
        decisionsTaken: parseJsonArr<string>(s.decisionsTaken, []),
        documentsUpdated: parseJsonArr<{ doc: string; change: string }>(
          s.documentsUpdated,
          [],
        ),
        pending: s.pending,
        risks: s.risks,
        nextObjective: s.nextObjective,
        observations: s.observations,
        createdAt: s.createdAt,
      })),
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const decisionsTaken = Array.isArray(body.decisionsTaken)
      ? body.decisionsTaken
      : [];
    const documentsUpdated = Array.isArray(body.documentsUpdated)
      ? body.documentsUpdated
      : [];
    const created = await db.sessionContext.create({
      data: {
        projectId: id,
        status: body.status ?? "",
        advance: body.advance ?? "",
        objectiveCompleted: body.objectiveCompleted ?? "",
        decisionsTaken: JSON.stringify(decisionsTaken),
        documentsUpdated: JSON.stringify(documentsUpdated),
        pending: body.pending ?? "",
        risks: body.risks ?? "",
        nextObjective: body.nextObjective ?? "",
        observations: body.observations ?? "",
      },
    });
    return NextResponse.json({
      id: created.id,
      projectId: created.projectId,
      status: created.status,
      advance: created.advance,
      objectiveCompleted: created.objectiveCompleted,
      decisionsTaken,
      documentsUpdated,
      pending: created.pending,
      risks: created.risks,
      nextObjective: created.nextObjective,
      observations: created.observations,
      createdAt: created.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
