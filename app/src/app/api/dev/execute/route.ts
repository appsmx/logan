// LOGAN Dev — POST /api/dev/execute
//
// The second real specialist endpoint of LOGAN OS (Etapa 4.5). Receives a
// capability key + a brief + a projectId, returns a structured deliverable
// (code / architecture doc / review) + a hypothesis (DEC-LOGAN-004).
//
// Flow:
//   1. Validate body { projectId, capability, brief }.
//   2. Load the project from the DB.
//   3. Resolve the capability from DEV_CAPABILITIES (reject unknown keys).
//   4. Build the Dev system prompt (Constitution + stack reference +
//      project Biblia + capability details + brief + contextual assets).
//   5. Call Z.ai SDK (Claude Sonnet, free tier — DEC-LOGAN-006).
//   6. Parse the JSON response defensively (fallback to safe shape; ALWAYS
//      carry a hypothesis so the learning loop is never broken).
//   7. Persist:
//      a. Hypothesis row first (roleId="dev", status="pendiente").
//      b. DevAsset row (type=capability.producesAssetType, linked to hypothesis).
//   8. Return JSON 200 with full payload.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { DEV_CAPABILITIES } from "@/lib/logan-os-data";
import { buildDevSystemPrompt } from "@/lib/dev/system-prompt";
import { parseDevResponse } from "@/lib/dev/parse-dev-response";
import type {
  DevEndpointResult,
  DevRequestBody,
  PersistedDevHypothesis,
} from "@/lib/dev/types";
import type { ProjectBibliaContext } from "@/lib/core/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "LOGAN Dev no disponible en este momento" },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  let body: DevRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as DevRequestBody;
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
      "Indica una de las 11 capabilities de Dev (design_architecture, implement_feature, refactor_code, …)",
    );
  }
  const capability = DEV_CAPABILITIES.find((c) => c.key === capabilityKey);
  if (!capability) {
    return badRequest(
      `Capability desconocida: ${capabilityKey}`,
      "Revisa DEV_CAPABILITIES en logan-os-data.ts",
    );
  }
  if (!brief) {
    return badRequest("Brief vacío", "Describe qué quieres que Dev construya o revise");
  }

  // Load project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[dev] DB error cargando proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) {
    return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  }

  // Build system prompt.
  const biblia: ProjectBibliaContext = {
    id: project.id,
    name: project.name,
    vision: project.vision,
    users: project.users,
    status: project.status,
    currentPhase: project.currentPhase,
    currentMode: project.currentMode,
  };
  const systemPrompt = buildDevSystemPrompt(biblia, capability, brief, contextualAssets);
  const userPrompt = `Brief: ${brief}`;

  // Call LLM.
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
      console.error("[dev] LLM devolvió respuesta vacía");
      return unavailable();
    }
  } catch (e) {
    console.error("[dev] Z.ai SDK falló:", (e as Error).message);
    return unavailable();
  }

  // Parse defensively.
  const parsed = parseDevResponse(rawText);

  // Persist hypothesis first (the differentiator — DEC-LOGAN-004).
  let hypothesisRow: PersistedDevHypothesis;
  try {
    const h = await db.hypothesis.create({
      data: {
        projectId,
        roleId: "dev",
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
    console.error("[dev] Hypothesis persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar la hipótesis del entregable" },
      { status: 500 },
    );
  }

  // Persist DevAsset.
  let devAssetId: string;
  try {
    const asset = await db.devAsset.create({
      data: {
        projectId,
        type: capability.producesAssetType,
        title: parsed.title,
        content: parsed.content,
        hypothesisId: hypothesisRow.id,
      },
    });
    devAssetId = asset.id;
  } catch (e) {
    console.error("[dev] DevAsset persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar el entregable de Dev" },
      { status: 500 },
    );
  }

  const result: DevEndpointResult = {
    title: parsed.title,
    content: parsed.content,
    hypothesis: hypothesisRow,
    devAssetId,
    hypothesisId: hypothesisRow.id,
  };
  return NextResponse.json(result);
}
