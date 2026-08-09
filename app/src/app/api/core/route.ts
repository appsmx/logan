// LOGAN Core — POST /api/core
//
// Etapa 2: single-LLM orchestrator.
// Etapa 3: marketing_execute delegation (3-LLM flow).
// Etapa 4.5: dev_execute + design_execute delegation added.
//
// Flow:
//   1. Validate body { projectId, message }.
//   2. Load the project from the DB.
//   3. Build the auto-generated Memory Report.
//   4. Build the system prompt.
//   5. First Core LLM call → the plan (response draft + actions).
//   6. Parse JSON defensively.
//   7. Draft constitutional validation (before persisting actions).
//   8. Execute non-specialist actions (register_decision, register_hypothesis).
//   9. Execute specialist delegations IN PARALLEL:
//        a. marketing_execute → Marketing endpoint
//        b. dev_execute       → Dev endpoint
//        c. design_execute    → Design endpoint
//  10. If any specialist deliverables: second Core LLM call (integration).
//  11. Final constitutional validation on the integrated response.
//  12. Persist SessionContext row.
//  13. Return structured payload.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { buildMemoryReport } from "@/lib/core/memory-report";
import { buildSystemPrompt } from "@/lib/core/system-prompt";
import { parseCoreResponse } from "@/lib/core/parse-core-response";
import { validateConstitutional } from "@/lib/core/constitutional-validator";
import {
  executeActions,
  executeMarketingDelegations,
  executeDevDelegations,
  executeDesignDelegations,
} from "@/lib/core/execute-actions";
import type {
  ActionTaken,
  ConstitutionalCheck,
  CoreEndpointResult,
  MarketingDeliverable,
  DevDeliverable,
  DesignDeliverable,
  ProjectBibliaContext,
} from "@/lib/core/types";

type CoreRequestBody = { projectId?: string; message?: string };

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json({ error: "LOGAN Core no disponible en este momento" }, { status: 503 });
}

function appendConstitutionalNote(response: string, violatedArticle: string | null, note: string): string {
  const articlePart = violatedArticle ? `el Artículo ${violatedArticle}` : "un artículo";
  const notePart = note?.length > 0 ? ` ${note}` : "";
  return response + "\n\n---\n" + `⚠️ Validación constitucional: la respuesta propuesta podría violar ${articlePart}.${notePart} Elevo este desacuerdo fundamentado al criterio humano (Art. VII, Art. IX).`;
}

