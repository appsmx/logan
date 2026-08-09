// LOGAN Core — execute actions.
//
// Etapa 2: register_decision, register_hypothesis.
// Etapa 3: marketing_execute delegation added.
// Etapa 4.5: dev_execute + design_execute delegation added.
//
// Each action is attempted independently — if one fails, the rest still
// proceed (Art. III — robustness over transactions).

import { db } from "@/lib/db";
import { MARKETING_CAPABILITIES, DEV_CAPABILITIES, DESIGN_CAPABILITIES } from "@/lib/logan-os-data";
import type {
  ActionTaken,
  CoreAction,
  ConstitutionalCheck,
  MarketingDeliverable,
  DevDeliverable,
  DesignDeliverable,
} from "@/lib/core/types";

async function nextDecId(projectId: string): Promise<string> {
  const count = await db.decision.count({ where: { projectId } });
  return `DEC-${String(count + 1).padStart(3, "0")}`;
}

function marketingAssetTypeFor(capabilityKey: string): string {
  const cap = MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey);
  return cap?.producesAssetType ?? "improvement_proposal";
}

function marketingCapabilityLabel(capabilityKey: string): string {
  return MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey)?.label ?? capabilityKey;
}

function devCapabilityLabel(capabilityKey: string): string {
  return DEV_CAPABILITIES.find((c) => c.key === capabilityKey)?.label ?? capabilityKey;
}

function designCapabilityLabel(capabilityKey: string): string {
  return DESIGN_CAPABILITIES.find((c) => c.key === capabilityKey)?.label ?? capabilityKey;
}

// ─── Specialist endpoint callers ────────────────────────────────────────────

async function callMarketingEndpoint(
  projectId: string,
  capability: string,
  brief: string,
): Promise<{
  marketingAssetId: string;
  hypothesisId: string;
  title: string;
  content: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
} | null> {
  try {
    const res = await fetch("http://localhost:3000/api/marketing/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[core] marketing_execute:", res.status, (err as { error?: string }).error || "");
      return null;
    }
    const data = await res.json() as {
      marketingAssetId: string; hypothesisId: string; title: string; content: string;
      hypothesis: { context: string; hypothesis: string; prediction: string; id: string; status: string };
    };
    return {
      marketingAssetId: data.marketingAssetId,
      hypothesisId: data.hypothesisId,
      title: data.title,
      content: data.content,
      hypothesis: {
        context: data.hypothesis?.context ?? "",
        hypothesis: data.hypothesis?.hypothesis ?? "",
        prediction: data.hypothesis?.prediction ?? "",
      },
    };
  } catch (e) {
    console.error("[core] marketing_execute fetch falló:", capability, (e as Error).message);
    return null;
  }
}

async function callDevEndpoint(
  projectId: string,
  capability: string,
  brief: string,
): Promise<{
  devAssetId: string;
  hypothesisId: string;
  title: string;
  content: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
} | null> {
  try {
    const res = await fetch("http://localhost:3000/api/dev/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[core] dev_execute:", res.status, (err as { error?: string }).error || "");
      return null;
    }
    const data = await res.json() as {
      devAssetId: string; hypothesisId: string; title: string; content: string;
      hypothesis: { context: string; hypothesis: string; prediction: string; id: string; status: string };
    };
    return {
      devAssetId: data.devAssetId,
      hypothesisId: data.hypothesisId,
      title: data.title,
      content: data.content,
      hypothesis: {
        context: data.hypothesis?.context ?? "",
        hypothesis: data.hypothesis?.hypothesis ?? "",
        prediction: data.hypothesis?.prediction ?? "",
      },
    };
  } catch (e) {
    console.error("[core] dev_execute fetch falló:", capability, (e as Error).message);
    return null;
  }
}

