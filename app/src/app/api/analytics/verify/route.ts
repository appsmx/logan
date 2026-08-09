// LOGAN Analytics — POST /api/analytics/verify
//
// Closes the learning loop (DEC-LOGAN-004) for a single hypothesis.
//
// Flow:
//   1. Validate body { projectId, hypothesisId, outcome, evidence, brief? }.
//   2. Load the project + the hypothesis from DB.
//   3. Build the Analytics system prompt with hypothesis context + evidence.
//   4. Call Z.ai SDK — Analytics evaluates verdict + learning.
//   5. Parse response defensively.
//   6. Update the Hypothesis row: status → verificada/refutada, outcome, evidence, verifiedAt.
//   7. Persist Analytics' own Hypothesis (about what was learned).
//   8. Return the full verification payload.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { buildVerifySystemPrompt } from "@/lib/analytics/system-prompt";
import { parseVerifyResponse } from "@/lib/analytics/parse-analytics-response";
import type { AnalyticsVerifyBody, AnalyticsVerifyResult } from "@/lib/analytics/types";

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
  let body: AnalyticsVerifyBody;
  try {
    body = (await req.json().catch(() => ({}))) as AnalyticsVerifyBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId    = (body.projectId    || "").trim();
  const hypothesisId = (body.hypothesisId || "").trim();
  const outcome      = (body.outcome      || "").trim();
  const evidence     = (body.evidence     || "").trim();
  const brief        = (body.brief        || "").trim();

  if (!projectId)    return badRequest("Proyecto no encontrado", "Incluye projectId en el body");
  if (!hypothesisId) return badRequest("hypothesisId requerido");
  if (!outcome)      return badRequest("outcome requerido", "Describe qué ocurrió en realidad");
  if (!evidence)     return badRequest("evidence requerida", "Proporciona los datos o métricas que respaldan el outcome");

  // Load project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[analytics/verify] DB error proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");

  // Load hypothesis.
  let hyp;
  try {
    hyp = await db.hypothesis.findUnique({ where: { id: hypothesisId } });
  } catch (e) {
    console.error("[analytics/verify] DB error hipótesis:", (e as Error).message);
    return unavailable();
  }
  if (!hyp)                  return badRequest("Hipótesis no encontrada");
  if (hyp.projectId !== projectId) return badRequest("La hipótesis no pertenece a este proyecto");

  // Build system prompt.
  const systemPrompt = buildVerifySystemPrompt(
    project.name,
    hyp.context,
    hyp.hypothesis,
    hyp.prediction,
    hyp.roleId,
    outcome,
    evidence,
    brief || undefined,
  );

  // Call LLM.
  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: `Verifica la hipótesis con la evidencia proporcionada. Outcome: ${outcome}. Evidencia: ${evidence}.` },
      ],
      thinking: { type: "disabled" },
    });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) {
      console.error("[analytics/verify] LLM vacío");
      return unavailable();
    }
  } catch (e) {
    console.error("[analytics/verify] Z.ai falló:", (e as Error).message);
    return unavailable();
  }

  // Parse.
  const parsed = parseVerifyResponse(rawText);

  // Update the verified hypothesis in DB.
  try {
    await db.hypothesis.update({
      where: { id: hypothesisId },
      data: {
        status:     parsed.verdict,
        outcome:    outcome,
        evidence:   evidence,
        verifiedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("[analytics/verify] Hypothesis update falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado de la hipótesis" },
      { status: 500 },
    );
  }

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
    console.error("[analytics/verify] Analytics hypothesis persist falló:", (e as Error).message);
    // Non-fatal: the verification itself succeeded.
  }

  const result: AnalyticsVerifyResult = {
    hypothesisId,
    verdict:                parsed.verdict,
    title:                  parsed.title,
    content:                parsed.content,
    learning:               parsed.learning,
    analyticsHypothesisId,
  };
  return NextResponse.json(result);
}
