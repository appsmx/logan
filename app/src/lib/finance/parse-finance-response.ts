// LOGAN Finance — defensive parser. Same pattern as marketing/dev/design (Art. III).

import type { FinanceResponse, FinanceHypothesis } from "@/lib/finance/types";

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

function asHypothesis(v: unknown): FinanceHypothesis {
  const empty: FinanceHypothesis = { context: "", hypothesis: "", prediction: "" };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return { context: asString(o.context), hypothesis: asString(o.hypothesis), prediction: asString(o.prediction) };
}

const FALLBACK_HYP: FinanceHypothesis = {
  context: "El modelo no devolvió una hipótesis estructurada; placeholder para preservar DEC-LOGAN-004.",
  hypothesis: "Creemos que el análisis financiero propuesto mejorará la toma de decisiones de dinero del proyecto.",
  prediction: "La métrica financiera clave (ingresos, costos, margen) será medible cuando se implemente la recomendación.",
};

export function parseFinanceResponse(rawText: string): FinanceResponse {
  const fallback: FinanceResponse = {
    title: "Entregable financiero",
    content: rawText.trim() || "(LOGAN Finance no devolvió contenido.)",
    hypothesis: FALLBACK_HYP,
  };
  const jsonSlice = extractJsonObject(rawText);
  if (!jsonSlice) return fallback;
  let parsed: unknown;
  try { parsed = JSON.parse(jsonSlice); } catch { return fallback; }
  if (!parsed || typeof parsed !== "object") return fallback;
  const obj = parsed as Record<string, unknown>;
  const title = asString(obj.title, "Entregable financiero");
  const content = asString(obj.content, rawText.trim());
  const hypothesis = asHypothesis(obj.hypothesis);
  if (!hypothesis.hypothesis && !hypothesis.prediction) return { title, content, hypothesis: FALLBACK_HYP };
  if (!hypothesis.hypothesis) hypothesis.hypothesis = FALLBACK_HYP.hypothesis;
  if (!hypothesis.prediction) hypothesis.prediction = FALLBACK_HYP.prediction;
  if (!hypothesis.context) hypothesis.context = `Finance: ${title}`;
  return { title, content, hypothesis };
}
