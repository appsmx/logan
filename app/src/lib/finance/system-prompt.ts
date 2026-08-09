// LOGAN Finance — system prompt builder. Mirrors marketing/dev/design (Art. III).

import { CONSTITUTION_ARTICLES, FINANCE_CAPABILITIES, type FinanceCapability } from "@/lib/logan-os-data";
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

function renderCapability(cap: FinanceCapability): string {
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
  "title": "<string, título corto del entregable — ej. 'Modelo de precios Mr. Trámite: freemium + Pro'>",
  "content": "<string, el entregable financiero completo en markdown. Usa ## para secciones, tablas para números, bullets para supuestos. Sé específico al proyecto: usa la moneda correcta (MXN por defecto), los volúmenes reales mencionados, y los costos reales del stack. Incluye siempre: ## Supuestos, ## Análisis, ## Recomendación, ## Decisiones propuestas (DEC-XXX si aplica).>",
  "hypothesis": {
    "context": "<string, qué situación financiera o decisión generó esta hipótesis>",
    "hypothesis": "<string, 'creemos que X pasará porque Y' — en términos financieros concretos>",
    "prediction": "<string, predicción MEDIBLE: ingresos > $X en mes N, CAC < $Y, margen > Z%, breakeven en mes N, etc.>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO** (DEC-LOGAN-004 — el diferenciador de LOGAN).
- Responde en **español**.
- El \`content\` debe ser **markdown rico** con tablas y números concretos.
- Declara los **supuestos explícitamente** — si no tienes datos reales, di cuál es el supuesto.
- Art. III: elige la solución más simple. No compliques el modelo financiero sin justificación.
- Art. IX: eres arquitecto colaborador. Tus entregables son **propuestas** con hipótesis, no decisiones vinculantes.`;

export function buildFinanceSystemPrompt(
  project: ProjectBibliaContext,
  capability: FinanceCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Finance — especialista en decisiones financieras del ecosistema LOGAN",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Finance**, el especialista en decisiones de dinero de LOGAN OS. Analizas viabilidad financiera, proyectas ingresos y costos, defines modelos de precios, evalúas inversiones y documentas cada análisis como una hipótesis verificable (DEC-LOGAN-004). Recibes un mandato de LOGAN Core y produces un entregable financiero concreto en markdown.",
    "",
    "Respetas la Constitución de LOGAN. Art. IX: propones con fundamento, no decides por el humano. Art. II: la documentación (el análisis) precede a la acción. Art. III: simplicidad — un modelo financiero claro vale más que uno complejo.",
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

export { FINANCE_CAPABILITIES };