async function callDesignEndpoint(
  projectId: string,
  capability: string,
  brief: string,
): Promise<{
  designAssetId: string;
  hypothesisId: string;
  title: string;
  content: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
} | null> {
  try {
    const res = await fetch("http://localhost:3000/api/design/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, capability, brief }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[core] design_execute:", res.status, (err as { error?: string }).error || "");
      return null;
    }
    const data = await res.json() as {
      designAssetId: string; hypothesisId: string; title: string; content: string;
      hypothesis: { context: string; hypothesis: string; prediction: string; id: string; status: string };
    };
    return {
      designAssetId: data.designAssetId,
      hypothesisId: data.hypothesisId,
      title: data.title,
      content: data.content,
      hypothesis: {
        context: data.hypothesis?.context ?? "",
        hypothesis: data.hypothesis?.hypothesis ?? "",
        prediction: data.hypothesis?.prediction ?? "",
      },
    };
  } catch (e) {
    console.error("[core] design_execute fetch falló:", capability, (e as Error).message);
    return null;
  }
}

// ─── executeOne ──────────────────────────────────────────────────────────────

async function executeOne(
  projectId: string,
  action: CoreAction,
  constitutional?: ConstitutionalCheck | null,
): Promise<ActionTaken | null> {
  try {
    if (action.type === "register_decision") {
      const decId = await nextDecId(projectId);
      const alts =
        Array.isArray(action.alternatives) && action.alternatives.length >= 2
          ? action.alternatives.filter((x) => typeof x === "string" && x.length > 0)
          : [
              ...(action.alternatives || []).filter((x) => typeof x === "string" && x.length > 0),
              "(no se consideraron alternativas explícitas)",
            ];

      const wasFlagged = !!constitutional && constitutional.approved === false;
      const finalStatus = wasFlagged ? "propuesta" : (action.status || "aprobada").trim();
      const justification = wasFlagged
        ? `${action.justification || ""}\n\n---\n⚠️ VALIDACIÓN CONSTITUCIONAL (Art. VII/IX): posible violación del Art. ${constitutional?.violated_article || "?"}. ${constitutional?.note || ""}\nEsta decisión queda como "propuesta" pendiente de tu criterio humano.`
        : (action.justification || "");

      const created = await db.decision.create({
        data: {
          projectId,
          roleId: action.roleId || "core",
          decId,
          title: action.title || "(sin título)",
          problem: action.problem || "",
          alternatives: JSON.stringify(alts),
          decision: action.decision || "",
          justification,
          consequences: action.consequences || "",
          status: finalStatus,
        },
      });
      return { type: "register_decision", decId: created.decId, id: created.id };
    }

    if (action.type === "register_hypothesis") {
      const created = await db.hypothesis.create({
        data: {
          projectId,
          roleId: action.roleId || "core",
          context: action.context || "",
          hypothesis: action.hypothesis || "",
          prediction: action.prediction || "",
          status: "pendiente",
          outcome: "",
          evidence: "",
        },
      });
      return { type: "register_hypothesis", id: created.id };
    }

    if (action.type === "marketing_proposal") {
      const hyp = await db.hypothesis.create({
        data: {
          projectId,
          roleId: "marketing",
          context: action.hypothesisContext || "",
          hypothesis: action.hypothesis || "",
          prediction: action.hypothesisPrediction || "",
          status: "pendiente",
          outcome: "",
          evidence: "",
        },
      });
      const asset = await db.marketingAsset.create({
        data: {
          projectId,
          type: marketingAssetTypeFor(action.capability),
          title: action.title || "(sin título)",
          content: action.content || "",
          hypothesisId: hyp.id,
        },
      });
      return { type: "marketing_proposal", hypothesisId: hyp.id, marketingAssetId: asset.id };
    }

    // marketing_execute / dev_execute / design_execute handled by their
    // respective delegation functions below.
    return null;
  } catch (e) {
    console.error("[core] execute-actions: fallo persistiendo acción", "type" in action ? action.type : "unknown", (e as Error).message);
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Persists all NON-SPECIALIST actions (register_decision, register_hypothesis,
 * legacy marketing_proposal). Specialist delegations are handled separately.
 */
export async function executeActions(
  projectId: string,
  actions: CoreAction[],
  constitutional?: ConstitutionalCheck | null,
): Promise<ActionTaken[]> {
  const results: ActionTaken[] = [];
  for (const action of actions) {
    if (
      action.type === "marketing_execute" ||
      action.type === "dev_execute" ||
      action.type === "design_execute"
    ) continue;
    const r = await executeOne(projectId, action, constitutional);
    if (r) results.push(r);
  }
  return results;
}

/** Executes every `marketing_execute` action in parallel. */
export async function executeMarketingDelegations(
  projectId: string,
  actions: CoreAction[],
): Promise<{ actionsTaken: ActionTaken[]; deliverables: MarketingDeliverable[] }> {
  const actionsTaken: ActionTaken[] = [];
  const deliverables: MarketingDeliverable[] = [];

  const filtered = actions.filter(
    (a): a is Extract<CoreAction, { type: "marketing_execute" }> => a.type === "marketing_execute",
  );

  const results = await Promise.all(
    filtered.map(async (action) => ({ action, result: await callMarketingEndpoint(projectId, action.capability, action.brief) })),
  );

  for (const { action, result } of results) {
    if (!result) {
      actionsTaken.push({ type: "marketing_execute", capability: action.capability, marketingAssetId: "", hypothesisId: "", title: "(delegación fallida)" });
      continue;
    }
    actionsTaken.push({ type: "marketing_execute", capability: action.capability, marketingAssetId: result.marketingAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: marketingCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, marketingAssetId: result.marketingAssetId, hypothesis: result.hypothesis });
  }

  return { actionsTaken, deliverables };
}

/** Executes every `dev_execute` action in parallel. */
export async function executeDevDelegations(
  projectId: string,
  actions: CoreAction[],
): Promise<{ actionsTaken: ActionTaken[]; deliverables: DevDeliverable[] }> {
  const actionsTaken: ActionTaken[] = [];
  const deliverables: DevDeliverable[] = [];

  const filtered = actions.filter(
    (a): a is Extract<CoreAction, { type: "dev_execute" }> => a.type === "dev_execute",
  );

  const results = await Promise.all(
    filtered.map(async (action) => ({ action, result: await callDevEndpoint(projectId, action.capability, action.brief) })),
  );

  for (const { action, result } of results) {
    if (!result) {
      actionsTaken.push({ type: "dev_execute", capability: action.capability, devAssetId: "", hypothesisId: "", title: "(delegación fallida)" });
      continue;
    }
    actionsTaken.push({ type: "dev_execute", capability: action.capability, devAssetId: result.devAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: devCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, devAssetId: result.devAssetId, hypothesis: result.hypothesis });
  }

  return { actionsTaken, deliverables };
}

/** Executes every `design_execute` action in parallel. */
export async function executeDesignDelegations(
  projectId: string,
  actions: CoreAction[],
): Promise<{ actionsTaken: ActionTaken[]; deliverables: DesignDeliverable[] }> {
  const actionsTaken: ActionTaken[] = [];
  const deliverables: DesignDeliverable[] = [];

  const filtered = actions.filter(
    (a): a is Extract<CoreAction, { type: "design_execute" }> => a.type === "design_execute",
  );

  const results = await Promise.all(
    filtered.map(async (action) => ({ action, result: await callDesignEndpoint(projectId, action.capability, action.brief) })),
  );

  for (const { action, result } of results) {
    if (!result) {
      actionsTaken.push({ type: "design_execute", capability: action.capability, designAssetId: "", hypothesisId: "", title: "(delegación fallida)" });
      continue;
    }
    actionsTaken.push({ type: "design_execute", capability: action.capability, designAssetId: result.designAssetId, hypothesisId: result.hypothesisId, title: result.title });
    deliverables.push({ capability: action.capability, capabilityLabel: designCapabilityLabel(action.capability), title: result.title, content: result.content, hypothesisId: result.hypothesisId, designAssetId: result.designAssetId, hypothesis: result.hypothesis });
  }

  return { actionsTaken, deliverables };
}
