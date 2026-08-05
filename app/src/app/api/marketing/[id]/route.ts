import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const asset = await db.marketingAsset.findUnique({
      where: { id },
      select: { hypothesisId: true },
    });
    if (asset?.hypothesisId) {
      // Delete the linked hypothesis too — the learning record travels with the asset.
      await db.hypothesis
        .delete({ where: { id: asset.hypothesisId } })
        .catch(() => null);
    }
    await db.marketingAsset.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
