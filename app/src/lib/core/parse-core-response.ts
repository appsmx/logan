// LOGAN Core — defensive parser for Core's structured JSON response.
//
// Core is told to respond with ONLY a single JSON object. In practice LLMs
// sometimes wrap the JSON in ```json ... ``` fences, prepend a stray sentence,
// or fail to produce valid JSON at all. This parser:
//
//   1. Strips whitespace and code fences.
//   2. Tries to locate the first { and last } to extract the JSON object.
//   3. Attempts JSON.parse on that slice.
//   4. If everything fails, falls back to a safe default: the whole raw text
//      becomes the `response`, no actions, a permissive constitutional check,
//      and an empty session_update. We never throw — the user always gets a
//      coherent answer (Art. III — simplicity + Art. IX — never silently
//      refuse to respond).
//
// Comments in English; user-facing fallback strings in Spanish.

import type {
  CoreAction,
  CoreResponse,
  ConstitutionalCheck,
  SessionUpdate,
} from "@/lib/core/types";

function stripCodeFences(raw: string): string {
  // Strip leading ```json or ``` and trailing ```.
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    // Remove opening fence (with optional language tag like "json").
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) {
      const afterFence = trimmed.slice(firstNewline + 1).trim();
      if (afterFence.endsWith("```")) {
        return afterFence.slice(0, -3).trim();
      }
      return afterFence;
    }
    // Single-line fence edge case: ```{...}```
    const inner = trimmed.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    return inner;
  }
  return trimmed;
}

function extractJsonObject(raw: string): string | null {
  const fenced = stripCodeFences(raw);
  // Try direct parse first.
  try {
    JSON.parse(fenced);
    return fenced;
  } catch {
    // Continue to brace matching.
  }
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = fenced.slice(start, end + 1);
    try {
      JSON.parse(slice);
      return slice;
    } catch {
      return null;
    }
  }
  return null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  try {
    return String(value);
  } catch {
    return fallback;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === "string" ? x : x === null || x === undefined ? "" : String(x)))
    .filter((x) => typeof x === "string" && x.length > 0);
}

function asConstitutionalCheck(value: unknown): ConstitutionalCheck {
  if (!value || typeof value !== "object") {
    return { approved: true, violated_article: null, note: "respuesta no estructurada" };
  }
  const v = value as Record<string, unknown>;
  const approved =
    typeof v.approved === "boolean" ? v.approved : v.approved !== "false";
  const violated =
    typeof v.violated_article === "string" && v.violated_article.length > 0
      ? v.violated_article
      : null;
  const note = asString(v.note, "");
  return { approved, violated_article: violated, note };
}

function asSessionUpdate(value: unknown): SessionUpdate {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const out: SessionUpdate = {};
  if (typeof v.advance === "string") out.advance = v.advance;
  if (typeof v.pending === "string") out.pending = v.pending;
  if (typeof v.nextObjective === "string") out.nextObjective = v.nextObjective;
  if (typeof v.risks === "string") out.risks = v.risks;
  return out;
}

