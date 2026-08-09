import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const list = await db.devAsset.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    const ids = list.map((a) => a.hypothesisId).filter((x): x is string => !!x);
    const hyps = ids.length ? await db.hypothesis.findMany({ where: { id: { in: ids } } }) : [];
    const byId = new Map(hyps.map((h) => [h.id, h]));
    return NextResponse.json(
      list.map((a) => ({
        id: a.id, projectId: a.projectId, type: a.type,
        title: a.title, content: a.content,
        hypothesisId: a.hypothesisId, createdAt: a.createdAt,
        hypothesis: a.hypothesisId ? byId.get(a.hypothesisId) ?? null : null,
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
    const hypInput = body.hypothesis as
      | { roleId?: string; context?: string; hypothesis?: string; prediction?: string }
      | undefined;

    let hypothesisId: string | null = null;
    if (hypInput && (hypInput.hypothesis || hypInput.prediction)) {
      const h = await db.hypothesis.create({
        data: {
          projectId: id, roleId: hypInput.roleId ?? "dev",
          context: hypInput.context ?? "", hypothesis: hypInput.hypothesis ?? "",
          prediction: hypInput.prediction ?? "", status: "pendiente", outcome: "", evidence: "",
        },
      });
      hypothesisId = h.id;
    }

    const asset = await db.devAsset.create({
      data: {
        projectId: id, type: body.type ?? "", title: body.title ?? "",
        content: body.content ?? "", hypothesisId,
      },
    });

    const hypothesis = hypothesisId
      ? await db.hypothesis.findUnique({ where: { id: hypothesisId } })
      : null;

    return NextResponse.json({
      id: asset.id, projectId: asset.projectId, type: asset.type,
      title: asset.title, content: asset.content,
      hypothesisId: asset.hypothesisId, createdAt: asset.createdAt, hypothesis,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
