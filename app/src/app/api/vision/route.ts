import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/vision — singleton (key="vision"). Returns null if not set.
export async function GET() {
  try {
    const v = await db.vision.findUnique({ where: { key: "vision" } });
    if (!v) return NextResponse.json(null);
    return NextResponse.json({
      id: v.id,
      key: v.key,
      content: v.content,
      updatedAt: v.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PUT /api/vision — upsert by key.
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const content = (body.content as string | undefined) ?? "";
    const v = await db.vision.upsert({
      where: { key: "vision" },
      create: { key: "vision", content },
      update: { content },
    });
    return NextResponse.json({
      id: v.id,
      key: v.key,
      content: v.content,
      updatedAt: v.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
