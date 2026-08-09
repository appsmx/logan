// LOGAN Core — execute actions.
//
// Etapa 2: register_decision, register_hypothesis.
// Etapa 3: marketing_execute delegation added.
// Etapa 4.5: dev_execute + design_execute delegation added.
// Analytics: analytics_verify + analytics_patterns delegation added.

import { db } from "@/lib/db";
import { MARKETING_CAPABILITIES, DEV_CAPABILITIES, DESIGN_CAPABILITIES, FINANCE_CAPABILITIES, LEGAL_CAPABILITIES, SUPPORT_CAPABILITIES } from "@/lib/logan-os-data";
import type {
  ActionTaken, CoreAction, ConstitutionalCheck,
  MarketingDeliverable, DevDeliverable, DesignDeliverable, AnalyticsDeliverable, FinanceDeliverable,
  LegalDeliverable, SupportDeliverable,
} from "@/lib/core/types";

async function nextDecId(projectId: string): Promise<string> {
  const count = await db.decision.count({ where: { projectId } });
  return `DEC-${String(count + 1).padStart(3, "0")}`;
}

function marketingAssetTypeFor(k: string) { return MARKETING_CAPABILITIES.find((c) => c.key === k)?.producesAssetType ?? "improvement_proposal"; }
function marketingCapabilityLabel(k: string) { return MARKETING_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }
function devCapabilityLabel(k: string) { return DEV_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }
function designCapabilityLabel(k: string) { return DESIGN_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }
function financeCapabilityLabel(k: string) { return FINANCE_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }
function legalCapabilityLabel(k: string) { return LEGAL_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }
function supportCapabilityLabel(k: string) { return SUPPORT_CAPABILITIES.find((c) => c.key === k)?.label ?? k; }

// ─── Specialist callers ──────────────────────────────────────────────────────

async function callMarketingEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/marketing/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] marketing_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { marketingAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { marketingAssetId: d.marketingAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] marketing fetch falló:", (e as Error).message); return null; }
}

async function callDevEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/dev/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] dev_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { devAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { devAssetId: d.devAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] dev fetch falló:", (e as Error).message); return null; }
}

async function callDesignEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/design/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] design_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { designAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { designAssetId: d.designAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] design fetch falló:", (e as Error).message); return null; }
}

async function callAnalyticsVerifyEndpoint(
  projectId: string, hypothesisId: string, outcome: string, evidence: string, brief?: string,
) {
  try {
    const res = await fetch("http://localhost:3000/api/analytics/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, hypothesisId, outcome, evidence, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] analytics_verify:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { hypothesisId: string; verdict: string; title: string; content: string; learning: { isUniversal: boolean; summary: string; recommendation: string }; analyticsHypothesisId: string };
    return d;
  } catch (e) { console.error("[core] analytics/verify fetch falló:", (e as Error).message); return null; }
}

async function callAnalyticsPatternsEndpoint(
  projectId: string, roleFilter?: string, statusFilter?: string,
) {
  try {
    const res = await fetch("http://localhost:3000/api/analytics/patterns", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, roleFilter, statusFilter }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] analytics_patterns:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { projectId: string; title: string; content: string; topLearnings: string[]; universalCandidates: string[]; analyticsHypothesisId: string; hypothesesAnalyzed: number };
    return d;
  } catch (e) { console.error("[core] analytics/patterns fetch falló:", (e as Error).message); return null; }
}

// ─── executeOne ──────────────────────────────────────────────────────────────

async function callFinanceEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/finance/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] finance_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { financeAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { financeAssetId: d.financeAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] finance fetch falló:", (e as Error).message); return null; }
}

async function callLegalEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/legal/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] legal_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { legalAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { legalAssetId: d.legalAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] legal fetch falló:", (e as Error).message); return null; }
}

