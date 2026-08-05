import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseUsers(raw?: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

// GET /api/projects — list all with counts
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            decisions: true,
            hypotheses: true,
            backlogItems: true,
            phaseProgress: true,
          },
        },
      },
    });
    return NextResponse.json(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        vision: p.vision,
        users: parseUsers(p.users as unknown),
        status: p.status,
        currentPhase: p.currentPhase,
        currentMode: p.currentMode,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        _count: {
          decisions: p._count.decisions,
          hypotheses: p._count.hypotheses,
          backlog: p._count.backlogItems,
          phases: p._count.phaseProgress,
        },
      })),
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}

// POST /api/projects — create with 8 PhaseProgress rows (phase 1..8 pendiente)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name as string)?.trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const vision = (body.vision as string | undefined)?.trim() ?? "";
    const users = body.users as string[] | undefined;
    const usersJson = JSON.stringify(users ?? []);

    const project = await db.project.create({
      data: {
        name,
        vision,
        users: usersJson,
        status: "En construcción",
        currentPhase: 1,
        currentMode: "exploracion",
        phaseProgress: {
          create: Array.from({ length: 8 }, (_, i) => ({
            phase: i + 1,
            status: "pendiente",
            notes: "",
          })),
        },
      },
      include: {
        phaseProgress: true,
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      vision: project.vision,
      users: users ?? [],
      status: project.status,
      currentPhase: project.currentPhase,
      currentMode: project.currentMode,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
