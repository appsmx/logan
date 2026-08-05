// LOGAN Core — POST /api/core
//
// The orchestrator endpoint of LOGAN OS. Etapa 2 built the single-LLM-call
// flow. Etapa 3 extends it to a 3-LLM-call flow when Core delegates to the
// Marketing specialist:
//
//   1. Validate body { projectId, message }.
//   2. Load the project from the DB.
//   3. Build the auto-generated Memory Report (no LLM call).
//   4. Build the system prompt (Constitution + LOGAN OS manual + Roles +
//      Authority hierarchy + project Biblia + Memory Report + response format
//      INCLUDING the new `marketing_execute` action spec).
//   5. **First Core LLM call** → the plan: { response: "(draft)",
//      actions: [...], constitutional_check: "(draft)", session_update: {...} }.
//      If Core plans to delegate, the draft response is a placeholder like
//      "Voy a consultar al equipo de Marketing…".
//   6. Parse JSON defensively (fallback to {response: rawText}).
//   7. **Execute non-marketing actions** (register_decision,
//      register_hypothesis, legacy marketing_proposal) — same as Etapa 2.
//   8. **For each marketing_execute action**: call POST /api/marketing/execute
//      internally → collect the deliverables (title, content, hypothesis).
//      The Marketing endpoint already persists its own Hypothesis +
//      MarketingAsset rows; Core just records the IDs.
//   9. If there were marketing_execute actions: **Second Core LLM call**
//      (integration): pass the original user message + the Marketing
//      deliverables + ask Core to write the FINAL user-facing response in
//      LOGAN's single voice. Else: use the first call's response as the final.
//   10. **Constitutional validator** (second LLM pass) on the FINAL integrated
//       response. If it flags a violation, override Core's own check and append
//       a clear note — never BLOCK (Art. IX), only FLAG.
//   11. Persist a new SessionContext row (Art. I — every Core turn persists).
//   12. Return the structured payload with FINAL response + actionsTaken
//       (including marketing_execute entries with marketingAssetId +
//       hypothesisId) + constitutionalCheck + sessionId.
//
// Latency: 1 LLM call for turns without delegation (≈5-10s). 3+ LLM calls for
// turns with delegation (≈15-25s). Acceptable for MVP (Art. III).
//
// Error handling:
//   - Missing projectId / project not found → 400 { error, hint }.
//   - Missing message → 400 { error }.
//   - Z.ai SDK failure → 503 { error }.
//   - DB write failure → log; still return 200 with whatever we have.

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
} from "@/lib/core/execute-actions";
import type {
  ActionTaken,
  ConstitutionalCheck,
  CoreEndpointResult,
  MarketingDeliverable,
  ProjectBibliaContext,
} from "@/lib/core/types";

type CoreRequestBody = {
  projectId?: string;
  message?: string;
};

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "LOGAN Core no disponible en este momento" },
    { status: 503 },
  );
}

function appendConstitutionalNote(
  response: string,
  violatedArticle: string | null,
  note: string,
): string {
  const articlePart = violatedArticle ? `el Artículo ${violatedArticle}` : "un artículo";
  const notePart = note && note.length > 0 ? ` ${note}` : "";
  return (
    response +
    "\n\n---\n" +
    `⚠️ Validación constitucional: la respuesta propuesta podría violar ${articlePart}.${notePart} ` +
    "Elevo este desacuerdo fundamentado al criterio humano (Art. VII, Art. IX)."
  );
}

function buildDocumentsUpdated(
  actionsTaken: ActionTaken[],
): { doc: string; change: string }[] {
  const docs: { doc: string; change: string }[] = [];
  for (const a of actionsTaken) {
    if (a.type === "register_decision") {
      docs.push({ doc: "Decision", change: `${a.decId} creada` });
    } else if (a.type === "register_hypothesis") {
      docs.push({ doc: "Hypothesis", change: `HIP ${a.id} creada (pendiente)` });
    } else if (a.type === "marketing_proposal") {
      docs.push({
        doc: "Hypothesis",
        change: `HIP ${a.hypothesisId} creada para Marketing (pendiente)`,
      });
      docs.push({
        doc: "MarketingAsset",
        change: `Asset ${a.marketingAssetId} vinculado a HIP ${a.hypothesisId}`,
      });
    } else if (a.type === "marketing_execute") {
      if (a.hypothesisId && a.marketingAssetId) {
        docs.push({
          doc: "Hypothesis",
          change: `HIP ${a.hypothesisId} creada por especialista Marketing (pendiente)`,
        });
        docs.push({
          doc: "MarketingAsset",
          change: `Asset ${a.marketingAssetId} vinculado a HIP ${a.hypothesisId}`,
        });
      } else {
        docs.push({
          doc: "MarketingAsset",
          change: `Delegación ${a.capability} fallida`,
        });
      }
    }
  }
  return docs;
}

function decisionsFromActions(actionsTaken: ActionTaken[]): string[] {
  return actionsTaken
    .filter((a): a is { type: "register_decision"; decId: string; id: string } => a.type === "register_decision")
    .map((a) => a.decId);
}

