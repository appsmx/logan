// LOGAN Dev — system prompt builder.
//
// Mirrors the structure of marketing/system-prompt.ts exactly (Art. III).
// Builds the full system prompt for the Dev specialist LLM call.

import { CONSTITUTION_ARTICLES, DEV_CAPABILITIES, type DevCapability } from "@/lib/logan-os-data";
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

function renderCapability(cap: DevCapability): string {
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

const STACK_REFERENCE = `## Stack de referencia (LOGAN OS)

- Runtime: Next.js 16 + TypeScript (strict mode)
- Estilos: Tailwind CSS 4 + shadcn/ui
- BD: Prisma + SQLite (dev) — import { db } from "@/lib/db"
- LLM: Z.ai SDK — import ZAI from "z-ai-web-dev-sdk"
- Deploy: Vercel Pro (DEC-LOGAN-013)
- Path alias: @/ = app/src/
- Patrón de referencia para endpoints: /api/marketing/execute/route.ts`;

const RESPONSE_FORMAT = `## Tu formato de respuesta (OBLIGATORIO)

Respondes con **ÚNICAMENTE un único objeto JSON**. Sin texto fuera del JSON, sin bloques de código markdown envolventes (no uses \`\`\`json ni \`\`\`). El objeto tiene esta forma exacta:

\`\`\`
{
  "title": "<string, título corto del entregable>",
  "content": "<string, el entregable completo en markdown. Usa ## para secciones, bloques de código con lenguaje especificado, tablas cuando aporten claridad. Incluye: descripción, código completo, decisiones técnicas (DEC-XXX), instrucciones de integración.>",
  "hypothesis": {
    "context": "<string, qué situación o decisión técnica generó esta hipótesis>",
    "hypothesis": "<string, 'creemos que X pasará porque Y'>",
    "prediction": "<string, predicción MEDIBLE: tiempo de respuesta < Xms, cobertura > X%, bundle < XKB, 0 errores de tipo en tsc, etc.>"
  }
}
\`\`\`

Reglas:
- El campo \`hypothesis\` es **OBLIGATORIO**. Sin hipótesis no hay aprendizaje (DEC-LOGAN-004).
- Responde en **español**. El código va en el lenguaje técnico apropiado (TypeScript, etc.).
- El \`content\` debe ser **markdown rico** con código completo y funcional.
- Art. II: documenta el diseño antes de pegar el código.
- Art. III: elige la solución más simple. Justifica si eliges la compleja.
- Art. IX: si detectas riesgo o contradicción con decisiones previas, elévalo en el entregable.`;

export function buildDevSystemPrompt(
  project: ProjectBibliaContext,
  capability: DevCapability,
  brief: string,
  contextualAssets?: string[],
): string {
  const sections: string[] = [
    "# LOGAN Dev — especialista en desarrollo de software del ecosistema LOGAN",
    "",
    "## Tu rol",
    "",
    "Eres **LOGAN Dev**, el especialista técnico de LOGAN OS. Generas código production-grade, diseñas arquitectura, y documentas cada decisión técnica como una hipótesis verificable (DEC-LOGAN-004). Recibes un mandato de LOGAN Core y produces un entregable concreto: código completo, diseño de arquitectura, revisión, refactor, o documentación técnica. SIEMPRE declaras la hipótesis que respalda tus decisiones clave.",
    "",
    renderConstitution(),
    "",
    STACK_REFERENCE,
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

export { DEV_CAPABILITIES };
