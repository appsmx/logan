import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseUsers(raw?: unknown): string[] {
  if (!raw) return [];
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
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
    const p = await db.project.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      id: p.id,
      name: p.name,
      vision: p.vision,
      users: parseUsers(p.users),
      status: p.status,
      currentPhase: p.currentPhase,
      currentMode: p.currentMode,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
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
    if (typeof body.vision === "string") data.vision = body.vision;
    if (body.users !== undefined) {
      const arr = Array.isArray(body.users) ? body.users : [];
      data.users = JSON.stringify(arr.filter((x) => typeof x === "string"));
    }
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.currentPhase === "number")
      data.currentPhase = body.currentPhase;
    if (typeof body.currentMode === "string") data.currentMode = body.currentMode;

    const updated = await db.project.update({ where: { id }, data });
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      vision: updated.vision,
      users: parseUsers(updated.users),
      status: updated.status,
      currentPhase: updated.currentPhase,
      currentMode: updated.currentMode,
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
    await db.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
