// LOGAN Core — execute actions.
//
// Persists each action Core proposed in its structured JSON response. Returns
// an `actionsTaken` array with the IDs of the created DB rows. Each action is
// attempted independently: if one fails (DB error or invalid input), it is
// skipped and the rest still proceed — we never lose a valid action because a
// sibling failed (Art. III — simplicity; robustness over transactions).
//
// Etapa 3 (LOGAN Marketing): a new `marketing_execute` action delegates to
// the Marketing specialist endpoint (POST /api/marketing/execute). The
// specialist creates its own Hypothesis + MarketingAsset rows; Core just
// records the IDs in the `actionsTaken` array so the UI can render the badge.
// The Marketing deliverable's `content` is returned to the Core route which
// integrates it into the final user-facing response via a second LLM call.
//
// On any failure we log to console.error so the orchestrator can surface a
// degraded-mode warning. The LLM's response is never discarded because of a
// persistence failure (per the route spec).
//
// Comments in English.

import { db } from "@/lib/db";
import { MARKETING_CAPABILITIES } from "@/lib/logan-os-data";
import type { ActionTaken, CoreAction, MarketingDeliverable } from "@/lib/core/types";
import type { ConstitutionalCheck } from "@/lib/core/types";

async function nextDecId(projectId: string): Promise<string> {
  const count = await db.decision.count({ where: { projectId } });
  return `DEC-${String(count + 1).padStart(3, "0")}`;
}

function marketingAssetTypeFor(capabilityKey: string): string {
  const cap = MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey);
  if (cap && cap.producesAssetType) return cap.producesAssetType;
  return "improvement_proposal";
}

function marketingCapabilityLabel(capabilityKey: string): string {
  const cap = MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey);
  return cap?.label ?? capabilityKey;
}

/**
 * Calls the Marketing specialist endpoint internally (server-to-server fetch
 * within the same Next.js app). The specialist creates its own Hypothesis +
 * MarketingAsset rows. We return the deliverable so the Core route can
 * integrate it into the final user-facing response.
 */
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
      console.error(
        "[core] marketing_execute: endpoint returned",
        res.status,
        (err as { error?: string }).error || "",
      );
      return null;
    }
    const data = (await res.json()) as {
      marketingAssetId: string;
      hypothesisId: string;
      title: string;
      content: string;
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
    console.error(
      "[core] marketing_execute: fetch falló",
      "capability=",
      capability,
      (e as Error).message,
    );
    return null;
  }
}

async function executeOne(
  projectId: string,
  action: CoreAction,
  constitutional?: ConstitutionalCheck | null,
): Promise<ActionTaken | null> {
  try {
    if (action.type === "register_decision") {
      const decId = await nextDecId(projectId);
      // Ensure at least 2 alternatives (per LOGAN §5); if Core gave fewer, we
      // add a placeholder so the row is still valid.
      const alts =
        Array.isArray(action.alternatives) && action.alternatives.length >= 2
          ? action.alternatives.filter((x) => typeof x === "string" && x.length > 0)
          : [
              ...(action.alternatives || []).filter(
                (x) => typeof x === "string" && x.length > 0,
              ),
              "(no se consideraron alternativas explícitas)",
            ];

      // ART. IX OPERATIONALIZED IN THE PERSISTENCE LAYER:
      // If the constitutional validator flagged this turn as a violation,
      // we MUST NOT persist the decision as "aprobada". We downgrade it to
      // "propuesta" (pending human criterion) and append a visible note to
      // the justification. The human decides whether to approve, modify, or
      // discard (Art. IX — the human has the final word).
      //
      // Previously: this code persisted `action.status || "aprobada"`
      // unconditionally, which meant a Core turn that violated the
      // Constitution (e.g. "delete Art. IX") would be recorded as an
      // approved decision even when the validator flagged it. That bug
      // produced ghost DEC-XXX rows like the DEC-011 "Eliminación del
      // Artículo IX — aprobada" the user found in the published app.
      const wasFlagged = !!constitutional && constitutional.approved === false;
      const originalStatus = (action.status || "aprobada").trim();
      const finalStatus = wasFlagged ? "propuesta" : originalStatus;
      const originalJustification = action.justification || "";
      const justification = wasFlagged
        ? `${originalJustification}\n\n---\n⚠️ VALIDACIÓN CONSTITUCIONAL (Art. VII/IX): El validador flaggeó este turno como posible violación del Art. ${constitutional?.violated_article || "?"}. ${constitutional?.note || ""}\nEsta decisión queda como "propuesta" pendiente de tu criterio humano. Tú decides: aprobar, modificar o descartar.`
        : originalJustification;

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
      // LEGACY: Core improvising a marketing deliverable. Kept for backward
      // compat with responses that still use this action type. Etapa 3
      // routes this kind of work through `marketing_execute` instead.
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
      const assetType = marketingAssetTypeFor(action.capability);
      const asset = await db.marketingAsset.create({
        data: {
          projectId,
          type: assetType,
          title: action.title || "(sin título)",
          content: action.content || "",
          hypothesisId: hyp.id,
        },
      });
      return {
        type: "marketing_proposal",
        hypothesisId: hyp.id,
        marketingAssetId: asset.id,
      };
    }

    // marketing_execute is handled by `executeMarketingDelegations` (below)
    // because the route needs the full deliverable for the integration step,
    // not just the persisted IDs. We return null here so the legacy
    // `executeActions` flow (used by tests / callers that don't need
    // integration) skips it cleanly.
    return null;
  } catch (e) {
    console.error(
      "[core] execute-actions: fallo persistiendo acción",
      "type" in action ? action.type : "unknown",
      (e as Error).message,
    );
    return null;
  }
}

