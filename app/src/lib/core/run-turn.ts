// LOGAN Core — run-turn.ts (Task 30: latency optimization).
//
// Extracts the Core turn flow into a shared function so both /api/core (JSON)
// and /api/core/stream (SSE) can use the same logic. The only difference is
// /api/core/stream passes an onProgress callback that emits SSE events.
//
// The flow (with Task 30 optimizations applied):
//   1. Load project + build Memory Report + build system prompt.
//   2. Core LLM call #1 — decides what to do, emits actions.
//   3. PARALLEL: draft validator + executeActions + 9 specialist delegations.
//      (Task 30: previously draft validator + executeActions ran sequentially
//      before the delegations; now they run in parallel, saving ~3-5s.)
//   4. Integration LLM call (if any deliverables).
//   5. Synchronous constitutional check from draft validator.
//   6. Persist SessionContext.
//   7. Fire-and-forget background final validator (Task 30: previously blocked
//      the response ~3-5s; now runs in the background, non-blocking).
//   8. Return result.
//
// Progress callbacks fire at: "thinking" (before LLM #1), "delegating" (before
// parallel block, listing which specialists), "integrating" (before integration
// call), "done" (result ready).

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
  executeAnalyticsDelegations,
  executeFinanceDelegations,
  executeLegalDelegations,
  executeSupportDelegations,
  executeScaffoldDelegations,
} from "@/lib/core/execute-actions";
import { executeGitActions } from "@/lib/git/execute-git-actions";
import type {
  ActionTaken, ConstitutionalCheck, CoreEndpointResult,
  MarketingDeliverable, DevDeliverable, DesignDeliverable, AnalyticsDeliverable,
  FinanceDeliverable, LegalDeliverable, SupportDeliverable,
  ProjectBibliaContext,
} from "@/lib/core/types";

// ─── Progress types ──────────────────────────────────────────────────────────

export type CoreTurnStage = "thinking" | "delegating" | "integrating" | "validating" | "done";

export type CoreTurnProgress = {
  stage: CoreTurnStage;
  message: string;
  /** Which specialists are being consulted (only for "delegating" stage). */
  delegations?: string[];
};

export type OnProgress = (event: CoreTurnProgress) => void;

// ─── Error types ─────────────────────────────────────────────────────────────

export class CoreTurnError extends Error {
  constructor(public code: "bad_request" | "unavailable", message: string, public hint?: string) {
    super(message);
  }
}

// ─── Helpers (moved from route.ts) ───────────────────────────────────────────

function appendConstitutionalNote(response: string, violatedArticle: string | null, note: string): string {
  const articlePart = violatedArticle ? `el Artículo ${violatedArticle}` : "un artículo";
  const notePart = note?.length > 0 ? ` ${note}` : "";
  return response + "\n\n---\n" + `⚠️ Validación constitucional: la respuesta propuesta podría violar ${articlePart}.${notePart} Elevo este desacuerdo fundamentado al criterio humano (Art. VII, Art. IX).`;
}

