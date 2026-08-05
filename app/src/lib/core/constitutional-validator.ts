// LOGAN Core — constitutional validator (second LLM pass).
//
// The differentiator of LOGAN OS is that Core must not violate its own
// Constitution. After Core produces its proposed `response`, we run a
// SECOND, shorter LLM call that checks the response against the 10 articles
// and returns a stricter verdict.
//
// This is the Art. VII / Art. IX operationalization:
// - If the validator approves, we trust Core's own check.
// - If the validator flags a violation, we OVERRIDE Core's check and APPEND
//   a clear note to the response. We never BLOCK (Art. IX — the human
//   decides). We always deliver the response, even if it disagrees with
//   one article; we just flag it loudly.
// - If the validator fails to parse, we trust Core's own check.
//
// Comments in English; user-facing notes in Spanish.

import ZAI from "z-ai-web-dev-sdk";

import { CONSTITUTION_ARTICLES } from "@/lib/logan-os-data";
import type { ConstitutionalCheck } from "@/lib/core/types";

const VALIDATOR_SYSTEM_PROMPT = `Eres el validador constitucional de LOGAN. Recibes una respuesta propuesta por LOGAN Core y los 10 artículos de la Constitución. Devuelves SOLO un JSON: {"approved": true|false, "violated_article": "<romano I-X o null>", "note": "<breve, máximo 2 frases>"}.

CÓMO DECIDIR — lee cuidadosamente:

- NO apruebes SOLO si la respuesta viola claramente un artículo. Ejemplos REALES de violación:
  - Art. II: la respuesta construye algo SIN documentación previa que lo justifique (no "menciona" documentación, sino que ACTÚA sin ella).
  - Art. III: la respuesta elige una solución compleja sin justificar por qué la simple es insuficiente.
  - Art. IV: la respuesta duplica información que ya vive en otro documento.
  - Art. I: la respuesta descarta conocimiento sin registrarlo.

- SÍ aprueba (NO son violaciones, aunque parezcan):
  - Art. IX: "la IA propone/decide/sugiere/dirige a especialistas" NO es violación. El Art. IX EXPLÍCITAMENTE dice "la IA actúa como arquitecto de proyecto: propone, estructura, documenta y construye". Proponer ≠ sustituir el criterio humano. Solo es violación si la respuesta AFIRMA que el humano queda fuera o que LOGAN decide en su lugar de forma vinculante.
  - Art. VII: una respuesta que propone no es "desacuerdo sin fundamento". El desacuerdo sin fundamento es ruido; proponer con justificación es lo que Art. VII protege.
  - Cualquier artículo donde la respuesta simplemente NO TOCA el tema. No inventes violaciones por omisión.

- Sé CONSERVADOR. Si dudas si es violación, APRUEBA. Es mejor un falso negativo que un falso positivo que confunde al usuario. El validador existe para atrapar violaciones GRAVES, no para nickelear cada frase.

- Solo reporta violated_article si approved=false. Si approved=true, violated_article debe ser null y note vacío.

No agregues texto fuera del JSON. No uses bloques de markdown.`;

function renderArticles(): string {
  const lines: string[] = ["# Los 10 artículos de la Constitución de LOGAN", ""];
  for (const a of CONSTITUTION_ARTICLES) {
    lines.push(`## Artículo ${a.roman} — ${a.title}`, "", a.body, "");
  }
  return lines.join("\n");
}

function stripFences(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("```")) {
    const nl = t.indexOf("\n");
    if (nl !== -1) {
      const after = t.slice(nl + 1).trim();
      if (after.endsWith("```")) return after.slice(0, -3).trim();
      return after;
    }
    return t.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  return t;
}

function extractJsonObject(raw: string): string | null {
  const fenced = stripFences(raw);
  try {
    JSON.parse(fenced);
    return fenced;
  } catch {
    // continue
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

/**
 * Runs the second LLM pass to validate the proposed response against the
 * Constitution. Never throws; on any failure returns `null` and the caller
 * trusts Core's own check.
 */
export async function validateConstitutional(
  proposedResponse: string,
): Promise<ConstitutionalCheck | null> {
  try {
    const zai = await ZAI.create();
    const userMessage =
      renderArticles() +
      "\n\n---\n\nRespuesta propuesta:\n" +
      (proposedResponse || "(respuesta vacía)");

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: VALIDATOR_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });

    const rawText = completion.choices[0]?.message?.content ?? "";
    if (!rawText) return null;

    const jsonSlice = extractJsonObject(rawText);
    if (!jsonSlice) return null;

    const parsed = JSON.parse(jsonSlice) as Record<string, unknown>;
    const approved =
      typeof parsed.approved === "boolean"
        ? parsed.approved
        : parsed.approved !== "false";
    const violated =
      typeof parsed.violated_article === "string" &&
      parsed.violated_article.length > 0
        ? parsed.violated_article
        : null;
    const note = typeof parsed.note === "string" ? parsed.note : "";
    return { approved, violated_article: violated, note };
  } catch {
    // The validator is best-effort. If the SDK fails, we trust Core's own
    // check (Core already self-validated in its response).
    return null;
  }
}
