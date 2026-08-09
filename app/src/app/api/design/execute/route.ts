// LOGAN Design — POST /api/design/execute
//
// The third real specialist endpoint of LOGAN OS (Etapa 4.5). Receives a
// capability key + a brief + a projectId, returns a structured design
// deliverable + a hypothesis (DEC-LOGAN-004).
//
// Flow mirrors /api/marketing/execute and /api/dev/execute exactly (Art. III).

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { DESIGN_CAPABILITIES } from "@/lib/logan-os-data";
import { buildDesignSystemPrompt } from "@/lib/design/system-prompt";
import { parseDesignResponse } from "@/lib/design/parse-design-response";
import type {
  DesignEndpointResult,
  DesignRequestBody,
  PersistedDesignHypothesis,
} from "@/lib/design/types";
import type { ProjectBibliaContext } from "@/lib/core/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "LOGAN Design no disponible en este momento" },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  let body: DesignRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as DesignRequestBody;
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
    return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  }
  if (!capabilityKey) {
    return badRequest(
      "Capability vacía",
      "Indica una de las capabilities de Design (design_ui, define_design_system, prototype_flow, …)",
    );
  }
  const capability = DESIGN_CAPABILITIES.find((c) => c.key === capabilityKey);
  if (!capability) {
    return badRequest(
      `Capability desconocida: ${capabilityKey}`,
      "Revisa DESIGN_CAPABILITIES en logan-os-data.ts",
    );
  }
  if (!brief) {
    return badRequest("Brief vacío", "Describe qué quieres que Design cree o especifique");
  }

  // Load project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[design] DB error cargando proyecto:", (e as Error).message);
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
  const systemPrompt = buildDesignSystemPrompt(biblia, capability, brief, contextualAssets);
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
      console.error("[design] LLM devolvió respuesta vacía");
      return unavailable();
    }
  } catch (e) {
    console.error("[design] Z.ai SDK falló:", (e as Error).message);
    return unavailable();
  }

  // Parse defensively.
  const parsed = parseDesignResponse(rawText);

  // Persist hypothesis first (DEC-LOGAN-004).
  let hypothesisRow: PersistedDesignHypothesis;
  try {
    const h = await db.hypothesis.create({
      data: {
        projectId,
        roleId: "design",
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
    console.error("[design] Hypothesis persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar la hipótesis del entregable" },
      { status: 500 },
    );
  }

  // Persist DesignAsset.
  let designAssetId: string;
  try {
    const asset = await db.designAsset.create({
      data: {
        projectId,
        type: capability.producesAssetType,
        title: parsed.title,
        content: parsed.content,
        hypothesisId: hypothesisRow.id,
      },
    });
    designAssetId = asset.id;
  } catch (e) {
    console.error("[design] DesignAsset persist falló:", (e as Error).message);
    return NextResponse.json(
      { error: "No se pudo registrar el entregable de Design" },
      { status: 500 },
    );
  }

  const result: DesignEndpointResult = {
    title: parsed.title,
    content: parsed.content,
    hypothesis: hypothesisRow,
    designAssetId,
    hypothesisId: hypothesisRow.id,
  };
  return NextResponse.json(result);
}