function buildDocumentsUpdated(actionsTaken: ActionTaken[]): { doc: string; change: string }[] {
  return actionsTaken.flatMap((a) => {
    if (a.type === "register_decision") return [{ doc: "Decision", change: `${a.decId} creada` }];
    if (a.type === "register_hypothesis") return [{ doc: "Hypothesis", change: `HIP ${a.id} creada (pendiente)` }];
    if (a.type === "marketing_proposal") return [{ doc: "Hypothesis", change: `HIP ${a.hypothesisId} creada para Marketing` }, { doc: "MarketingAsset", change: `Asset ${a.marketingAssetId}` }];
    if (a.type === "marketing_execute") return a.hypothesisId ? [{ doc: "MarketingAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "MarketingAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "dev_execute") return a.hypothesisId ? [{ doc: "DevAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "DevAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "design_execute") return a.hypothesisId ? [{ doc: "DesignAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "DesignAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "analytics_verify") return a.verdict ? [{ doc: "Hypothesis", change: `HIP ${a.hypothesisId} → ${a.verdict}` }] : [{ doc: "Hypothesis", change: "Verificación fallida" }];
    if (a.type === "analytics_patterns") return [{ doc: "AnalyticsReport", change: `${a.title} (${a.hypothesesAnalyzed} hipótesis)` }];
    if (a.type === "finance_execute") return a.hypothesisId ? [{ doc: "FinanceAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "FinanceAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "legal_execute") return a.hypothesisId ? [{ doc: "LegalAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "LegalAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "support_execute") return a.hypothesisId ? [{ doc: "SupportAsset", change: `${a.title} (HIP ${a.hypothesisId})` }] : [{ doc: "SupportAsset", change: `Delegación ${a.capability} fallida` }];
    if (a.type === "git_create_branch") return [{ doc: "GitAction", change: `Branch ${a.branchName} en ${a.repo} — ${a.status}` }];
    if (a.type === "git_write_file") return [{ doc: "GitAction", change: `Archivo ${a.path} en ${a.branch}@${a.repo} — ${a.status}` }];
    if (a.type === "git_create_pr") return a.prUrl ? [{ doc: "GitAction", change: `PR #${a.prNumber} en ${a.repo} — ${a.status} (${a.prUrl})` }] : [{ doc: "GitAction", change: `PR en ${a.repo} — ${a.status} (fallido)` }];
    if (a.type === "git_get_status") return [{ doc: "GitAction", change: `Status ${a.repo} — ${a.status}` }];
    if (a.type === "scaffold_project") {
      if (a.status === "creado") {
        return [
          { doc: "Project", change: `Nuevo proyecto "${a.productName}" (slug: ${a.productSlug}) — repo: ${a.repo}` },
          ...(a.files || []).map((f) => ({ doc: "ScaffoldFile", change: `${f.path} en ${a.repo}` })),
        ];
      }
      return [{ doc: "Scaffold", change: `Falló scaffold de "${a.productName}" — ${a.error || "error desconocido"}` }];
    }
    return [];
  });
}

function decisionsFromActions(actionsTaken: ActionTaken[]): string[] {
  return actionsTaken.filter((a): a is Extract<ActionTaken,{type:"register_decision"}> => a.type === "register_decision").map((a) => a.decId);
}

const INTEGRATION_SYSTEM_PROMPT = `Eres LOGAN Core. Recibiste el trabajo de uno o varios especialistas (Marketing, Dev, Design, Analytics, Finance, Legal, Support) y debes integrarlo en una respuesta coherente al usuario, en tu única voz LOGAN. NO inventes. Cita el entregable cuando sea relevante. Art. IX (arquitecto colaborador) y Art. VII (señala riesgos). Para entregables legales, recuerda al usuario que son propuestas, no asesoría legal vinculante (validación por abogado colegiado). Responde en español, cálida y directamente. NO uses JSON — texto natural.`;

function renderDeliverable(i: number, role: string, label: string, capability: string, title: string, content: string, hyp: { context: string; hypothesis: string; prediction: string }): string[] {
  return ["", `### Entregable ${i + 1} [${role}]: ${label} (${capability})`, "", `**Título:** ${title}`, "", "**Contenido:**", "", content, "", "**Hipótesis (DEC-LOGAN-004):**", `- Contexto: ${hyp.context}`, `- Hipótesis: ${hyp.hypothesis}`, `- Predicción: ${hyp.prediction}`];
}

function buildIntegrationUserPrompt(
  msg: string,
  marketing: MarketingDeliverable[], dev: DevDeliverable[],
  design: DesignDeliverable[], analytics: AnalyticsDeliverable[],
  finance: FinanceDeliverable[],
  legal: LegalDeliverable[],
  support: SupportDeliverable[],
): string {
  const lines: string[] = ["## Mensaje original del usuario", "", msg, "", "## Entregables de los especialistas"];
  let i = 0;
  for (const d of marketing) lines.push(...renderDeliverable(i++, "Marketing", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  for (const d of dev) lines.push(...renderDeliverable(i++, "Dev", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  for (const d of design) lines.push(...renderDeliverable(i++, "Design", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  for (const d of analytics) {
    lines.push("", `### Entregable ${i++ + 1} [Analytics]: ${d.kind === "verify" ? "Verificación" : "Análisis de patrones"}`, "", `**Título:** ${d.title}`, "", "**Reporte:**", "", d.content);
    if (d.topLearnings?.length) lines.push("", "**Aprendizajes clave:**", ...d.topLearnings.map((l) => `- ${l}`));
  }
  for (const d of finance) lines.push(...renderDeliverable(i++, "Finance", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  for (const d of legal) lines.push(...renderDeliverable(i++, "Legal", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  for (const d of support) lines.push(...renderDeliverable(i++, "Support", d.capabilityLabel, d.capability, d.title, d.content, d.hypothesis));
  lines.push("", "## Tu tarea", "", "Integra todos los entregables en una sola voz LOGAN, cálida, clara y específica al proyecto. Para Analytics destaca el veredicto y aprendizaje; para Finance destaca los números y la recomendación; para Legal destaca el marco normativo y recomienda validación por abogado colegiado; para Support destaca los pasos accionables y la métrica a observar. NO repitas el contenido crudo — sintetiza en lenguaje natural.");
  return lines.join("\n");
}

/** Maps action types to human-readable specialist names for progress messages. */
function delegationLabelsFor(actions: { type: string }[]): string[] {
  const labels: string[] = [];
  if (actions.some((a) => a.type === "marketing_execute")) labels.push("Marketing");
  if (actions.some((a) => a.type === "dev_execute")) labels.push("Dev");
  if (actions.some((a) => a.type === "design_execute")) labels.push("Design");
  if (actions.some((a) => a.type === "analytics_verify" || a.type === "analytics_patterns")) labels.push("Analytics");
  if (actions.some((a) => a.type === "finance_execute")) labels.push("Finance");
  if (actions.some((a) => a.type === "legal_execute")) labels.push("Legal");
  if (actions.some((a) => a.type === "support_execute")) labels.push("Support");
  if (actions.some((a) => a.type.startsWith("git_"))) labels.push("GitHub");
  if (actions.some((a) => a.type === "scaffold_project")) labels.push("Scaffold");
  return labels;
}

// ─── Task 30: best-effort background flagging ────────────────────────────────

async function bestEffortFlagRecentDecision(projectId: string): Promise<void> {
  try {
    const recent = await db.decision.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    if (!recent || recent.status === "propuesta") return;
    await db.decision.update({
      where: { id: recent.id },
      data: {
        status: "propuesta",
        justification: `${recent.justification || ""}\n\n---\n⚠️ VALIDACIÓN CONSTITUCIONAL EN SEGUNDO PLANO (Art. VII/IX): el validador en segundo plano marcó esta decisión para revisión humana después de que la respuesta integrada se envió al usuario.`,
      },
    });
  } catch (e) {
    console.error("[core] bestEffortFlagRecentDecision:", (e as Error).message);
  }
}

// ─── Main flow ──────────────────────────────────────────────────────────────

/**
 * Runs a single LOGAN Core turn end-to-end.
 *
 * @param projectId — the active project's ID.
 * @param message — the user's message.
 * @param onProgress — optional callback for progress events (used by SSE streaming).
 * @returns the CoreEndpointResult (response, actionsTaken, constitutionalCheck, sessionId).
 * @throws CoreTurnError on validation failures or unavailable LLM.
 */
export async function runCoreTurn(
  projectId: string,
  message: string,
  onProgress?: OnProgress,
): Promise<CoreEndpointResult> {
  const emit = (event: CoreTurnProgress) => { try { onProgress?.(event); } catch { /* swallow */ } };

  // 1. Load project.
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) throw new CoreTurnError("bad_request", "Proyecto no encontrado", "Crea o selecciona un proyecto primero");

  // 2. Build Memory Report (5 DB queries + GitHub repo state, all parallel).
  let memoryReport: string;
  try { memoryReport = await buildMemoryReport(projectId); }
  catch (e) { console.error("[core] Memory falló:", (e as Error).message); memoryReport = "## Reporte de Memory\n\n> No se pudo generar el reporte."; }

  const biblia: ProjectBibliaContext = { id: project.id, name: project.name, vision: project.vision, users: project.users, status: project.status, currentPhase: project.currentPhase, currentMode: project.currentMode, repo: project.repo };
  const systemPrompt = buildSystemPrompt(biblia, memoryReport);

  // 3. Core LLM call #1 — decides what to do.
  emit({ stage: "thinking", message: "Pensando…" });
  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({ messages: [{ role: "assistant", content: systemPrompt }, { role: "user", content: message }], thinking: { type: "disabled" } });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) { console.error("[core] LLM vacío"); throw new CoreTurnError("unavailable", "LOGAN Core no disponible en este momento"); }
  } catch (e) {
    if (e instanceof CoreTurnError) throw e;
    console.error("[core] Z.ai:", (e as Error).message);
    throw new CoreTurnError("unavailable", "LOGAN Core no disponible en este momento");
  }

  const parsed = parseCoreResponse(rawText);

  // 4. Task 30: PARALLEL — draft validator + executeActions + 9 specialist delegations.
  const delegationLabels = delegationLabelsFor(parsed.actions);
  if (delegationLabels.length > 0) {
    emit({ stage: "delegating", message: `Consultando a ${delegationLabels.join(", ")}…`, delegations: delegationLabels });
  } else {
    emit({ stage: "validating", message: "Validando respuesta…" });
  }

  let draftConstitutional: ConstitutionalCheck | null = null;
  let nonSpecialistActions: ActionTaken[] = [];
  let marketingActionsTaken: ActionTaken[] = [], marketingDeliverables: MarketingDeliverable[] = [];
  let devActionsTaken: ActionTaken[] = [], devDeliverables: DevDeliverable[] = [];
  let designActionsTaken: ActionTaken[] = [], designDeliverables: DesignDeliverable[] = [];
  let analyticsActionsTaken: ActionTaken[] = [], analyticsDeliverables: AnalyticsDeliverable[] = [];
  let financeActionsTaken: ActionTaken[] = [], financeDeliverables: FinanceDeliverable[] = [];
  let legalActionsTaken: ActionTaken[] = [], legalDeliverables: LegalDeliverable[] = [];
  let supportActionsTaken: ActionTaken[] = [], supportDeliverables: SupportDeliverable[] = [];
  let gitActionsTaken: ActionTaken[] = [];
  let scaffoldActionsTaken: ActionTaken[] = [];

  try {
    const [draftAndActions, mkt, dev, des, ana, fin, leg, sup, git, sca] = await Promise.all([
      // Branch 1: draft validator → executeActions (sequential within branch).
      (async () => {
        let draft: ConstitutionalCheck | null = null;
        try { draft = await validateConstitutional(parsed.response); }
        catch (e) { console.error("[core] Draft validator:", (e as Error).message); }
        const constitutionalForPersistence = draft?.approved === false ? draft : null;
        let actions: ActionTaken[] = [];
        try { actions = await executeActions(projectId, parsed.actions, constitutionalForPersistence); }
        catch (e) { console.error("[core] executeActions:", (e as Error).message); }
        return { draft, actions };
      })(),
      executeMarketingDelegations(projectId, parsed.actions),
      executeDevDelegations(projectId, parsed.actions),
      executeDesignDelegations(projectId, parsed.actions),
      executeAnalyticsDelegations(projectId, parsed.actions),
      executeFinanceDelegations(projectId, parsed.actions),
      executeLegalDelegations(projectId, parsed.actions),
      executeSupportDelegations(projectId, parsed.actions),
      executeGitActions(projectId, parsed.actions),
      executeScaffoldDelegations(parsed.actions),
    ]);
    draftConstitutional = draftAndActions.draft;
    nonSpecialistActions = draftAndActions.actions;
    marketingActionsTaken = mkt.actionsTaken; marketingDeliverables = mkt.deliverables;
    devActionsTaken = dev.actionsTaken; devDeliverables = dev.deliverables;
    designActionsTaken = des.actionsTaken; designDeliverables = des.deliverables;
    analyticsActionsTaken = ana.actionsTaken; analyticsDeliverables = ana.deliverables;
    financeActionsTaken = fin.actionsTaken; financeDeliverables = fin.deliverables;
    legalActionsTaken = leg.actionsTaken; legalDeliverables = leg.deliverables;
    supportActionsTaken = sup.actionsTaken; supportDeliverables = sup.deliverables;
    gitActionsTaken = git;
    scaffoldActionsTaken = sca;
  } catch (e) { console.error("[core] Delegations:", (e as Error).message); }

  const actionsTaken: ActionTaken[] = [...nonSpecialistActions, ...marketingActionsTaken, ...devActionsTaken, ...designActionsTaken, ...analyticsActionsTaken, ...financeActionsTaken, ...legalActionsTaken, ...supportActionsTaken, ...gitActionsTaken, ...scaffoldActionsTaken];

  const allDeliverables = [...marketingDeliverables, ...devDeliverables, ...designDeliverables, ...analyticsDeliverables, ...financeDeliverables, ...legalDeliverables, ...supportDeliverables];
  let finalResponse = parsed.response;

  // 5. Integration LLM call (if deliverables).
  if (allDeliverables.length > 0) {
    emit({ stage: "integrating", message: "Integrando respuesta…" });
    try {
      const zai = await ZAI.create();
      const integrationPrompt = buildIntegrationUserPrompt(message, marketingDeliverables, devDeliverables, designDeliverables, analyticsDeliverables, financeDeliverables, legalDeliverables, supportDeliverables);
      const completion = await zai.chat.completions.create({ messages: [{ role: "assistant", content: INTEGRATION_SYSTEM_PROMPT }, { role: "user", content: integrationPrompt }], thinking: { type: "disabled" } });
      const integrated = completion.choices[0]?.message?.content ?? "";
      if (integrated?.trim()) finalResponse = integrated.trim();
      else console.error("[core] Integration LLM vacío, usando draft");
    } catch (e) {
      console.error("[core] Integration falló:", (e as Error).message);
      finalResponse = parsed.response + "\n\n---\n⚠️ No pude integrar el entregable del especialista (fallo técnico). El entregable SÍ se creó — puedes revisarlo en la sección correspondiente. Elevo esta degradación al criterio humano (Art. VII).";
    }
  }

  // 6. Task 30: synchronous constitutional check from draft validator.
  let constitutional: ConstitutionalCheck = draftConstitutional ?? parsed.constitutional_check;
  if (constitutional?.approved === false) {
    finalResponse = appendConstitutionalNote(finalResponse, constitutional.violated_article, constitutional.note);
  }

  // 7. Persist SessionContext.
  let sessionId = "";
  try {
    const session = await db.sessionContext.create({
      data: {
        projectId, status: project.status,
        advance: parsed.session_update.advance || "Sesión de Core",
        objectiveCompleted: finalResponse.slice(0, 200),
        decisionsTaken: JSON.stringify(decisionsFromActions(actionsTaken)),
        documentsUpdated: JSON.stringify(buildDocumentsUpdated(actionsTaken)),
        pending: parsed.session_update.pending || "",
        risks: parsed.session_update.risks || "",
        nextObjective: parsed.session_update.nextObjective || "",
        observations: "Sesión automática de LOGAN Core",
      },
    });
    sessionId = session.id;
  } catch (e) { console.error("[core] SessionContext:", (e as Error).message); }

  // 8. Task 30: fire-and-forget background final validator (non-blocking).
  if (finalResponse !== parsed.response) {
    validateConstitutional(finalResponse)
      .then((v) => {
        if (v?.approved === false) {
          console.warn("[core] Background validator flagged Art.", v.violated_article, "—", v.note);
          bestEffortFlagRecentDecision(projectId).catch(() => {});
        }
      })
      .catch((e) => console.error("[core] Background validator:", (e as Error).message));
  }

  emit({ stage: "done", message: "Respuesta lista" });

  return {
    response: finalResponse, actionsTaken,
    constitutionalCheck: { approved: constitutional.approved, violatedArticle: constitutional.violated_article, note: constitutional.note },
    sessionId,
  } as CoreEndpointResult;
}