async function callSupportEndpoint(projectId: string, capability: string, brief: string) {
  try {
    const res = await fetch("http://localhost:3000/api/support/execute", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("[core] support_execute:", res.status, (e as {error?:string}).error||""); return null; }
    const d = await res.json() as { supportAssetId: string; hypothesisId: string; title: string; content: string; hypothesis: { context: string; hypothesis: string; prediction: string } };
    return { supportAssetId: d.supportAssetId, hypothesisId: d.hypothesisId, title: d.title, content: d.content, hypothesis: { context: d.hypothesis?.context??"", hypothesis: d.hypothesis?.hypothesis??"", prediction: d.hypothesis?.prediction??"" } };
  } catch (e) { console.error("[core] support fetch falló:", (e as Error).message); return null; }
}

async function executeOne(
  projectId: string, action: CoreAction, constitutional?: ConstitutionalCheck | null,
): Promise<ActionTaken | null> {
  try {
    if (action.type === "register_decision") {
      const decId = await nextDecId(projectId);
      const alts = Array.isArray(action.alternatives) && action.alternatives.length >= 2
        ? action.alternatives.filter((x) => typeof x === "string" && x.length > 0)
        : [...(action.alternatives||[]).filter((x) => typeof x === "string" && x.length > 0), "(no se consideraron alternativas explícitas)"];
      const wasFlagged = !!constitutional && constitutional.approved === false;
      const finalStatus = wasFlagged ? "propuesta" : (action.status || "aprobada").trim();
      const justification = wasFlagged
        ? `${action.justification||""}\n\n---\n⚠️ VALIDACIÓN CONSTITUCIONAL (Art. VII/IX): posible violación del Art. ${constitutional?.violated_article||"?"}. ${constitutional?.note||""}\nEsta decisión queda como "propuesta" pendiente de tu criterio humano.`
        : (action.justification||"");
      const created = await db.decision.create({
        data: { projectId, roleId: action.roleId||"core", decId, title: action.title||"(sin título)", problem: action.problem||"", alternatives: JSON.stringify(alts), decision: action.decision||"", justification, consequences: action.consequences||"", status: finalStatus },
      });
      return { type: "register_decision", decId: created.decId, id: created.id };
    }
    if (action.type === "register_hypothesis") {
      const created = await db.hypothesis.create({
        data: { projectId, roleId: action.roleId||"core", context: action.context||"", hypothesis: action.hypothesis||"", prediction: action.prediction||"", status: "pendiente", outcome: "", evidence: "" },
      });
      return { type: "register_hypothesis", id: created.id };
    }
    if (action.type === "marketing_proposal") {
      const hyp = await db.hypothesis.create({ data: { projectId, roleId: "marketing", context: action.hypothesisContext||"", hypothesis: action.hypothesis||"", prediction: action.hypothesisPrediction||"", status: "pendiente", outcome: "", evidence: "" } });
      const asset = await db.marketingAsset.create({ data: { projectId, type: marketingAssetTypeFor(action.capability), title: action.title||"(sin título)", content: action.content||"", hypothesisId: hyp.id } });
      return { type: "marketing_proposal", hypothesisId: hyp.id, marketingAssetId: asset.id };
    }
    return null;
  } catch (e) {
    console.error("[core] execute-actions: fallo persistiendo", "type" in action ? action.type : "unknown", (e as Error).message);
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function executeActions(projectId: string, actions: CoreAction[], constitutional?: ConstitutionalCheck | null): Promise<ActionTaken[]> {
  const results: ActionTaken[] = [];
  for (const action of actions) {
    if (["marketing_execute","dev_execute","design_execute","analytics_verify","analytics_patterns","finance_execute","legal_execute","support_execute","git_create_branch","git_write_file","git_create_pr","git_get_status"].includes(action.type)) continue;
    const r = await executeOne(projectId, action, constitutional);
    if (r) results.push(r);
  }
  return results;
}

export async function executeMarketingDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: MarketingDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: MarketingDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"marketing_execute"}> => a.type === "marketing_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callMarketingEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "marketing_execute", capability: action.capability, marketingAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "marketing_execute", capability: action.capability, marketingAssetId: result.marketingAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: marketingCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, marketingAssetId: result.marketingAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}

export async function executeDevDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: DevDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: DevDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"dev_execute"}> => a.type === "dev_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callDevEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "dev_execute", capability: action.capability, devAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "dev_execute", capability: action.capability, devAssetId: result.devAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: devCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, devAssetId: result.devAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}

