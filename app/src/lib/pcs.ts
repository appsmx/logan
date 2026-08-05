// PCS — Protocolo de Continuidad de Sesión.
// Builds the SESSION_CONTEXT.md from a form state + project + recent decisions.

import type { Decision, Project, SessionContext } from "@/lib/logan-types";
import { shortDate } from "@/lib/api";

export type PcsDraft = {
  status: string;
  advance: string;
  objectiveCompleted: string;
  decisionsTaken: string[];
  documentsUpdated: { doc: string; change: string }[];
  pending: string;
  risks: string;
  nextObjective: string;
  observations: string;
};

export function emptyPcsDraft(project?: Project | null): PcsDraft {
  return {
    status: project?.status ?? "En construcción",
    advance: "",
    objectiveCompleted: "",
    decisionsTaken: [],
    documentsUpdated: [],
    pending: "",
    risks: "",
    nextObjective: "",
    observations: "",
  };
}

export function buildSessionContextMarkdown(
  project: Project | null,
  draft: PcsDraft,
  recentDecisions: Decision[] = [],
  createdAt = new Date(),
): string {
  const lines: string[] = [];
  lines.push(`# SESSION_CONTEXT`);
  lines.push("");
  lines.push(`> Protocolo de Continuidad de Sesión (PCS) — LOGAN OS`);
  lines.push(`> Proyecto: **${project?.name ?? "—"}**`);
  lines.push(`> Generado: ${createdAt.toLocaleString("es-MX")}`);
  lines.push("");
  lines.push(`## Estado`);
  lines.push("");
  lines.push(`- **Estado del proyecto:** ${draft.status}`);
  if (project) {
    lines.push(`- **Fase actual:** ${project.currentPhase} / 8`);
    lines.push(`- **Modo de trabajo:** ${project.currentMode}`);
  }
  lines.push("");

  lines.push(`## Avance de la sesión`);
  lines.push("");
  lines.push(draft.advance || "—");
  lines.push("");

  lines.push(`## Objetivo completado`);
  lines.push("");
  lines.push(draft.objectiveCompleted || "—");
  lines.push("");

  lines.push(`## Decisiones tomadas`);
  lines.push("");
  if (draft.decisionsTaken.length > 0) {
    for (const d of draft.decisionsTaken) lines.push(`- ${d}`);
  } else {
    lines.push("_Ninguna decisión registrada en esta sesión._");
  }
  lines.push("");

  lines.push(`## Documentos actualizados`);
  lines.push("");
  if (draft.documentsUpdated.length > 0) {
    for (const doc of draft.documentsUpdated) {
      lines.push(`- **${doc.doc}** — ${doc.change}`);
    }
  } else {
    lines.push("_Ningún documento actualizado._");
  }
  lines.push("");

  lines.push(`## Pendientes`);
  lines.push("");
  lines.push(draft.pending || "—");
  lines.push("");

  lines.push(`## Riesgos`);
  lines.push("");
  lines.push(draft.risks || "—");
  lines.push("");

  lines.push(`## Próximo objetivo`);
  lines.push("");
  lines.push(draft.nextObjective || "—");
  lines.push("");

  lines.push(`## Observaciones`);
  lines.push("");
  lines.push(draft.observations || "—");
  lines.push("");

  // Decisiones recientes (referencia)
  if (recentDecisions.length > 0) {
    lines.push(`## Decisiones recientes del proyecto (referencia)`);
    lines.push("");
    for (const d of recentDecisions.slice(0, 8)) {
      lines.push(`- \`${d.decId}\` ${d.title} — ${shortDate(d.date)}`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`_Generado automáticamente por LOGAN OS · PCS_`);
  return lines.join("\n");
}

// Build a read-only markdown view of a previously persisted SessionContext.
export function sessionContextToMarkdown(s: SessionContext): string {
  const lines: string[] = [];
  lines.push(`# SESSION_CONTEXT`);
  lines.push("");
  lines.push(`> Generado: ${shortDate(s.createdAt)}`);
  lines.push("");
  lines.push(`## Estado`);
  lines.push("");
  lines.push(s.status || "—");
  lines.push("");
  lines.push(`## Avance`);
  lines.push("");
  lines.push(s.advance || "—");
  lines.push("");
  lines.push(`## Objetivo completado`);
  lines.push("");
  lines.push(s.objectiveCompleted || "—");
  lines.push("");
  lines.push(`## Decisiones tomadas`);
  lines.push("");
  if (s.decisionsTaken.length > 0) {
    for (const d of s.decisionsTaken) lines.push(`- ${d}`);
  } else {
    lines.push("_Ninguna._");
  }
  lines.push("");
  lines.push(`## Documentos actualizados`);
  lines.push("");
  if (s.documentsUpdated.length > 0) {
    for (const doc of s.documentsUpdated) {
      lines.push(`- **${doc.doc}** — ${doc.change}`);
    }
  } else {
    lines.push("_Ninguno._");
  }
  lines.push("");
  lines.push(`## Pendientes`);
  lines.push("");
  lines.push(s.pending || "—");
  lines.push("");
  lines.push(`## Riesgos`);
  lines.push("");
  lines.push(s.risks || "—");
  lines.push("");
  lines.push(`## Próximo objetivo`);
  lines.push("");
  lines.push(s.nextObjective || "—");
  lines.push("");
  lines.push(`## Observaciones`);
  lines.push("");
  lines.push(s.observations || "—");
  lines.push("");
  return lines.join("\n");
}
