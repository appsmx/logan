// LOGAN Analytics — system prompt builders.
//
// Two prompts: one for hypothesis verification, one for pattern analysis.
// Both follow the same structure as Marketing/Dev/Design (Art. III).

import { CONSTITUTION_ARTICLES } from "@/lib/logan-os-data";
import type { HypothesisSummary } from "@/lib/analytics/types";

function renderConstitutionShort(): string {
  const lines: string[] = ["## La Constitución de LOGAN (extracto relevante)", ""];
  const relevant = [1, 4, 7, 8, 9]; // Art. I, IV, VII, VIII, IX — most relevant for Analytics
  for (const a of CONSTITUTION_ARTICLES.filter((a) => relevant.includes(a.numeral))) {
    lines.push(`### Artículo ${a.roman} — ${a.title}`, "", a.body, "");
  }
  return lines.join("\n");
}

const VERIFY_RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON. El objeto tiene esta forma exacta:

\`\`\`
{
  "verdict": "<'verificada' | 'refutada'>",
  "title": "<string, título corto — ej. 'Verificación: CTR campaña Meta Mr. Trámite'>",
  "content": "<string, reporte completo en markdown. Secciones: ## Resultado, ## Evidencia evaluada, ## Análisis, ## Aprendizaje, ## Ajuste recomendado>",
  "learning": {
    "isUniversal": <boolean, true si este aprendizaje aplica a cualquier proyecto LOGAN — no solo a este>,
    "summary": "<string, qué se aprendió en una oración>",
    "recommendation": "<string, qué debería hacer diferente el rol responsable la próxima vez>"
  },
  "hypothesis": {
    "context": "<string, contexto de la verificación que acaba de ocurrir>",
    "hypothesis": "<string, creemos que documentar este resultado mejorará X porque Y>",
    "prediction": "<string, predicción medible sobre el comportamiento futuro del rol responsable>"
  }
}
\`\`\`

Reglas:
- \`verdict\` es OBLIGATORIO y solo puede ser \`"verificada"\` o \`"refutada"\`.
- Basa el veredicto ÚNICAMENTE en la evidencia proporcionada. No inventes datos.
- Si la evidencia es insuficiente para un veredicto claro, elige el más probable y explica la incertidumbre en \`content\`.
- \`learning.isUniversal\` = true solo si el aprendizaje beneficiaría a cualquier otro proyecto LOGAN, no solo a este.
- El campo \`hypothesis\` es OBLIGATORIO — Analytics también genera hipótesis sobre sus propios aprendizajes (DEC-LOGAN-004).
- Responde en **español**.`;

const PATTERNS_RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON. El objeto tiene esta forma exacta:

\`\`\`
{
  "title": "<string, título del análisis — ej. 'Análisis de patrones: Mr. Trámite (12 hipótesis)'>",
  "content": "<string, reporte completo en markdown. Secciones: ## Resumen ejecutivo, ## Patrones detectados, ## Hipótesis por rol, ## Tendencias de acierto/fallo, ## Recomendaciones, ## Candidatos a aprendizaje universal>",
  "topLearnings": ["<string>", "<string>", "<string>"],
  "universalCandidates": ["<string>"],
  "hypothesis": {
    "context": "<string, qué situación del proyecto generó este análisis>",
    "hypothesis": "<string, creemos que implementar estas recomendaciones mejorará X>",
    "prediction": "<string, predicción medible sobre el proyecto en los próximos N ciclos>"
  }
}
\`\`\`

Reglas:
- \`topLearnings\`: 3-5 aprendizajes clave, ordenados por impacto.
- \`universalCandidates\`: aprendizajes que deberían migrar a \`LOGAN.md\` (Art. VIII). Puede ser array vacío \`[]\`.
- El campo \`hypothesis\` es OBLIGATORIO.
- Responde en **español**.`;

/**
 * Builds the system prompt for POST /api/analytics/verify.
 */
