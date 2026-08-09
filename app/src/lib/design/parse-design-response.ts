// LOGAN Design — defensive parser for the Design LLM response.
//
// Design responds with a single JSON object: { title, content, hypothesis }.
// Mirrors parse-marketing-response.ts exactly (Art. III — same pattern).
// Never throws.

import type { DesignResponse, DesignHypothesis } from "@/lib/design/types";

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

function asHypothesis(value: unknown): DesignHypothesis {
  const empty: DesignHypothesis = { context: "", hypothesis: "", prediction: "" };
  if (!value || typeof value !== "object") return empty;
  const v = value as Record<string, unknown>;
  return {
    context: asString(v.context),
    hypothesis: asString(v.hypothesis),
    prediction: asString(v.prediction),
  };
}

const FALLBACK_HYPOTHESIS: DesignHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada; se rellena con un placeholder para no romper el bucle de aprendizaje (DEC-LOGAN-004).",
  hypothesis: "Creemos que el entregable de diseño propuesto mejorará la experiencia del usuario porque sigue principios establecidos de usabilidad y el sistema visual del proyecto.",
  prediction: "La métrica de diseño clave (tasa de completitud de flujo, tiempo de tarea, error rate) será medible cuando el entregable se implemente.",
};

/**
 * Parses the Design LLM raw text into a structured DesignResponse.
 * Never throws. On failure returns a safe fallback that preserves DEC-LOGAN-004.
 */
export function parseDesignResponse(rawText: string): DesignResponse {
  const fallback: DesignResponse = {
    title: "Entregable de Design",
    content: rawText.trim() || "(LOGAN Design no devolvió contenido.)",
    hypothesis: FALLBACK_HYPOTHESIS,
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;

  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;

  const obj = parsed as Record<string, unknown>;
  const title = asString(obj.title, "Entregable de Design");
  const content = asString(obj.content, rawText.trim());
  const hypothesis = asHypothesis(obj.hypothesis);

  if (!hypothesis.hypothesis && !hypothesis.prediction) {
    return { title, content, hypothesis: FALLBACK_HYPOTHESIS };
  }
  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_HYPOTHESIS.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_HYPOTHESIS.prediction;
  if (!hypothesis.context) hypothesis.context = `Design: ${title}`;

  return { title, content, hypothesis };
}
