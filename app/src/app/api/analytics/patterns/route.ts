// LOGAN Analytics — POST /api/analytics/patterns
//
// Analyzes all hypotheses of a project to detect learning patterns.
//
// Flow:
//   1. Validate body { projectId, roleFilter?, statusFilter? }.
//   2. Load the project + hypotheses from DB (filtered).
//   3. Build the Analytics system prompt with all hypothesis summaries.
//   4. Call Z.ai SDK — Analytics generates pattern analysis + insights.
//   5. Parse response defensively.
//   6. Persist Analytics' own Hypothesis about this analysis.
//   7. Return the full patterns report.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { buildPatternsSystemPrompt } from "@/lib/analytics/system-prompt";
import { parsePatternsResponse } from "@/lib/analytics/parse-analytics-response";
import type {
  AnalyticsPatternsBody,
  AnalyticsPatternsResult,
  HypothesisSummary,
} from "@/lib/analytics/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "LOGAN Analytics no disponible en este momento" },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  let body: AnalyticsPatternsBody;
  try {
    body = (await req.json().catch(() => ({}))) as AnalyticsPatternsBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId    = (body.projectId    || "").trim();
  const roleFilter   = (body.roleFilter   || "").trim() || undefined;
  const statusFilter = (body.statusFilter || "").trim() || undefined;

  if (!projectId) return badRequest("Proyecto no encontrado", "Incluye projectId en el body");

  // Load project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[analytics/patterns] DB error proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) return badRequest("Proyecto no encontrado");

  // Load hypotheses with optional filters.
  let hypotheses;
  try {
    hypotheses = await db.hypothesis.findMany({
      where: {
        projectId,
        ...(roleFilter   ? { roleId: roleFilter }   : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("[analytics/patterns] DB error hipótesis:", (e as Error).message);
    return unavailable();
  }

  if (hypotheses.length === 0) {
    return NextResponse.json(
      { error: "No hay hipótesis en este proyecto todavía", hint: "Genera entregables con Marketing, Dev o Design primero" },
      { status: 400 },
    );
  }

  // Build summaries for the prompt.
  const summaries: HypothesisSummary[] = hypotheses.map((h) => ({
    id:         h.id,
    roleId:     h.roleId,
    hypothesis: h.hypothesis,
    prediction: h.prediction,
    status:     h.status,
    outcome:    h.outcome,
    createdAt:  h.createdAt.toISOString(),
    verifiedAt: h.verifiedAt ? h.verifiedAt.toISOString() : null,
  }));

  // Build system prompt.
  const systemPrompt = buildPatternsSystemPrompt(
    project.name,
    summaries,
    roleFilter,
    statusFilter,
  );

  // Call LLM.
  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: `Analiza los patrones de las ${summaries.length} hipótesis del proyecto ${project.name} y genera el reporte completo.` },
      ],
      thinking: { type: "disabled" },
    });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) {
      console.error("[analytics/patterns] LLM vacío");
      return unavailable();
    }
  } catch (e) {
    console.error("[analytics/patterns] Z.ai falló:", (e as Error).message);
    return unavailable();
  }

  // Parse.
  const parsed = parsePatternsResponse(rawText);

  // Persist Analytics' own hypothesis (DEC-LOGAN-004).
  let analyticsHypothesisId = "";
  try {
    const ah = await db.hypothesis.create({
      data: {
        projectId,
        roleId:     "analytics",
        context:    parsed.hypothesis.context,
        hypothesis: parsed.hypothesis.hypothesis,
        prediction: parsed.hypothesis.prediction,
        status:     "pendiente",
        outcome:    "",
        evidence:   "",
      },
    });
    analyticsHypothesisId = ah.id;
  } catch (e) {
    console.error("[analytics/patterns] Analytics hypothesis persist falló:", (e as Error).message);
  }

  const result: AnalyticsPatternsResult = {
    projectId,
    title:                  parsed.title,
    content:                parsed.content,
    topLearnings:           parsed.topLearnings,
    universalCandidates:    parsed.universalCandidates,
    analyticsHypothesisId,
    hypothesesAnalyzed:     summaries.length,
  };
  return NextResponse.json(result);
}
