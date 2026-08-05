import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/projects/[id]/phases — return 8 rows (create if missing)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await db.phaseProgress.findMany({
      where: { projectId: id },
      orderBy: { phase: "asc" },
    });
    if (existing.length === 8) return NextResponse.json(existing);

    // Auto-create any missing rows
    const present = new Set(existing.map((r) => r.phase));
    const toCreate = Array.from({ length: 8 }, (_, i) => i + 1).filter(
      (n) => !present.has(n),
    );
    if (toCreate.length > 0) {
      await db.phaseProgress.createMany({
        data: toCreate.map((phase) => ({
          projectId: id,
          phase,
          status: "pendiente",
          notes: "",
        })),
      });
    }
    const all = await db.phaseProgress.findMany({
      where: { projectId: id },
      orderBy: { phase: "asc" },
    });
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
