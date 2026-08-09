// LOGAN Support — defensive parser. Same pattern as marketing/dev/design/finance (Art. III).

import type { SupportResponse, SupportHypothesis } from "@/lib/support/types";

function stripCodeFences(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("```")) {
    const nl = t.indexOf("\n");
    if (nl !== -1) { const a = t.slice(nl + 1).trim(); if (a.endsWith("```")) return a.slice(0, -3).trim(); return a; }
    return t.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  return t;
}

function extractJsonObject(raw: string): string | null {
  const f = stripCodeFences(raw);
  try { JSON.parse(f); return f; } catch { /* continue */ }
  const s = f.indexOf("{"); const e = f.lastIndexOf("}");
  if (s !== -1 && e !== -1 && e > s) { const sl = f.slice(s, e + 1); try { JSON.parse(sl); return sl; } catch { return null; } }
  return null;
}

function asString(v: unknown, fb = ""): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return fb;
  try { return String(v); } catch { return fb; }
}

function asHypothesis(v: unknown): SupportHypothesis {
  const empty: SupportHypothesis = { context: "", hypothesis: "", prediction: "" };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return { context: asString(o.context), hypothesis: asString(o.hypothesis), prediction: asString(o.prediction) };
}

const FALLBACK_HYP: SupportHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada; placeholder para preservar DEC-LOGAN-004.",
  hypothesis: "Creemos que el artículo de soporte propuesto mejorará la experiencia y reducirá tickets recurrentes.",
  prediction: "La métrica de soporte clave (tickets, NPS, tiempo de resolución) será medible cuando se publique la recomendación.",
};

export function parseSupportResponse(rawText: string): SupportResponse {
  const fallback: SupportResponse = {
    title: "Entregable de soporte",
    content: rawText.trim() || "(LOGAN Support no devolvió contenido.)",
    hypothesis: FALLBACK_HYP,
  };
  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;
  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;
  const obj = parsed as Record<string, unknown>;
  const title = asString(obj.title, "Entregable de soporte");
  const content = asString(obj.content, rawText.trim());
  const hypothesis = asHypothesis(obj.hypothesis);
  if (!hypothesis.hypothesis && !hypothesis.prediction) return { title, content, hypothesis: FALLBACK_HYP };
  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_HYP.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_HYP.prediction;
  if (!hypothesis.context) hypothesis.context = `Support: ${title}`;
  return { title, content, hypothesis };
}
