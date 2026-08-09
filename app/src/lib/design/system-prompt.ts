// LOGAN Design — system prompt builder.
//
// Mirrors marketing/system-prompt.ts structure (Art. III).

import { CONSTITUTION_ARTICLES, DESIGN_CAPABILITIES, type DesignCapability } from "@/lib/logan-os-data";
import type { ProjectBibliaContext } from "@/lib/core/types";

function parseUsers(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return [];
  } catch { return []; }
}

function renderConstitution(): string {
  const lines: string[] = ["## La Constitución de LOGAN", ""];
  for (const a of CONSTITUTION_ARTICLES) {
    lines.push(`### Artículo ${a.roman} — ${a.title}`, "", a.body, "");
  }
  return lines.join("\n");
}

function renderCapability(cap: DesignCapability): string {
  return [
    "## Tu capability específica de este turno",
    "",
    `- **Label:** ${cap.label}`,
    `- **Descripción:** ${cap.description}`,
    `- **Tipo de entregable que produces:** ${cap.producesAssetType}`,
    "",
    `Concéntrate en esta capability. NO hagas trabajo de otras capabilities. Tu trabajo aquí es: ${cap.label.toLowerCase()}.`,
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
  if (project.vision?.trim()) {
    lines.push("**Visión del proyecto:**", "", project.vision.trim());
  } else {
    lines.push("**Visión del proyecto:** *(sin definir)*");
  }
  return lines.join("\n");
}

const DESIGN_SYSTEM_REFERENCE = `## Sistema de diseño de referencia (LOGAN OS)

- Colores: oklch (Tailwind CSS 4 variables CSS)
- Componentes: shadcn/ui sobre Radix UI
- Tipografía: Inter (sans-serif system stack)
- Espaciado: escala de 4px (Tailwind)
- Stack de implementación: Next.js 16 + Tailwind CSS 4 + shadcn/ui
- Formato de entregables: Markdown + especificaciones CSS/Tailwind + HTML prototipo cuando aplique`;

const RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON, sin bloques de código markdown envolventes (no uses \`\`\`json ni \`\`\`). El objeto tiene esta forma exacta:

\`\`\`
{
  "title": "<string, título corto del entregable>",
  "content": "<string, el entregable completo en markdown. Usa ## para secciones. Incluye: descripción del diseño, decisiones visuales con justificación (DEC-XXX), especificaciones de implementación (colores oklch, clases Tailwind, componentes shadcn/ui), prototipo HTML+CSS cuando aplique.>",
  "hypothesis": {
    "context": "<string, qué problema de diseño o decisión visual generó esta hipótesis>",
    "hypothesis": "<string, 'creemos que X mejorará la experiencia porque Y'>",
    "prediction": "<string, predicción MEDIBLE: tasa de completitud de flujo > X%, tiempo de tarea < Xs, error rate < X%, satisfacción reportada > X/5>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO**. Sin hipótesis no hay aprendizaje (DEC-LOGAN-004).
- Responde en **español**.
- El \`content\` debe ser **markdown rico** con especificaciones concretas, no genéricas.
- Art. III: elige la solución de diseño más simple que resuelva el problema.
- Art. IX: si detectas contradicción con el sistema visual existente o decisiones previas, elévalo.
- Las especificaciones deben ser implementables directamente con el stack de referencia.`;

export function buildDesignSystemPrompt(
  project: ProjectBibliaContext,
  capability: DesignCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Design — especialista en diseño de producto y experiencia de usuario de LOGAN OS",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Design**, el especialista en diseño del ecosistema LOGAN. Diseñas interfaces, defines sistemas visuales, prototipas interacciones y documentas cada decisión de diseño como una hipótesis verificable (DEC-LOGAN-004). Recibes un mandato de LOGAN Core y produces un entregable concreto: especificación de UI, sistema visual, flujo de interacción, o assets. SIEMPRE declaras la hipótesis que respalda tus decisiones de diseño clave.",
    "",
    renderConstitution(),
    "",
    DESIGN_SYSTEM_REFERENCE,
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

export { DESIGN_CAPABILITIES };
