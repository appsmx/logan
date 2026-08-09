// LOGAN Core — POST /api/core
//
// Etapa 2: single-LLM orchestrator.
// Etapa 3: marketing_execute delegation.
// Etapa 4.5: dev_execute + design_execute delegation.
// Analytics: analytics_verify + analytics_patterns delegation added.
// Finance: finance_execute delegation added.
//
// Flow:
//   1-6. Validate → Load project → Memory Report → System prompt → LLM call → Parse.
//   7. Draft constitutional validation.
//   8. Execute non-specialist actions.
//   9. Execute ALL specialist delegations IN PARALLEL:
//        a. marketing_execute → Marketing endpoint
//        b. dev_execute       → Dev endpoint
//        c. design_execute    → Design endpoint
//        d. analytics_verify  → Analytics verify endpoint
//        e. analytics_patterns → Analytics patterns endpoint
//  10. If any deliverables: integration LLM call.
//  11. Final constitutional validation.
//  12. Persist SessionContext.
//  13. Return.

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
  executeAnalyticsDelegations,
  executeFinanceDelegations,
  executeLegalDelegations,
  executeSupportDelegations,
} from "@/lib/core/execute-actions";
import { executeGitActions } from "@/lib/git/execute-git-actions";
import type {
  ActionTaken, ConstitutionalCheck, CoreEndpointResult,
  MarketingDeliverable, DevDeliverable, DesignDeliverable, AnalyticsDeliverable,
  FinanceDeliverable, LegalDeliverable, SupportDeliverable,
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
    return [];
  });
}

function decisionsFromActions(actionsTaken: ActionTaken[]): string[] {
  return actionsTaken.filter((a): a is Extract<ActionTaken,{type:"register_decision"}> => a.type === "register_decision").map((a) => a.decId);
}

// ─── Integration prompt ──────────────────────────────────────────────────────

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

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: CoreRequestBody;
  try { body = (await req.json().catch(() => ({}))) as CoreRequestBody; }
  catch { return badRequest("Cuerpo de la petición inválido"); }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();
  if (!projectId) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  if (!message) return badRequest("Mensaje vacío");

  let project;
  try { project = await db.project.findUnique({ where: { id: projectId } }); }
  catch (e) { console.error("[core] DB:", (e as Error).message); return unavailable(); }
  if (!project) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");

  let memoryReport: string;
  try { memoryReport = await buildMemoryReport(projectId); }
  catch (e) { console.error("[core] Memory falló:", (e as Error).message); memoryReport = "## Reporte de Memory\n\n> No se pudo generar el reporte."; }

  const biblia: ProjectBibliaContext = { id: project.id, name: project.name, vision: project.vision, users: project.users, status: project.status, currentPhase: project.currentPhase, currentMode: project.currentMode };
  const systemPrompt = buildSystemPrompt(biblia, memoryReport);

  let rawText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({ messages: [{ role: "assistant", content: systemPrompt }, { role: "user", content: message }], thinking: { type: "disabled" } });
    rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText?.trim()) { console.error("[core] LLM vacío"); return unavailable(); }
  } catch (e) { console.error("[core] Z.ai:", (e as Error).message); return unavailable(); }

  const parsed = parseCoreResponse(rawText);

  let draftConstitutional: ConstitutionalCheck | null = null;
  try { draftConstitutional = await validateConstitutional(parsed.response); }
  catch (e) { console.error("[core] Draft validator:", (e as Error).message); }
  const constitutionalForPersistence = draftConstitutional?.approved === false ? draftConstitutional : null;

  let nonSpecialistActions: ActionTaken[] = [];
  try { nonSpecialistActions = await executeActions(projectId, parsed.actions, constitutionalForPersistence); }
  catch (e) { console.error("[core] executeActions:", (e as Error).message); }

  // Execute ALL specialist delegations in parallel (Marketing, Dev, Design, Analytics, Finance, Legal, Support, Git).
  let marketingActionsTaken: ActionTaken[] = [], marketingDeliverables: MarketingDeliverable[] = [];
  let devActionsTaken: ActionTaken[] = [], devDeliverables: DevDeliverable[] = [];
  let designActionsTaken: ActionTaken[] = [], designDeliverables: DesignDeliverable[] = [];
  let analyticsActionsTaken: ActionTaken[] = [], analyticsDeliverables: AnalyticsDeliverable[] = [];
  let financeActionsTaken: ActionTaken[] = [], financeDeliverables: FinanceDeliverable[] = [];
  let legalActionsTaken: ActionTaken[] = [], legalDeliverables: LegalDeliverable[] = [];
  let supportActionsTaken: ActionTaken[] = [], supportDeliverables: SupportDeliverable[] = [];
  let gitActionsTaken: ActionTaken[] = [];

  try {
    const [mkt, dev, des, ana, fin, leg, sup, git] = await Promise.all([
      executeMarketingDelegations(projectId, parsed.actions),
      executeDevDelegations(projectId, parsed.actions),
      executeDesignDelegations(projectId, parsed.actions),
      executeAnalyticsDelegations(projectId, parsed.actions),
      executeFinanceDelegations(projectId, parsed.actions),
      executeLegalDelegations(projectId, parsed.actions),
      executeSupportDelegations(projectId, parsed.actions),
      executeGitActions(projectId, parsed.actions),
    ]);
    marketingActionsTaken = mkt.actionsTaken; marketingDeliverables = mkt.deliverables;
    devActionsTaken = dev.actionsTaken; devDeliverables = dev.deliverables;
    designActionsTaken = des.actionsTaken; designDeliverables = des.deliverables;
    analyticsActionsTaken = ana.actionsTaken; analyticsDeliverables = ana.deliverables;
    financeActionsTaken = fin.actionsTaken; financeDeliverables = fin.deliverables;
    legalActionsTaken = leg.actionsTaken; legalDeliverables = leg.deliverables;
    supportActionsTaken = sup.actionsTaken; supportDeliverables = sup.deliverables;
    gitActionsTaken = git;
  } catch (e) { console.error("[core] Delegations:", (e as Error).message); }

  const actionsTaken: ActionTaken[] = [...nonSpecialistActions, ...marketingActionsTaken, ...devActionsTaken, ...designActionsTaken, ...analyticsActionsTaken, ...financeActionsTaken, ...legalActionsTaken, ...supportActionsTaken, ...gitActionsTaken];

  const allDeliverables = [...marketingDeliverables, ...devDeliverables, ...designDeliverables, ...analyticsDeliverables, ...financeDeliverables, ...legalDeliverables, ...supportDeliverables];
  let finalResponse = parsed.response;

  if (allDeliverables.length > 0) {
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

  let constitutional: ConstitutionalCheck = draftConstitutional ?? parsed.constitutional_check;
  try {
    const v = await validateConstitutional(finalResponse);
    if (v?.approved === false) constitutional = v;
    if (draftConstitutional?.approved === false && (!v || v.approved === true)) constitutional = draftConstitutional;
    if (constitutional?.approved === false) finalResponse = appendConstitutionalNote(finalResponse, constitutional.violated_article, constitutional.note);
  } catch (e) { console.error("[core] Validator:", (e as Error).message); }

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

  return NextResponse.json({
    response: finalResponse, actionsTaken,
    constitutionalCheck: { approved: constitutional.approved, violatedArticle: constitutional.violated_article, note: constitutional.note },
    sessionId,
  } as CoreEndpointResult);
}

