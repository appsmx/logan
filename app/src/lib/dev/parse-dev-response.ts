// LOGAN Dev — defensive parser for the Dev LLM response.
//
// Dev responds with a single JSON object: { title, content, hypothesis }.
// Mirrors parse-marketing-response.ts exactly (Art. III — reuse the same
// pattern). Never throws — the caller always gets a usable DevResponse.

import type { DevResponse, DevHypothesis } from "@/lib/dev/types";

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

function asHypothesis(value: unknown): DevHypothesis {
  const empty: DevHypothesis = { context: "", hypothesis: "", prediction: "" };
  if (!value || typeof value !== "object") return empty;
  const v = value as Record<string, unknown>;
  return {
    context: asString(v.context),
    hypothesis: asString(v.hypothesis),
    prediction: asString(v.prediction),
  };
}

const FALLBACK_HYPOTHESIS: DevHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada; se rellena con un placeholder para no romper el bucle de aprendizaje (DEC-LOGAN-004).",
  hypothesis: "Creemos que el entregable técnico propuesto mejorará la calidad o velocidad del sistema porque sigue los patrones establecidos del stack LOGAN OS.",
  prediction: "La métrica técnica clave (tiempo de respuesta, cobertura de tests, errores de tipo) será medible cuando el entregable se integre.",
};

/**
 * Parses the Dev LLM raw text into a structured DevResponse.
 * Never throws. On failure returns a safe fallback that preserves DEC-LOGAN-004.
 */
export function parseDevResponse(rawText: string): DevResponse {
  const fallback: DevResponse = {
    title: "Entregable técnico de Dev",
    content: rawText.trim() || "(LOGAN Dev no devolvió contenido.)",
    hypothesis: FALLBACK_HYPOTHESIS,
  };

  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;

  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;

  const obj = parsed as Record<string, unknown>;
  const title = asString(obj.title, "Entregable técnico de Dev");
  const content = asString(obj.content, rawText.trim());
  const hypothesis = asHypothesis(obj.hypothesis);

  if (!hypothesis.hypothesis && !hypothesis.prediction) {
    return { title, content, hypothesis: FALLBACK_HYPOTHESIS };
  }
  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_HYPOTHESIS.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_HYPOTHESIS.prediction;
  if (!hypothesis.context) hypothesis.context = `Dev: ${title}`;

  return { title, content, hypothesis };
}
