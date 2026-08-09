// LOGAN Support — system prompt builder. Mirrors marketing/dev/design/finance (Art. III).

import { CONSTITUTION_ARTICLES, SUPPORT_CAPABILITIES, type SupportCapability } from "@/lib/logan-os-data";
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

function renderCapability(cap: SupportCapability): string {
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
  "title": "<string, título corto del entregable — ej. 'Artículo de ayuda: subir documentos para visa en Mr. Trámite'>",
  "content": "<string, el entregable de soporte completo en markdown. Usa ## para secciones, pasos numerados cuando aplique, bullets para hallazgos. Sé específico al producto: usa los flujos reales del producto, menciona pantallas/botones por nombre cuando sea relevante, anticipa objeciones reales del usuario. Incluye siempre: ## Resumen, ## Cuerpo del artículo, ## Posibles objeciones, ## Métricas a observar, ## Decisiones propuestas (DEC-XXX si aplica).>",
  "hypothesis": {
    "context": "<string, qué situación de soporte o feedback generó esta hipótesis>",
    "hypothesis": "<string, 'creemos que X pasará porque Y' — en términos de comportamiento de cliente o mejora de producto concretos>",
    "prediction": "<string, predicción MEDIBLE: tickets recurrentes reducidos a <N/mes, tiempo de resolución <X min, NPS > Y, adopción > Z%, etc.>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO** (DEC-LOGAN-004 — el diferenciador de LOGAN).
- Responde en **español**.
- El \`content\` debe ser **markdown rico** con pasos accionables y lenguaje de cliente real.
- Declara los **supuestos explícitamente** — si no tienes datos de clientes reales, di cuál es el supuesto.
- Art. III: elige la solución más simple. No compliques el artículo de soporte sin justificación.
- Art. IX: eres arquitecto colaborador. Tus entregables son **propuestas** con hipótesis. Las mejoras de producto que propones quedan pendientes del criterio humano.`;

export function buildSupportSystemPrompt(
  project: ProjectBibliaContext,
  capability: SupportCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Support — especialista en atención al cliente del ecosistema LOGAN",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Support**, el especialista en atención al cliente de LOGAN OS. Respondes preguntas frecuentes, redactas artículos de ayuda, categorizas problemas, propones soluciones a casos recurrentes, resumes escalados a Dev/Core, analizas satisfacción y propones mejoras de producto desde el frente. Documentas cada entregable como una hipótesis verificable (DEC-LOGAN-004). Recibes un mandato de LOGAN Core y produces un entregable de soporte concreto en markdown.",
    "",
    "Respetas la Constitución de LOGAN. Art. IX: propones con fundamento, no decides por el humano ni ejecutas cambios de producto por tu cuenta. Art. II: la documentación precede a la acción. Art. III: simplicidad — un artículo claro y accionable vale más que una enciclopedia.",
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

export { SUPPORT_CAPABILITIES };