function asActions(value: unknown): CoreAction[] {
  if (!Array.isArray(value)) return [];
  const out: CoreAction[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    const type = asString(a.type, "");
    if (type === "register_decision") {
      out.push({
        type: "register_decision",
        roleId: asString(a.roleId, "core"),
        title: asString(a.title),
        problem: asString(a.problem),
        alternatives: asStringArray(a.alternatives),
        decision: asString(a.decision),
        justification: asString(a.justification),
        consequences: asString(a.consequences),
        status: asString(a.status, "aprobada"),
      });
    } else if (type === "register_hypothesis") {
      out.push({
        type: "register_hypothesis",
        roleId: asString(a.roleId, "core"),
        context: asString(a.context),
        hypothesis: asString(a.hypothesis),
        prediction: asString(a.prediction),
      });
    } else if (type === "marketing_proposal") {
      out.push({
        type: "marketing_proposal",
        capability: asString(a.capability, ""),
        title: asString(a.title),
        content: asString(a.content),
        hypothesisContext: asString(a.hypothesisContext),
        hypothesis: asString(a.hypothesis),
        hypothesisPrediction: asString(a.hypothesisPrediction),
      });
    } else if (type === "marketing_execute") {
      out.push({
        type: "marketing_execute",
        capability: asString(a.capability, ""),
        brief: asString(a.brief),
      });
    } else if (type === "dev_execute") {
      out.push({ type: "dev_execute", capability: asString(a.capability, ""), brief: asString(a.brief) });
    } else if (type === "design_execute") {
      out.push({ type: "design_execute", capability: asString(a.capability, ""), brief: asString(a.brief) });
    } else if (type === "analytics_verify") {
      out.push({
        type: "analytics_verify",
        hypothesisId: asString(a.hypothesisId, ""),
        outcome: asString(a.outcome, ""),
        evidence: asString(a.evidence, ""),
        brief: asString(a.brief, "") || undefined,
      });
    } else if (type === "analytics_patterns") {
      out.push({
        type: "analytics_patterns",
        roleFilter: typeof a.roleFilter === "string" ? a.roleFilter : undefined,
        statusFilter: typeof a.statusFilter === "string" ? a.statusFilter : undefined,
        brief: asString(a.brief, "") || undefined,
      });
    } else if (type === "finance_execute") {
      out.push({ type: "finance_execute", capability: asString(a.capability, ""), brief: asString(a.brief) });
    } else if (type === "legal_execute") {
      out.push({ type: "legal_execute", capability: asString(a.capability, ""), brief: asString(a.brief) });
    } else if (type === "support_execute") {
      out.push({ type: "support_execute", capability: asString(a.capability, ""), brief: asString(a.brief) });
    } else if (type === "git_create_branch") {
      out.push({
        type: "git_create_branch",
        repo: asString(a.repo, ""),
        branchName: asString(a.branchName, ""),
        ...(typeof a.fromBranch === "string" && a.fromBranch.length > 0 ? { fromBranch: a.fromBranch } : {}),
      });
    } else if (type === "git_write_file") {
      out.push({
        type: "git_write_file",
        repo: asString(a.repo, ""),
        branch: asString(a.branch, ""),
        path: asString(a.path, ""),
        content: asString(a.content, ""),
        commitMessage: asString(a.commitMessage, ""),
      });
    } else if (type === "git_create_pr") {
      out.push({
        type: "git_create_pr",
        repo: asString(a.repo, ""),
        branch: asString(a.branch, ""),
        title: asString(a.title, ""),
        body: asString(a.body, ""),
        hypothesisContext: asString(a.hypothesisContext, ""),
        hypothesis: asString(a.hypothesis, ""),
        hypothesisPrediction: asString(a.hypothesisPrediction, ""),
      });
    } else if (type === "git_get_status") {
      out.push({ type: "git_get_status", repo: asString(a.repo, "") });
    }
    // Unknown action types are silently dropped (Art. III — simplicity).
  }
  return out;
}

/**
 * Parses Core's raw text response into the structured CoreResponse.
 *
 * Never throws. On parse failure, returns a safe fallback so the user still
 * gets the LLM's text in the `response` field.
 */
export function parseCoreResponse(rawText: string): CoreResponse {
  const fallback: CoreResponse = {
    response: rawText.trim(),
    actions: [],
    constitutional_check: {
      approved: true,
      violated_article: null,
      note: "respuesta no estructurada",
    },
    session_update: {},
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) {
    return fallback;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return fallback;
  }
  if (!parsed || typeof parsed !== "object") {
    return fallback;
  }
  const obj = parsed as Record<string, unknown>;

  const responseText = asString(obj.response, rawText.trim());

  return {
    response: responseText.length > 0 ? responseText : rawText.trim(),
    actions: asActions(obj.actions),
    constitutional_check: asConstitutionalCheck(obj.constitutional_check),
    session_update: asSessionUpdate(obj.session_update),
  };
}
