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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const list = await db.decision.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((d) => ({
        id: d.id,
        projectId: d.projectId,
        roleId: d.roleId,
        decId: d.decId,
        title: d.title,
        problem: d.problem,
        alternatives: parseAlts(d.alternatives),
        decision: d.decision,
        justification: d.justification,
        consequences: d.consequences,
        status: d.status,
        date: d.date,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
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
    const decIdRaw = (body.decId as string | undefined)?.trim();
    // Auto-assign DEC-XXX if empty: count+1 padded to 3
    let decId = decIdRaw;
    if (!decId) {
      const count = await db.decision.count({ where: { projectId: id } });
      decId = `DEC-${String(count + 1).padStart(3, "0")}`;
    }
    const alts = Array.isArray(body.alternatives)
      ? body.alternatives.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
    const decision = await db.decision.create({
      data: {
        projectId: id,
        roleId: body.roleId ?? "core",
        decId,
        title: body.title ?? "",
        problem: body.problem ?? "",
        alternatives: JSON.stringify(alts),
        decision: body.decision ?? "",
        justification: body.justification ?? "",
        consequences: body.consequences ?? "",
        status: body.status ?? "aprobada",
      },
    });
    return NextResponse.json({
      id: decision.id,
      projectId: decision.projectId,
      roleId: decision.roleId,
      decId: decision.decId,
      title: decision.title,
      problem: decision.problem,
      alternatives: alts,
      decision: decision.decision,
      justification: decision.justification,
      consequences: decision.consequences,
      status: decision.status,
      date: decision.date,
      createdAt: decision.createdAt,
      updatedAt: decision.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