export function buildVerifySystemPrompt(
  projectName: string,
  hypothesisContext: string,
  hypothesisText: string,
  prediction: string,
  roleId: string,
  outcome: string,
  evidence: string,
  brief?: string,
): string {
  return [
    "# LOGAN Analytics — especialista en verificación de hipótesis y aprendizaje",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Analytics**, el especialista que cierra el bucle de aprendizaje de LOGAN OS. Tu trabajo en este turno es verificar si una hipótesis específica se cumplió o no, basándote únicamente en la evidencia real proporcionada. Produces un veredicto (`verificada` o `refutada`), extraes el aprendizaje concreto, y generas tu propia hipótesis sobre cómo este resultado mejorará las decisiones futuras del rol responsable.",
    "",
    "Sin tu trabajo, las hipótesis se acumulan como 'pendiente' eternamente y LOGAN no aprende. Tú eres el mecanismo que convierte experiencia en conocimiento (Art. I + Art. VIII).",
    "",
    renderConstitutionShort(),
    "",
    "## Hipótesis a verificar",
    "",
    `- **Proyecto:** ${projectName}`,
    `- **Rol responsable:** ${roleId}`,
    `- **Contexto de la hipótesis:** ${hypothesisContext}`,
    `- **Hipótesis:** ${hypothesisText}`,
    `- **Predicción medible:** ${prediction}`,
    "",
    "## Evidencia real recibida",
    "",
    `- **Resultado (outcome):** ${outcome}`,
    `- **Evidencia:** ${evidence}`,
    ...(brief?.trim() ? ["", `- **Contexto adicional:** ${brief.trim()}`] : []),
    "",
    VERIFY_RESPONSE_FORMAT,
  ].join("\n");
}

/**
 * Builds the system prompt for POST /api/analytics/patterns.
 */
export function buildPatternsSystemPrompt(
  projectName: string,
  hypotheses: HypothesisSummary[],
  roleFilter?: string,
  statusFilter?: string,
): string {
  const total = hypotheses.length;
  const verified = hypotheses.filter((h) => h.status === "verificada").length;
  const refuted = hypotheses.filter((h) => h.status === "refutada").length;
  const pending = hypotheses.filter((h) => h.status === "pendiente").length;
  const inObs = hypotheses.filter((h) => h.status === "en_observacion").length;

  const hypothesesBlock = hypotheses.map((h, i) => [
    `### Hipótesis ${i + 1} [${h.roleId}] — ${h.status}`,
    `- **Hipótesis:** ${h.hypothesis}`,
    `- **Predicción:** ${h.prediction}`,
    h.outcome ? `- **Resultado real:** ${h.outcome}` : "- **Resultado real:** (no verificada aún)",
    h.verifiedAt ? `- **Verificada:** ${h.verifiedAt}` : "",
  ].filter(Boolean).join("\n")).join("\n\n");

  return [
    "# LOGAN Analytics — análisis de patrones de hipótesis",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Analytics**. En este turno analizas el conjunto completo de hipótesis de un proyecto para detectar patrones: qué tipos de decisiones tienden a cumplirse, cuáles fallan, y qué ajustes sistémicos mejorarían la calidad de las hipótesis futuras.",
    "",
    renderConstitutionShort(),
    "",
    "## Proyecto a analizar",
    "",
    `- **Nombre:** ${projectName}`,
    ...(roleFilter ? [`- **Filtro de rol:** ${roleFilter}`] : []),
    ...(statusFilter ? [`- **Filtro de estado:** ${statusFilter}`] : []),
    "",
    "## Resumen de hipótesis",
    "",
    `- Total: ${total} | Verificadas: ${verified} | Refutadas: ${refuted} | En observación: ${inObs} | Pendientes: ${pending}`,
    "",
    "## Hipótesis del proyecto",
    "",
    hypothesesBlock || "(No hay hipótesis en este proyecto todavía.)",
    "",
    PATTERNS_RESPONSE_FORMAT,
  ].join("\n");
}
