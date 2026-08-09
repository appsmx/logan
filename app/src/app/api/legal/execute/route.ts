// LOGAN Legal — POST /api/legal/execute
// Pattern identical to /api/finance/execute (Art. III).

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { LEGAL_CAPABILITIES } from "@/lib/logan-os-data";
import { buildLegalSystemPrompt } from "@/lib/legal/system-prompt";
import { parseLegalResponse } from "@/lib/legal/parse-legal-response";
import type { LegalEndpointResult, LegalRequestBody, PersistedLegalHypothesis } from "@/lib/legal/types";
import type { ProjectBibliaContext } from "@/lib/core/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}
function unavailable() {
  return NextResponse.json({ error: "LOGAN Legal no disponible en este momento" }, { status: 503 });
}

export async function POST(req: NextRequest) {
  let body: LegalRequestBody;
  try { body = (await req.json().catch(() => ({}))) as LegalRequestBody; }
  catch { return badRequest("Cuerpo de la petición inválido"); }

  const projectId    = (body.projectId    || "").trim();
  const capabilityKey = (body.capability  || "").trim();
  const brief        = (body.brief        || "").trim();
  const contextualAssets = Array.isArray(body.contextualAssets) ? body.contextualAssets.filter((x) => typeof x === "string" && x.length > 0) : undefined;

  if (!projectId)     return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  if (!capabilityKey) return badRequest("Capability vacía", "Indica una de las 8 capabilities de Legal");
  const capability = LEGAL_CAPABILITIES.find((c) => c.key === capabilityKey);
  if (!capability)    return badRequest(`Capability desconocida: ${capabilityKey}`, "Revisa LEGAL_CAPABILITIES en logan-os-data.ts");
  if (!brief)         return badRequest("Brief vacío", "Describe qué entregable legal necesitas");

  let project;
  try { project = await db.project.findUnique({ where: { id: projectId } }); }
  catch (e) { console.error("[legal] DB:", (e as Error).message); return unavailable(); }
  if (!project) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");

  const biblia: ProjectBibliaContext = {
    id: project.id, name: project.name, vision: project.vision,
    users: project.users, status: project.status,
    currentPhase: project.currentPhase, currentMode: project.currentMode,
  };
  const systemPrompt = buildLegalSystemPrompt(biblia, capability, brief, contextualAssets);

  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "assistant", content: systemPrompt }, { role: "user", content: `Brief: ${brief}` }],
      thinking: { type: "disabled" },
    });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) { console.error("[legal] LLM vacío"); return unavailable(); }
  } catch (e) { console.error("[legal] Z.ai:", (e as Error).message); return unavailable(); }

  const parsed = parseLegalResponse(rawText);

  let hypothesisRow: PersistedLegalHypothesis;
  try {
    const h = await db.hypothesis.create({
      data: { projectId, roleId: "legal", context: parsed.hypothesis.context, hypothesis: parsed.hypothesis.hypothesis, prediction: parsed.hypothesis.prediction, status: "pendiente", outcome: "", evidence: "" },
    });
    hypothesisRow = { id: h.id, context: h.context, hypothesis: h.hypothesis, prediction: h.prediction, status: h.status };
  } catch (e) {
    console.error("[legal] Hypothesis persist:", (e as Error).message);
    return NextResponse.json({ error: "No se pudo registrar la hipótesis del entregable" }, { status: 500 });
  }

  let legalAssetId: string;
  try {
    const asset = await db.legalAsset.create({
      data: { projectId, type: capability.producesAssetType, title: parsed.title, content: parsed.content, hypothesisId: hypothesisRow.id },
    });
    legalAssetId = asset.id;
  } catch (e) {
    console.error("[legal] LegalAsset persist:", (e as Error).message);
    return NextResponse.json({ error: "No se pudo registrar el entregable de Legal" }, { status: 500 });
  }

  const result: LegalEndpointResult = { title: parsed.title, content: parsed.content, hypothesis: hypothesisRow, legalAssetId, hypothesisId: hypothesisRow.id };
  return NextResponse.json(result);
}
