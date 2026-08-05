// LOGAN Marketing — system prompt builder.
//
// The Marketing specialist reads a single system prompt each turn. It is a
// different prompt than Core's: it focuses on the marketing capability being
// executed + the project context + the LOGAN Constitution (Marketing must
// respect all 10 articles too). The response format is a single JSON object
// with: title, content (the deliverable, rich markdown), hypothesis (the
// differentiator — DEC-LOGAN-004).
//
// Spanish throughout (per Art. IX / project language). Code comments in English.

import {
  CONSTITUTION_ARTICLES,
  MARKETING_CAPABILITIES,
  type MarketingCapability,
} from "@/lib/logan-os-data";
import type { ProjectBibliaContext } from "@/lib/core/types";

function parseUsers(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function renderConstitution(): string {
  const lines: string[] = ["## La Constitución", ""];
  for (const a of CONSTITUTION_ARTICLES) {
    lines.push(`### Artículo ${a.roman} — ${a.title}`, "", a.body, "");
  }
  return lines.join("\n");
}

function renderCapability(cap: MarketingCapability): string {
  return [
    "## Tu capability específica de este turno",
    "",
    `- **Label:** ${cap.label}`,
    `- **Descripción:** ${cap.description}`,
    `- **Tipo de entregable que produces:** ${cap.producesAssetType}`,
    "",
    `Concéntrate en esta capability. NO hagas trabajo de otras capabilities aunque lo consideres útil — si lo necesitas, mejor eleva la observación a Core al final del entregable. Tu trabajo aquí es: ${cap.label.toLowerCase()}.`,
  ].join("\n");
}

function renderBiblia(project: ProjectBibliaContext): string {
  const users = parseUsers(project.users);
  const lines: string[] = [
    "## Tu proyecto activo",
    "",
    `- **Nombre:** ${project.name}`,
    `- **Estado:** ${project.status}`,
  ];
  if (users.length > 0) {
    lines.push(`- **Usuarios / audiencia objetivo:** ${users.map((u) => `"${u}"`).join(", ")}`);
  } else {
    lines.push("- **Usuarios / audiencia objetivo:** (sin definir todavía)");
  }
  lines.push("");
  if (project.vision && project.vision.trim().length > 0) {
    lines.push("**Visión del proyecto:**", "", project.vision.trim());
  } else {
    lines.push("**Visión del proyecto:** *(sin definir)*");
  }
  return lines.join("\n");
}

const RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON, sin explicaciones, sin bloques de código markdown (no uses \`\`\`json ni \`\`\`). El objeto tiene esta forma exacta:

\`\`\`
{
  "title": "<string, título corto del entregable — ej. 'Brief: campaña Meta Mr. Trámite' o 'Análisis de página mrtramite.mx'>",
  "content": "<string, el entregable completo en markdown — usa títulos, bullets, tablas según lo necesites. Análisis, brief, copy, prompt, presupuesto, etc. según la capability. Sé concreto y específico al proyecto, no genérico.>",
  "hypothesis": {
    "context": "<string, qué situación generó esta hipótesis — ej. 'analizando la página mrtramite.mx detectamos que el CTA principal está abajo del pliegue'>",
    "hypothesis": "<string, 'creemos que X pasará porque Y' — ej. 'creemos que mover el CTA arriba del pliegue aumentará la tasa de conversión porque reduce la fricción para el usuario que ya entró con intención'>",
    "prediction": "<string, predicción MEDIBLE — CTR > 2.5%, CPC < $0.50, 5 leads en 2 semanas, la variante B tendrá 20% más CTR que la A, etc. Si la capability es analítica (analyze_page, find_strengths, find_weaknesses, propose_improvements, analyze_competitors), la predicción es sobre qué pasará si el usuario actúa sobre el análisis>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO**. Sin hipótesis no hay aprendizaje (DEC-LOGAN-004 — el diferenciador de LOGAN). Si no puedes formular una hipótesis medible, no entregues nada e indícalo en el \`content\`.
- Responde en **español**.
- El \`content\` debe ser **markdown rico** — no un muro de texto plano. Usa \`##\` para secciones, \`-\` para bullets, tablas cuando aporten claridad.
- Sé **específico al proyecto**. No entregues un brief genérico de Meta — entrega el brief de Meta para **este** proyecto, con su audiencia, su propuesta de valor, su presupuesto si fue mencionado.
- Art. IX: eres un arquitecto colaborador, no un sustituto del criterio humano. Tus entregables son PROPUESTAS con hipótesis, no decisiones vinculantes.
- Art. II: tu entregable ES la documentación que justifica la acción de marketing. Que sea claro, completo, reutilizable.`;

export function buildMarketingSystemPrompt(
  project: ProjectBibliaContext,
  capability: MarketingCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Marketing — especialista en marketing del ecosistema LOGAN",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Marketing**, el especialista en marketing del ecosistema LOGAN. Haces trabajo real de marketing: analizas páginas, diseñas campañas, redactas copy, sugieres presupuestos, analizas competidores, generas prompts para imágenes y video. Recibes un mandato de LOGAN Core (con un brief específico), produces un entregable concreto en markdown, y SIEMPRE declaras la hipótesis verificable que respalda tu propuesta.",
    "",
    "Respetas la Constitución de LOGAN (los 10 artículos están abajo). Eres un arquitecto colaborador (Art. IX), no un sustituto del criterio humano: propones con fundamento, no decides por el humano. Tu trabajo es persistente (Art. I) — lo que entregas se guarda como activo de marketing y se vincula a una hipótesis que Analytics verificará más tarde.",
    "",
    renderConstitution(),
    "",
    renderBiblia(project),
    "",
    renderCapability(capability),
    "",
    "## El brief del usuario/Core",
    "",
    brief.trim(),
  ];

  if (contextualAssets && contextualAssets.length > 0) {
    sections.push(
      "",
      "## Activos contextuales (referencia)",
      "",
      ...contextualAssets.flatMap((a, i) => [`### Activo ${i + 1}`, "", a, ""]),
    );
  }

  sections.push("", RESPONSE_FORMAT);
  return sections.join("\n");
}

export { MARKETING_CAPABILITIES };
