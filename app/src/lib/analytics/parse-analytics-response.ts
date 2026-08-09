// LOGAN Analytics — defensive parsers for both analytics endpoints.
// Same pattern as marketing/dev/design parsers (Art. III). Never throws.

import type {
  AnalyticsVerificationResponse,
  AnalyticsPatternsResponse,
  AnalyticsVerdict,
  AnalyticsHypothesis,
  AnalyticsLearning,
} from "@/lib/analytics/types";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) {
      const afterFence = trimmed.slice(firstNewline + 1).trim();
      if (afterFence.endsWith("```")) return afterFence.slice(0, -3).trim();
      return afterFence;
    }
    return trimmed.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function extractJsonObject(raw: string): string | null {
  const fenced = stripCodeFences(raw);
  try { JSON.parse(fenced); return fenced; } catch { /* continue */ }
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = fenced.slice(start, end + 1);
    try { JSON.parse(slice); return slice; } catch { return null; }
  }
  return null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  try { return String(value); } catch { return fallback; }
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function asHypothesis(value: unknown): AnalyticsHypothesis {
  const empty: AnalyticsHypothesis = { context: "", hypothesis: "", prediction: "" };
  if (!value || typeof value !== "object") return empty;
  const v = value as Record<string, unknown>;
  return {
    context: asString(v.context),
    hypothesis: asString(v.hypothesis),
    prediction: asString(v.prediction),
  };
}

function asLearning(value: unknown): AnalyticsLearning {
  const empty: AnalyticsLearning = { isUniversal: false, summary: "", recommendation: "" };
  if (!value || typeof value !== "object") return empty;
  const v = value as Record<string, unknown>;
  return {
    isUniversal: asBool(v.isUniversal),
    summary: asString(v.summary),
    recommendation: asString(v.recommendation),
  };
}

// ─── Verify parser ───────────────────────────────────────────────────────────

const FALLBACK_VERIFY_HYPOTHESIS: AnalyticsHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada para esta verificación.",
  hypothesis: "Creemos que documentar este resultado mejorará la precisión de hipótesis futuras del mismo rol.",
  prediction: "La siguiente hipótesis del rol responsable tendrá una predicción más conservadora y medible.",
};

const FALLBACK_LEARNING: AnalyticsLearning = {
  isUniversal: false,
  summary: "No se pudo extraer un aprendizaje estructurado de esta verificación.",
  recommendation: "Revisar la evidencia manualmente y actualizar la hipótesis.",
};

/**
 * Parses the LLM response for POST /api/analytics/verify.
 * Never throws. Returns a safe fallback on parse failure.
 */
export function parseVerifyResponse(rawText: string): AnalyticsVerificationResponse {
  const fallback: AnalyticsVerificationResponse = {
    verdict: "refutada",
    title: "Verificación de hipótesis",
    content: rawText.trim() || "(LOGAN Analytics no devolvió contenido.)",
    learning: FALLBACK_LEARNING,
    hypothesis: FALLBACK_VERIFY_HYPOTHESIS,
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;

  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;

  const obj = parsed as Record<string, unknown>;
  const rawVerdict = asString(obj.verdict).toLowerCase();
  const verdict: AnalyticsVerdict =
    rawVerdict === "verificada" ? "verificada" : "refutada";

  const title = asString(obj.title, "Verificación de hipótesis");
  const content = asString(obj.content, rawText.trim());
  const learning = asLearning(obj.learning);
  const hypothesis = asHypothesis(obj.hypothesis);

  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_VERIFY_HYPOTHESIS.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_VERIFY_HYPOTHESIS.prediction;
  if (!hypothesis.context) hypothesis.context = FALLBACK_VERIFY_HYPOTHESIS.context;
  if (!learning.summary) learning.summary = FALLBACK_LEARNING.summary;
  if (!learning.recommendation) learning.recommendation = FALLBACK_LEARNING.recommendation;

  return { verdict, title, content, learning, hypothesis };
}

// ─── Patterns parser ─────────────────────────────────────────────────────────

const FALLBACK_PATTERNS_HYPOTHESIS: AnalyticsHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada para este análisis de patrones.",
  hypothesis: "Creemos que revisar los patrones de hipótesis mejorará la calidad de decisiones futuras.",
  prediction: "La tasa de hipótesis verificadas aumentará en el siguiente ciclo de trabajo.",
};

/**
 * Parses the LLM response for POST /api/analytics/patterns.
 * Never throws. Returns a safe fallback on parse failure.
 */
export function parsePatternsResponse(rawText: string): AnalyticsPatternsResponse {
  const fallback: AnalyticsPatternsResponse = {
    title: "Análisis de patrones de hipótesis",
    content: rawText.trim() || "(LOGAN Analytics no devolvió contenido.)",
    topLearnings: [],
    universalCandidates: [],
    hypothesis: FALLBACK_PATTERNS_HYPOTHESIS,
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;

  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;

  const obj = parsed as Record<string, unknown>;
  const title = asString(obj.title, "Análisis de patrones de hipótesis");
  const content = asString(obj.content, rawText.trim());
  const topLearnings = asStringArray(obj.topLearnings);
  const universalCandidates = asStringArray(obj.universalCandidates);
  const hypothesis = asHypothesis(obj.hypothesis);

  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_PATTERNS_HYPOTHESIS.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_PATTERNS_HYPOTHESIS.prediction;
  if (!hypothesis.context) hypothesis.context = FALLBACK_PATTERNS_HYPOTHESIS.context;

  return { title, content, topLearnings, universalCandidates, hypothesis };
}