export async function executeDesignDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: DesignDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: DesignDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"design_execute"}> => a.type === "design_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callDesignEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "design_execute", capability: action.capability, designAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "design_execute", capability: action.capability, designAssetId: result.designAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: designCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, designAssetId: result.designAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}

export async function executeAnalyticsDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: AnalyticsDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: AnalyticsDeliverable[] = [];

  const verifyActions = actions.filter((a): a is Extract<CoreAction,{type:"analytics_verify"}> => a.type === "analytics_verify");
  const patternActions = actions.filter((a): a is Extract<CoreAction,{type:"analytics_patterns"}> => a.type === "analytics_patterns");

  // Run all analytics calls in parallel.
  const [verifyResults, patternResults] = await Promise.all([
    Promise.all(verifyActions.map(async (a) => ({ action: a, result: await callAnalyticsVerifyEndpoint(projectId, a.hypothesisId, a.outcome, a.evidence, a.brief) }))),
    Promise.all(patternActions.map(async (a) => ({ action: a, result: await callAnalyticsPatternsEndpoint(projectId, a.roleFilter, a.statusFilter) }))),
  ]);

  for (const { action, result } of verifyResults) {
    if (!result) { actionsTaken.push({ type: "analytics_verify", hypothesisId: action.hypothesisId, verdict: "", analyticsHypothesisId: "", title: "(verificación fallida)" }); continue; }
    actionsTaken.push({ type: "analytics_verify", hypothesisId: result.hypothesisId, verdict: result.verdict, analyticsHypothesisId: result.analyticsHypothesisId, title: result.title });
    deliverables.push({ kind: "verify", title: result.title, content: result.content, verdict: result.verdict, hypothesisId: result.hypothesisId, analyticsHypothesisId: result.analyticsHypothesisId });
  }

  for (const { action: _action, result } of patternResults) {
    if (!result) { actionsTaken.push({ type: "analytics_patterns", analyticsHypothesisId: "", hypothesesAnalyzed: 0, title: "(análisis de patrones fallido)" }); continue; }
    actionsTaken.push({ type: "analytics_patterns", analyticsHypothesisId: result.analyticsHypothesisId, hypothesesAnalyzed: result.hypothesesAnalyzed, title: result.title });
    deliverables.push({ kind: "patterns", title: result.title, content: result.content, analyticsHypothesisId: result.analyticsHypothesisId, hypothesesAnalyzed: result.hypothesesAnalyzed, topLearnings: result.topLearnings });
  }

  return { actionsTaken, deliverables };
}


export async function executeFinanceDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: FinanceDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: FinanceDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"finance_execute"}> => a.type === "finance_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callFinanceEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "finance_execute", capability: action.capability, financeAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "finance_execute", capability: action.capability, financeAssetId: result.financeAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: financeCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, financeAssetId: result.financeAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}

export async function executeLegalDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: LegalDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: LegalDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"legal_execute"}> => a.type === "legal_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callLegalEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "legal_execute", capability: action.capability, legalAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "legal_execute", capability: action.capability, legalAssetId: result.legalAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: legalCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, legalAssetId: result.legalAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}

export async function executeSupportDelegations(projectId: string, actions: CoreAction[]): Promise<{ actionsTaken: ActionTaken[]; deliverables: SupportDeliverable[] }> {
  const actionsTaken: ActionTaken[] = []; const deliverables: SupportDeliverable[] = [];
  const filtered = actions.filter((a): a is Extract<CoreAction,{type:"support_execute"}> => a.type === "support_execute");
  const results = await Promise.all(filtered.map(async (a) => ({ action: a, result: await callSupportEndpoint(projectId, a.capability, a.brief) })));
  for (const { action, result } of results) {
    if (!result) { actionsTaken.push({ type: "support_execute", capability: action.capability, supportAssetId: "", hypothesisId: "", title: "(delegación fallida)" }); continue; }
    actionsTaken.push({ type: "support_execute", capability: action.capability, supportAssetId: result.supportAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: supportCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, supportAssetId: result.supportAssetId, hypothesis: result.hypothesis });
  }
  return { actionsTaken, deliverables };
}
