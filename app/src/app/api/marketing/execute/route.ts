// LOGAN Marketing — POST /api/marketing/execute
//
// The first real specialist endpoint of LOGAN OS (Etapa 3). Receives a
// capability key + a brief + a projectId, returns a structured deliverable
// + a hypothesis (DEC-LOGAN-004 — the differentiator).
//
// Flow:
//   1. Validate body { projectId, capability, brief }.
//   2. Load the project from the DB.
//   3. Resolve the capability from MARKETING_CAPABILITIES (reject unknown keys).
//   4. Build the Marketing system prompt (Constitution + project Biblia +
//      capability details + brief + contextual assets if provided).
//   5. Call Z.ai SDK (Claude Sonnet, free tier — DEC-LOGAN-006).
//      - On SDK failure → 503.
//   6. Parse the JSON response defensively (fallback to safe shape; ALWAYS
//      carry a hypothesis so the learning loop is never broken).
//   7. Persist:
//      a. Hypothesis row first (roleId="marketing", status="pendiente").
//      b. MarketingAsset row (type=capability.producesAssetType, linked to
//         the hypothesis id).
//   8. Return JSON 200 with the full payload (title, content, hypothesis with
//      id + status, marketingAssetId, hypothesisId).
//
// Limitation (MVP, documented in worklog):
//   - The LLM CANNOT actually fetch URLs (analyze_page reasons about the URL
//     from training data + the brief). A future iteration will use the
//     web-reader skill (z-ai-web-dev-sdk functions.invoke('page_reader', {url}))
//     for real page analysis.
//
// Error handling:
//   - Missing projectId / project not found → 400 { error, hint }.
//   - Missing/unknown capability → 400 { error, hint }.
//   - Missing brief → 400 { error }.
//   - Z.ai SDK failure → 503 { error }.
//   - DB write failure → 500 (the deliverable is lost; we surface the error).

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { MARKETING_CAPABILITIES } from "@/lib/logan-os-data";
import { buildMarketingSystemPrompt } from "@/lib/marketing/system-prompt";
import { parseMarketingResponse } from "@/lib/marketing/parse-marketing-response";
import type {
  MarketingEndpointResult,
  MarketingRequestBody,
  PersistedHypothesis,
} from "@/lib/marketing/types";
import type { ProjectBibliaContext } from "@/lib/core/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "LOGAN Marketing no disponible en este momento" },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  let body: MarketingRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as MarketingRequestBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId = (body.projectId || "").trim();
  const capabilityKey = (body.capability || "").trim();
  const brief = (body.brief || "").trim();
  const contextualAssets = Array.isArray(body.contextualAssets)
    ? body.contextualAssets.filter((x) => typeof x === "string" && x.length > 0)
    : undefined;

  if (!projectId) {
    return badRequest(
      "Proyecto no encontrado",
      "Crea o selecciona un proyecto primero",
    );
  }
  if (!capabilityKey) {
    return badRequest(
      "Capability vacía",
      "Indica una de las 11 capabilities de Marketing (analyze_page, create_meta_campaigns, write_ads, …)",
    );
  }
  const capability = MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey);
  if (!capability) {
    return badRequest(
      `Capability desconocida: ${capabilityKey}`,
      "Revisa MARKETING_CAPABILITIES en logan-os-data.ts",
    );
  }
  if (!brief) {
    return badRequest("Brief vacío", "Describe qué quieres que haga Marketing");
  }

  // Load the project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[marketing] DB error cargando proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) {
    return badRequest(
      "Proyecto no encontrado",
      "Crea o selecciona un proyecto primero",
    );
  }

  // Build the system prompt.
  const biblia: ProjectBibliaContext = {
    id: project.id,
    name: project.name,
    vision: project.vision,
    users: project.users,
    status: project.status,
    currentPhase: project.currentPhase,
    currentMode: project.currentMode,
  };
  const systemPrompt = buildMarketingSystemPrompt(
    biblia,
    capability,
    brief,
    contextualAssets,
  );

  // The user prompt restates the brief (keeps the call shape consistent with
  // Core: assistant carries the system prompt, user carries the instruction).
  const userPrompt = `Brief: ${brief}`;

  // Call the LLM.
  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText || rawText.trim().length === 0) {
      console.error("[marketing] LLM devolvió respuesta vacía");
      return unavailable();
    }
  } catch (e) {
    console.error("[marketing] Z.ai SDK falló:", (e as Error).message);
    return unavailable();
  }

  // Parse defensively.
  const parsed = parseMarketingResponse(rawText);

  // Persist: Hypothesis first (the differentiator), then MarketingAsset linked.
  let hypothesisRow: PersistedHypothesis;
  try {
    const h = await db.hypothesis.create({
      data: {
        projectId,
        roleId: "marketing",
        context: parsed.hypothesis.context,
        hypothesis: parsed.hypothesis.hypothesis,
        prediction: parsed.hypothesis.prediction,
        status: "pendiente",
        outcome: "",
        evidence: "",
      },
    });
    hypothesisRow = {
      id: h.id,
      context: h.context,
      hypothesis: h.hypothesis,
      prediction: h.prediction,
      status: h.status,
    };
  } catch (e) {
    console.error("[marketing] Hypothesis persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar la hipótesis del entregable" },
      { status: 500 },
    );
  }

  let marketingAssetId: string;
  try {
    const asset = await db.marketingAsset.create({
      data: {
        projectId,
        type: capability.producesAssetType,
        title: parsed.title,
        content: parsed.content,
        hypothesisId: hypothesisRow.id,
      },
    });
    marketingAssetId = asset.id;
  } catch (e) {
    console.error("[marketing] MarketingAsset persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar el entregable de Marketing" },
      { status: 500 },
    );
  }

  const result: MarketingEndpointResult = {
    title: parsed.title,
    content: parsed.content,
    hypothesis: hypothesisRow,
    marketingAssetId,
    hypothesisId: hypothesisRow.id,
  };
  return NextResponse.json(result);
}
