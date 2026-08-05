// LOGAN Marketing — defensive parser for the Marketing LLM response.
//
// Marketing responds with a single JSON object: { title, content, hypothesis }.
// In practice LLMs sometimes wrap that in ```json fences, add prose around it,
// or produce malformed JSON. This parser:
//
//   1. Strips whitespace and code fences.
//   2. Locates the first { and last } and tries JSON.parse on that slice.
//   3. On failure, falls back to a safe shape (raw text becomes the content,
//      a placeholder hypothesis is filled in so DEC-LOGAN-004 is never
//      violated at the persistence layer).
//
// Never throws — the caller always gets a usable MarketingResponse.

import type { MarketingResponse, MarketingHypothesis } from "@/lib/marketing/types";

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) {
      const afterFence = trimmed.slice(firstNewline + 1).trim();
      if (afterFence.endsWith("```")) {
        return afterFence.slice(0, -3).trim();
      }
      return afterFence;
    }
    return trimmed.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function extractJsonObject(raw: string): string | null {
  const fenced = stripCodeFences(raw);
  try {
    JSON.parse(fenced);
    return fenced;
  } catch {
    // continue to brace matching
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

function asHypothesis(value: unknown): MarketingHypothesis {
  const empty: MarketingHypothesis = {
    context: "",
    hypothesis: "",
    prediction: "",
  };
  if (!value || typeof value !== "object") return empty;
  const v = value as Record<string, unknown>;
  return {
    context: asString(v.context),
    hypothesis: asString(v.hypothesis),
    prediction: asString(v.prediction),
  };
}

/**
 * Parses the Marketing LLM raw text into a structured MarketingResponse.
 *
 * Never throws. On parse failure, returns a fallback where the raw text
 * becomes the `content` and a placeholder hypothesis is filled in (so the
 * differentiator is preserved even when the LLM misbehaves).
 */
export function parseMarketingResponse(rawText: string): MarketingResponse {
  const fallbackHypothesis: MarketingHypothesis = {
    context: "El modelo no devolvió una hipótesis estructurada; se rellena con un placeholder para no romper el bucle de aprendizaje (DEC-LOGAN-004).",
    hypothesis: "Creemos que el entregable propuesto mejorará la métrica objetivo porque está alineado con la audiencia y la propuesta de valor del proyecto.",
    prediction: "La métrica clave (CTR, conversión, leads, alcance) será medible cuando el usuario aplique el entregable.",
  };

  const fallback: MarketingResponse = {
    title: "Entregable de Marketing",
    content: rawText.trim() || "(El especialista de Marketing no devolvió contenido.)",
    hypothesis: fallbackHypothesis,
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return fallback;
  }
  if (!parsed || typeof parsed !== "object") return fallback;
  const obj = parsed as Record<string, unknown>;

  const title = asString(obj.title, "Entregable de Marketing");
  const content = asString(obj.content, rawText.trim());
  const hypothesis = asHypothesis(obj.hypothesis);

  // If the LLM omitted the hypothesis fields, fill them with safe placeholders
  // so DEC-LOGAN-004 (every Marketing deliverable carries a hypothesis) is
  // honored at the persistence layer even on malformed output.
  if (!hypothesis.hypothesis && !hypothesis.prediction) {
    return { title, content, hypothesis: fallbackHypothesis };
  }
  if (!hypothesis.hypothesis) {
    hypothesis.hypothesis = fallbackHypothesis.hypothesis;
  }
  if (!hypothesis.prediction) {
    hypothesis.prediction = fallbackHypothesis.prediction;
  }
  if (!hypothesis.context) {
    hypothesis.context = `Marketing: ${title}`;
  }

  return { title, content, hypothesis };
}