const INTEGRATION_SYSTEM_PROMPT = `Eres LOGAN Core. Recibiste el trabajo del especialista Marketing y debes integrarlo en una respuesta coherente al usuario, en tu única voz LOGAN. NO inventes; si Marketing no lo dijo, no lo agregues. Cita el entregable cuando sea relevante (ej. "el brief que preparé con Marketing incluye…", "el análisis de la página que hice con Marketing detectó…"). Respeta los 10 artículos de la Constitución, en particular Art. IX (eres un arquitecto colaborador, no decides por el humano) y Art. VII (señala riesgos con fundamento). Responde en español, cálida y directa, sin jerga. NO uses bloques de markdown ni JSON — responde en texto natural al usuario.`;

function buildIntegrationUserPrompt(
  originalUserMessage: string,
  deliverables: MarketingDeliverable[],
): string {
  const lines: string[] = [
    "## Mensaje original del usuario",
    "",
    originalUserMessage,
    "",
    "## Entregables del especialista Marketing",
  ];
  for (let i = 0; i < deliverables.length; i++) {
    const d = deliverables[i];
    lines.push(
      "",
      `### Entregable ${i + 1}: ${d.capabilityLabel} (${d.capability})`,
      "",
      `**Título:** ${d.title}`,
      "",
      "**Contenido del entregable:**",
      "",
      d.content,
      "",
      "**Hipótesis asociada (DEC-LOGAN-004):**",
      "",
      `- Contexto: ${d.hypothesis.context}`,
      `- Hipótesis: ${d.hypothesis.hypothesis}`,
      `- Predicción medible: ${d.hypothesis.prediction}`,
    );
  }
  lines.push(
    "",
    "## Tu tarea",
    "",
    "Escribe la respuesta final al usuario. Integra el/los entregable(s) en una sola voz LOGAN, cálida, clara y específica al proyecto. Menciona la hipótesis cuando sea relevante para que el usuario sepa que hay una predicción medible que podrá verificar. NO repitas el entregable crudo — síntesisalo en lenguaje natural. Si hay varios entregables, intégralos en una sola respuesta coherente, no en una lista de bloques.",
  );
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  let body: CoreRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as CoreRequestBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();

  if (!projectId) {
    return badRequest(
      "Proyecto no encontrado",
      "Crea o selecciona un proyecto primero",
    );
  }
  if (!message) {
    return badRequest("Mensaje vacío");
  }

  // Load the project.
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[core] DB error cargando proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) {
    return badRequest(
      "Proyecto no encontrado",
      "Crea o selecciona un proyecto primero",
    );
  }

  // Step 1: Build Memory Report.
  let memoryReport: string;
  try {
    memoryReport = await buildMemoryReport(projectId);
  } catch (e) {
    console.error("[core] Memory Report falló, continuando con mínimo:", (e as Error).message);
    memoryReport = "## Reporte de Memory (auto-generado)\n\n> No se pudo generar el reporte. Continuando con información mínima.";
  }

  // Step 2: Build system prompt.
  const biblia: ProjectBibliaContext = {
    id: project.id,
    name: project.name,
    vision: project.vision,
    users: project.users,
    status: project.status,
    currentPhase: project.currentPhase,
    currentMode: project.currentMode,
  };
  const systemPrompt = buildSystemPrompt(biblia, memoryReport);

  // Step 3: First Core LLM call — the plan.
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
    if (!rawText || rawText.trim().length === 0) {
      console.error("[core] LLM devolvió respuesta vacía");
      return unavailable();
    }
  } catch (e) {
    console.error("[core] Z.ai SDK falló:", (e as Error).message);
    return unavailable();
  }

  // Step 4: Parse the JSON response.
  const parsed = parseCoreResponse(rawText);

  // Step 4.5 (NEW ORDER — Art. IX operationalized):
  // Run constitutional validation on the DRAFT response BEFORE persisting
  // actions. If the validator flags a violation, the Decisions will be
  // persisted as "propuesta" (not "aprobada") with a visible note — the
  // human retains the final word (Art. IX). Previously, validation ran
  // AFTER persistence, which meant Decisions got "aprobada" status even
  // when the validator flagged them. That bug produced ghost rows like
  // the DEC-011 "Eliminación del Artículo IX — aprobada".
  //
  // Note: this validates the DRAFT response (before Marketing integration).
  // If Marketing delegation happens and the integration LLM rewrites the
  // response, we re-validate the FINAL in Step 8 below. Both passes feed
  // the persisted Decisions' status — if EITHER flags, Decisions are
  // "propuesta".
  let draftConstitutional: ConstitutionalCheck | null = null;
  try {
    draftConstitutional = await validateConstitutional(parsed.response);
  } catch (e) {
    console.error(
      "[core] Draft validator falló (no fatal):",
      (e as Error).message,
    );
  }
  // Effective constitutional state for persistence = draft validator.
  // If the final pass (Step 8) also flags, we update `constitutional` for
  // the response, but for persistence we use the strictest of the two.
  const constitutionalForPersistence: ConstitutionalCheck | null =
    draftConstitutional && draftConstitutional.approved === false
      ? draftConstitutional
      : null;

  // Step 5: Execute NON-marketing actions (register_decision,
  // register_hypothesis, legacy marketing_proposal). The marketing_execute
  // actions are deliberately skipped here. Pass the constitutional result
  // so Decisions get downgraded to "propuesta" if the validator flagged.
  let nonMarketingActions: ActionTaken[] = [];
  try {
    nonMarketingActions = await executeActions(
      projectId,
      parsed.actions,
      constitutionalForPersistence,
    );
  } catch (e) {
    console.error("[core] executeActions falló (no fatal):", (e as Error).message);
    nonMarketingActions = [];
  }

  // Step 6: Execute marketing_execute delegations (calls the Marketing
  // endpoint internally for each, in parallel). Collects both the IDs for
  // actionsTaken AND the full deliverables for the integration LLM call.
  let marketingActionsTaken: ActionTaken[] = [];
  let deliverables: MarketingDeliverable[] = [];
  try {
    const r = await executeMarketingDelegations(projectId, parsed.actions);
    marketingActionsTaken = r.actionsTaken;
    deliverables = r.deliverables;
  } catch (e) {
    console.error(
      "[core] executeMarketingDelegations falló (no fatal):",
      (e as Error).message,
    );
  }

  const actionsTaken: ActionTaken[] = [
    ...nonMarketingActions,
    ...marketingActionsTaken,
  ];

  // Step 7: Build the FINAL user-facing response. If there are Marketing
  // deliverables, run the integration LLM call. Otherwise, use the first
  // call's response as the final.
  let finalResponse = parsed.response;
  if (deliverables.length > 0) {
    try {
      const zai = await ZAI.create();
      const integrationUserPrompt = buildIntegrationUserPrompt(message, deliverables);
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: INTEGRATION_SYSTEM_PROMPT },
          { role: "user", content: integrationUserPrompt },
        ],
        thinking: { type: "disabled" },
      });
      const integrated = completion.choices[0]?.message?.content ?? "";
      if (integrated && integrated.trim().length > 0) {
        finalResponse = integrated.trim();
      } else {
        // The integration LLM returned empty — fall back to the draft.
        console.error("[core] Integration LLM devolvió respuesta vacía, usando draft");
      }
    } catch (e) {
      // Integration failed — keep the draft response (which is the
      // "Voy a consultar al equipo de Marketing…" placeholder). Append a
      // note so the user knows the deliverable was created but the
      // integration failed.
      console.error(
        "[core] Integration LLM falló (no fatal), usando draft:",
        (e as Error).message,
      );
      finalResponse =
        parsed.response +
        "\n\n---\n" +
        "⚠️ No pude integrar el entregable del especialista Marketing en mi respuesta (fallo técnico). El entregable SÍ se creó y está guardado en la sección Marketing — lo puedes revisar ahí. Elevo esta degradación al criterio humano (Art. VII).";
    }
  }

  // Step 8: Run constitutional validation (second pass) on the FINAL response.
  // Start from the draft validator result if it flagged (so a draft violation
  // is preserved even if the final response somehow passes — strictest wins).
  let constitutional: ConstitutionalCheck =
    draftConstitutional ?? parsed.constitutional_check;
  try {
    const validatorResult = await validateConstitutional(finalResponse);
    if (validatorResult && validatorResult.approved === false) {
      constitutional = validatorResult;
    }
    // If the final validator approved but the draft flagged, keep the draft
    // flag — we don't let a rewrite wash away a real violation.
    if (
      draftConstitutional &&
      draftConstitutional.approved === false &&
      (!validatorResult || validatorResult.approved === true)
    ) {
      constitutional = draftConstitutional;
    }
    // Append the constitutional note to the response if flagged.
    if (constitutional && constitutional.approved === false) {
      finalResponse = appendConstitutionalNote(
        finalResponse,
        constitutional.violated_article,
        constitutional.note,
      );
    }
  } catch (e) {
    console.error("[core] Validator falló (no fatal), usando self-check de Core:", (e as Error).message);
  }

  // Step 9: Persist a new SessionContext row.
  const decisionsTaken = decisionsFromActions(actionsTaken);
  const documentsUpdated = buildDocumentsUpdated(actionsTaken);
  const advance = parsed.session_update.advance || "Sesión de Core";
  const objectiveCompleted = finalResponse.slice(0, 200);
  const pending = parsed.session_update.pending || "";
  const risks = parsed.session_update.risks || "";
  const nextObjective = parsed.session_update.nextObjective || "";

  let sessionId = "";
  try {
    const session = await db.sessionContext.create({
      data: {
        projectId,
        status: project.status,
        advance,
        objectiveCompleted,
        decisionsTaken: JSON.stringify(decisionsTaken),
        documentsUpdated: JSON.stringify(documentsUpdated),
        pending,
        risks,
        nextObjective,
        observations: "Sesión automática de LOGAN Core",
      },
    });
    sessionId = session.id;
  } catch (e) {
    console.error("[core] SessionContext persist falló (no fatal):", (e as Error).message);
  }

  // Step 10: Return the structured payload.
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