/**
 * Persists all NON-MARKETING actions for a project (register_decision,
 * register_hypothesis, legacy marketing_proposal). The new
 * `marketing_execute` actions are deliberately skipped here — they are
 * handled separately by `executeMarketingDelegations` so the route can
 * collect the deliverables for the integration LLM call.
 *
 * Art. IX operationalized: if `constitutional` is passed and the validator
 * flagged a violation, any `register_decision` action is persisted with
 * status "propuesta" (not "aprobada") and a visible note in the
 * justification. The human retains the final word.
 */
export async function executeActions(
  projectId: string,
  actions: CoreAction[],
  constitutional?: ConstitutionalCheck | null,
): Promise<ActionTaken[]> {
  const results: ActionTaken[] = [];
  for (const action of actions) {
    if (action.type === "marketing_execute") continue;
    const r = await executeOne(projectId, action, constitutional);
    if (r) results.push(r);
  }
  return results;
}

/**
 * Executes every `marketing_execute` action by calling the Marketing
 * specialist endpoint. Returns:
 *   - `actionsTaken`: the marketing_execute entries (with marketingAssetId +
 *     hypothesisId + title) for the UI badges.
 *   - `deliverables`: the full deliverables (title, content, hypothesis) for
 *     the Core integration LLM call.
 *
 * Failed delegations are logged and skipped — the rest still proceed. If a
 * delegation fails, we still return an entry in `actionsTaken` with empty
 * IDs so the UI can show the user that the delegation was attempted (Art. VII
 * — surface the failure).
 */
export async function executeMarketingDelegations(
  projectId: string,
  actions: CoreAction[],
): Promise<{
  actionsTaken: ActionTaken[];
  deliverables: MarketingDeliverable[];
}> {
  const actionsTaken: ActionTaken[] = [];
  const deliverables: MarketingDeliverable[] = [];

  const marketingActions = actions.filter(
    (a): a is Extract<CoreAction, { type: "marketing_execute" }> =>
      a.type === "marketing_execute",
  );

  // Parallelize the specialist calls — they're independent.
  const results = await Promise.all(
    marketingActions.map(async (action) => {
      const r = await callMarketingEndpoint(
        projectId,
        action.capability,
        action.brief,
      );
      return { action, result: r };
    }),
  );

  for (const { action, result } of results) {
    if (!result) {
      // Surface the failure to the user via the actions footer.
      actionsTaken.push({
        type: "marketing_execute",
        capability: action.capability,
        marketingAssetId: "",
        hypothesisId: "",
        title: "(delegación fallida)",
      });
      continue;
    }
    actionsTaken.push({
      type: "marketing_execute",
      capability: action.capability,
      marketingAssetId: result.marketingAssetId,
      hypothesisId: result.hypothesisId,
      title: result.title,
    });
    deliverables.push({
      capability: action.capability,
      capabilityLabel: marketingCapabilityLabel(action.capability),
      title: result.title,
      content: result.content,
      hypothesisId: result.hypothesisId,
      marketingAssetId: result.marketingAssetId,
      hypothesis: result.hypothesis,
    });
  }

  return { actionsTaken, deliverables };
}