function buildDocumentsUpdated(actionsTaken: ActionTaken[]): { doc: string; change: string }[] {
  return actionsTaken.flatMap((a) => {
    if (a.type === "register_decision") return [{ doc: "Decision", change: `${a.decId} creada` }];
    if (a.type === "register_hypothesis") return [{ doc: "Hypothesis", change: `HIP ${a.id} creada (pendiente)` }];
    if (a.type === "marketing_proposal") return [
      { doc: "Hypothesis", change: `HIP ${a.hypothesisId} creada para Marketing` },
      { doc: "MarketingAsset", change: `Asset ${a.marketingAssetId}` },
    ];
    if (a.type === "marketing_execute") return a.hypothesisId
      ? [{ doc: "MarketingAsset", change: `${a.title} (HIP ${a.hypothesisId})` }]
      : [{ doc: "MarketingAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "dev_execute") return a.hypothesisId
      ? [{ doc: "DevAsset", change: `${a.title} (HIP ${a.hypothesisId})` }]
      : [{ doc: "DevAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "design_execute") return a.hypothesisId
      ? [{ doc: "DesignAsset", change: `${a.title} (HIP ${a.hypothesisId})` }]
      : [{ doc: "DesignAsset", change: `Delegación ${a.capability} fallida` }];
    return [];
  });
}

function decisionsFromActions(actionsTaken: ActionTaken[]): string[] {
  return actionsTaken
    .filter((a): a is Extract<ActionTaken, { type: "register_decision" }> => a.type === "register_decision")
    .map((a) => a.decId);
}

// ─── Integration prompt builders ────────────────────────────────────────────

const INTEGRATION_SYSTEM_PROMPT = `Eres LOGAN Core. Recibiste el trabajo de uno o varios especialistas (Marketing, Dev, Design) y debes integrarlo en una respuesta coherente al usuario, en tu única voz LOGAN. NO inventes; si el especialista no lo dijo, no lo agregues. Cita el entregable cuando sea relevante. Respeta los 10 artículos de la Constitución, en particular Art. IX (arquitecto colaborador, no decides por el humano) y Art. VII (señala riesgos con fundamento). Responde en español, cálida y directamente. NO uses bloques de markdown ni JSON — responde en texto natural al usuario.`;

function renderDeliverable(
  index: number,
  role: string,
  capabilityLabel: string,
  capability: string,
  title: string,
  content: string,
  hypothesis: { context: string; hypothesis: string; prediction: string },
): string[] {
  return [
    "",
    `### Entregable ${index + 1} [${role}]: ${capabilityLabel} (${capability})`,
    "",
    `**Título:** ${title}`,
    "",
    "**Contenido:**",
    "",
    content,
    "",
    "**Hipótesis (DEC-LOGAN-004):**",
    `- Contexto: ${hypothesis.context}`,
    `- Hipótesis: ${hypothesis.hypothesis}`,
    `- Predicción: ${hypothesis.prediction}`,
  ];
}

function buildIntegrationUserPrompt(
  originalUserMessage: string,
  marketing: MarketingDeliverable[],
  dev: DevDeliverable[],
  design: DesignDeliverable[],
): string {
  const lines: string[] = ["## Mensaje original del usuario", "", originalUserMessage, "", "## Entregables de los especialistas"];
  let i = 0;
  for (const d of marketing) {
    lines.push(...renderDeliverable(i++, "Marketing", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  }
  for (const d of dev) {
    lines.push(...renderDeliverable(i++, "Dev", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  }
  for (const d of design) {
    lines.push(...renderDeliverable(i++, "Design", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  }
  lines.push(
    "",
    "## Tu tarea",
    "",
    "Escribe la respuesta final al usuario. Integra todos los entregables en una sola voz LOGAN, cálida, clara y específica al proyecto. Menciona las hipótesis relevantes para que el usuario sepa qué predicciones verificar. NO repitas los entregables crudos — sintetízalos en lenguaje natural.",
  );
  return lines.join("\n");
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: CoreRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as CoreRequestBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();
  if (!projectId) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  if (!message) return badRequest("Mensaje vacío");

  // Load project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[core] DB error:", (e as Error).message);
    return unavailable();
  }
  if (!project) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");

  // Step 1: Memory Report.
  let memoryReport: string;
  try {
    memoryReport = await buildMemoryReport(projectId);
  } catch (e) {
    console.error("[core] Memory Report falló:", (e as Error).message);
    memoryReport = "## Reporte de Memory\n\n> No se pudo generar el reporte.";
  }

  // Step 2: System prompt.
  const biblia: ProjectBibliaContext = {
    id: project.id, name: project.name, vision: project.vision,
    users: project.users, status: project.status,
    currentPhase: project.currentPhase, currentMode: project.currentMode,
  };
  const systemPrompt = buildSystemPrompt(biblia, memoryReport);

  // Step 3: First Core LLM call.
  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: message },
      ],
      thinking: { type: "disabled" },
    });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) { console.error("[core] LLM vacío"); return unavailable(); }
  } catch (e) {
    console.error("[core] Z.ai falló:", (e as Error).message);
    return unavailable();
  }

  // Step 4: Parse.
  const parsed = parseCoreResponse(rawText);

  // Step 5: Draft constitutional validation.
  let draftConstitutional: ConstitutionalCheck | null = null;
  try {
    draftConstitutional = await validateConstitutional(parsed.response);
  } catch (e) {
    console.error("[core] Draft validator falló:", (e as Error).message);
  }
  const constitutionalForPersistence: ConstitutionalCheck | null =
    draftConstitutional?.approved === false ? draftConstitutional : null;

  // Step 6: Execute non-specialist actions.
  let nonSpecialistActions: ActionTaken[] = [];
  try {
    nonSpecialistActions = await executeActions(projectId, parsed.actions, constitutionalForPersistence);
  } catch (e) {
    console.error("[core] executeActions falló:", (e as Error).message);
  }

  // Step 7: Execute ALL specialist delegations in parallel.
  let marketingActionsTaken: ActionTaken[] = [];
  let marketingDeliverables: MarketingDeliverable[] = [];
  let devActionsTaken: ActionTaken[] = [];
  let devDeliverables: DevDeliverable[] = [];
  let designActionsTaken: ActionTaken[] = [];
  let designDeliverables: DesignDeliverable[] = [];

  try {
    const [mkt, dev, des] = await Promise.all([
      executeMarketingDelegations(projectId, parsed.actions),
      executeDevDelegations(projectId, parsed.actions),
      executeDesignDelegations(projectId, parsed.actions),
    ]);
    marketingActionsTaken = mkt.actionsTaken;
    marketingDeliverables = mkt.deliverables;
    devActionsTaken = dev.actionsTaken;
    devDeliverables = dev.deliverables;
    designActionsTaken = des.actionsTaken;
    designDeliverables = des.deliverables;
  } catch (e) {
    console.error("[core] Specialist delegations falló:", (e as Error).message);
  }

  const actionsTaken: ActionTaken[] = [
    ...nonSpecialistActions,
    ...marketingActionsTaken,
    ...devActionsTaken,
    ...designActionsTaken,
  ];

  // Step 8: Integration LLM call if there are any specialist deliverables.
  const allDeliverables = [
    ...marketingDeliverables,
    ...devDeliverables,
    ...designDeliverables,
  ];
  let finalResponse = parsed.response;

  if (allDeliverables.length > 0) {
    try {
      const zai = await ZAI.create();
      const integrationPrompt = buildIntegrationUserPrompt(message, marketingDeliverables, devDeliverables, designDeliverables);
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: INTEGRATION_SYSTEM_PROMPT },
          { role: "user", content: integrationPrompt },
        ],
        thinking: { type: "disabled" },
      });
      const integrated = completion.choices[0]?.message?.content ?? "";
      if (integrated?.trim()) {
        finalResponse = integrated.trim();
      } else {
        console.error("[core] Integration LLM vacío, usando draft");
      }
    } catch (e) {
      console.error("[core] Integration LLM falló:", (e as Error).message);
      finalResponse = parsed.response + "\n\n---\n⚠️ No pude integrar el entregable del especialista (fallo técnico). El entregable SÍ se creó — puedes revisarlo en la sección correspondiente. Elevo esta degradación al criterio humano (Art. VII).";
    }
  }

  // Step 9: Final constitutional validation.
  let constitutional: ConstitutionalCheck = draftConstitutional ?? parsed.constitutional_check;
  try {
    const validatorResult = await validateConstitutional(finalResponse);
    if (validatorResult?.approved === false) constitutional = validatorResult;
    if (draftConstitutional?.approved === false && (!validatorResult || validatorResult.approved === true)) {
      constitutional = draftConstitutional;
    }
    if (constitutional?.approved === false) {
      finalResponse = appendConstitutionalNote(finalResponse, constitutional.violated_article, constitutional.note);
    }
  } catch (e) {
    console.error("[core] Validator falló:", (e as Error).message);
  }

  // Step 10: Persist SessionContext.
  const decisionsTaken = decisionsFromActions(actionsTaken);
  const documentsUpdated = buildDocumentsUpdated(actionsTaken);
  let sessionId = "";
  try {
    const session = await db.sessionContext.create({
      data: {
        projectId,
        status: project.status,
        advance: parsed.session_update.advance || "Sesión de Core",
        objectiveCompleted: finalResponse.slice(0, 200),
        decisionsTaken: JSON.stringify(decisionsTaken),
        documentsUpdated: JSON.stringify(documentsUpdated),
        pending: parsed.session_update.pending || "",
        risks: parsed.session_update.risks || "",
        nextObjective: parsed.session_update.nextObjective || "",
        observations: "Sesión automática de LOGAN Core",
      },
    });
    sessionId = session.id;
  } catch (e) {
    console.error("[core] SessionContext persist falló:", (e as Error).message);
  }

  // Step 11: Return.
  const result: CoreEndpointResult = {
    response: finalResponse,
    actionsTaken,
    constitutionalCheck: {
      approved: constitutional.approved,
      violatedArticle: constitutional.violated_article,
      note: constitutional.note,
    },
    sessionId,
  };
  return NextResponse.json(result);
}
