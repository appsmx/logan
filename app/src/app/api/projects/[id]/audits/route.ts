import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseChecks(raw: string): Record<string, boolean> {
  try {
    const v = JSON.parse(raw);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, boolean>;
    }
    return {};
  } catch {
    return {};
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const list = await db.audit.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((a) => ({
        id: a.id,
        projectId: a.projectId,
        deliverableName: a.deliverableName,
        checks: parseChecks(a.checks),
        passed: a.passed,
        notes: a.notes,
        createdAt: a.createdAt,
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
    const checks =
      body.checks && typeof body.checks === "object"
        ? (body.checks as Record<string, boolean>)
        : {};
    const created = await db.audit.create({
      data: {
        projectId: id,
        deliverableName: (body.deliverableName as string) ?? "",
        checks: JSON.stringify(checks),
        passed: !!body.passed,
        notes: (body.notes as string) ?? "",
      },
    });
    return NextResponse.json({
      id: created.id,
      projectId: created.projectId,
      deliverableName: created.deliverableName,
      checks,
      passed: created.passed,
      notes: created.notes,
      createdAt: created.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
