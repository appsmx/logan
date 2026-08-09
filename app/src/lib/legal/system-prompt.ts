// LOGAN Legal — system prompt builder. Mirrors marketing/dev/design/finance (Art. III).

import { CONSTITUTION_ARTICLES, LEGAL_CAPABILITIES, type LegalCapability } from "@/lib/logan-os-data";
import type { ProjectBibliaContext } from "@/lib/core/types";

function parseUsers(raw: string): string[] {
  try { const v = JSON.parse(raw); if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string"); return []; }
  catch { return []; }
}

function renderConstitution(): string {
  const lines: string[] = ["## La Constitución de LOGAN (artículos relevantes)", ""];
  const relevant = [1, 2, 3, 6, 7, 9];
  for (const a of CONSTITUTION_ARTICLES.filter((a) => relevant.includes(a.numeral))) {
    lines.push(`### Artículo ${a.roman} — ${a.title}`, "", a.body, "");
  }
  return lines.join("\n");
}

function renderCapability(cap: LegalCapability): string {
  return [
    "## Tu capability específica de este turno",
    "",
    `- **Label:** ${cap.label}`,
    `- **Descripción:** ${cap.description}`,
    `- **Tipo de entregable que produces:** ${cap.producesAssetType}`,
    "",
    `Concéntrate en esta capability. Tu trabajo aquí es: ${cap.label.toLowerCase()}.`,
  ].join("\n");
}

function renderBiblia(project: ProjectBibliaContext): string {
  const users = parseUsers(project.users);
  const lines: string[] = ["## Tu proyecto activo", "", `- **Nombre:** ${project.name}`, `- **Estado:** ${project.status}`];
  if (users.length > 0) lines.push(`- **Usuarios / audiencia objetivo:** ${users.map((u) => `"${u}"`).join(", ")}`);
  else lines.push("- **Usuarios / audiencia objetivo:** (sin definir todavía)");
  lines.push("");
  if (project.vision?.trim()) lines.push("**Visión del proyecto:**", "", project.vision.trim());
  else lines.push("**Visión del proyecto:** *(sin definir)*");
  return lines.join("\n");
}

const RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON. El objeto tiene esta forma exacta:

\`\`\`
{
  "title": "<string, título corto del entregable — ej. 'Aviso de privacidad LFPDPPP — Mr. Trámite'>",
  "content": "<string, el entregable legal completo en markdown. Usa ## para secciones, cláusulas numeradas cuando aplique, bullets para supuestos. Sé específico al proyecto: usa el marco normativo correcto (LFPDPPP México, NOM-024, CFPC, etc.), los datos personales que el producto realmente recopila y la finalidad real. Incluye siempre: ## Marco normativo aplicable, ## Supuestos, ## Documento, ## Recomendaciones de cumplimiento, ## Decisiones propuestas (DEC-XXX si aplica).>",
  "hypothesis": {
    "context": "<string, qué situación legal o regulatoria generó esta hipótesis>",
    "hypothesis": "<string, 'creemos que X pasará porque Y' — en términos legales concretos>",
    "prediction": "<string, predicción MEDIBLE: incidentes legales = 0 en N meses, aprobación de cumplimiento por mes X, reducción de riesgo a nivel Y, etc.>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO** (DEC-LOGAN-004 — el diferenciador de LOGAN).
- Responde en **español**.
- El \`content\` debe ser **markdown rico** con cláusulas numeradas y referencias normativas concretas.
- Declara los **supuestos explícitamente** — si no tienes datos reales (jurisdicción, tipo de datos, régimen fiscal), di cuál es el supuesto.
- Art. III: elige la solución más simple. No compliques el documento legal sin justificación.
- Art. IX: eres arquitecto colaborador. Tus entregables son **propuestas** con hipótesis, no asesoría legal vinculante ni decisiones vinculantes. Recomienda siempre validación por abogado colegiado cuando sea material.`;

export function buildLegalSystemPrompt(
  project: ProjectBibliaContext,
  capability: LegalCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Legal — especialista en cumplimiento y riesgo legal del ecosistema LOGAN",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Legal**, el especialista en cumplimiento y riesgo legal de LOGAN OS. Redactas términos y condiciones, avisos de privacidad (LFPDPPP México), contratos, revisiones de cumplimiento, análisis de riesgo regulatorio y disclaimers. Documentas cada análisis como una hipótesis verificable (DEC-LOGAN-004). Recibes un mandato de LOGAN Core y produces un entregable legal concreto en markdown.",
    "",
    "Respetas la Constitución de LOGAN. Art. IX: propones con fundamento, no decides por el humano ni constituyes asesoría legal vinculante — siempre recomiendas validación por abogado colegiado. Art. II: la documentación precede a la acción. Art. III: simplicidad — un documento legal claro vale más que uno extenso y enredado.",
    "",
    renderConstitution(),
    "",
    renderBiblia(project),
    "",
    renderCapability(capability),
    "",
    "## El brief de Core",
    "",
    brief.trim(),
  ];

  if (contextualAssets?.length) {
    sections.push("", "## Activos contextuales (referencia)", "", ...contextualAssets.flatMap((a, i) => [`### Activo ${i + 1}`, "", a, ""]));
  }

  sections.push("", RESPONSE_FORMAT);
  return sections.join("\n");
}

export { LEGAL_CAPABILITIES };
