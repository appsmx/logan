// LOGAN Core — auto-generated Memory Report.
//
// Per DEC-LOGAN user choice (a): the "Memory Report" Core reads each turn is
// produced by a deterministic backend function (no LLM call). It summarizes the
// current state of the project from the DB so Core can decide with context
// without re-reading the entire history.
//
// Task 29: the Memory Report now ALSO includes the live state of the project's
// GitHub repo (last commits, changed files, branches, PRs). The repo is the
// single source of truth for code (Art. IV); Memory reads it via
// `fetchRepoState()` so Core sees real git state, not just what's in the BD.
// Read-only — Memory never modifies repos (Art. III — simplicidad).

import { db } from "@/lib/db";
import { fetchRepoState, formatRepoStateForReport } from "@/lib/core/memory-git";

function parseUsers(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function trimExcerpt(text: string, max = 140): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

const PHASE_NAMES: Record<number, string> = {
  1: "Comprender el problema",
  2: "Descubrir información faltante",
  3: "Diseñar la arquitectura",
  4: "Documentar decisiones",
  5: "Construir",
  6: "Auditar",
  7: "Aprender",
  8: "Actualizando documentos",
};

const MODE_LABELS: Record<string, string> = {
  exploracion: "Exploración",
  arquitectura: "Arquitectura",
  construccion: "Construcción",
  auditoria: "Auditoría",
  evolucion: "Evolución",
};

/**
 * Builds the Markdown memory report Core reads at the start of each turn.
 *
 * Order of sections (per §14 + DEC-LOGAN memory.prepare (a)):
 *  1. Project — name, vision, status, current phase, current mode, users.
 *  2. Last 5 Decisions (decId, title, status, roleId, date) — most recent first.
 *  3. Last 5 Hypotheses (roleId, hypothesis excerpt, status, date) — most recent first.
 *  4. Backlog items count by status.
 *  5. Latest SessionContext (if any) — advance + pending + nextObjective.
 *  6. Phase progress summary (which phases are completada).
 *
 * Returns the full Markdown string starting with the section heading.
 */
export async function buildMemoryReport(projectId: string): Promise<string> {
  // Step 1: get the project first. We need `project.repo` to know whether to
  // fire the GitHub fetch. This is 1 DB call (~1ms) — the cost is negligible.
  const project = await db.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return [
      "## Reporte de Memory (auto-generado)",
      "",
      "> No se encontró el proyecto. Esta condición debería haberse validado antes.",
    ].join("\n");
  }

  // Step 2: in parallel — run the 5 BD queries AND the GitHub repo-state
  // fetch (if the project has a repo configured). fetchRepoState itself does
  // 4 parallel API calls + a small second wave for branch tips and per-commit
  // file lists, so it completes in ~1-3s. Running it in parallel with the BD
  // queries hides most of that latency.
  const [decisions, hypotheses, backlogCounts, latestSession, phaseProgress, repoState] = await Promise.all([
    db.decision.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.hypothesis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.backlogItem.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true },
    }),
    db.sessionContext.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    }),
    db.phaseProgress.findMany({
      where: { projectId },
      orderBy: { phase: "asc" },
    }),
    project.repo ? fetchRepoState(project.repo) : Promise.resolve(null),
  ]);

  const lines: string[] = [];
  lines.push("## Reporte de Memory (auto-generado)");

  // 1. Project
  const users = parseUsers(project.users);
  lines.push("");
  lines.push("### Proyecto");
  lines.push(`- **Nombre:** ${project.name}`);
  lines.push(`- **Estado:** ${project.status}`);
  lines.push(
    `- **Fase actual:** Fase ${project.currentPhase} — ${PHASE_NAMES[project.currentPhase] ?? "(desconocida)"}`,
  );
  lines.push(
    `- **Modo de trabajo:** ${MODE_LABELS[project.currentMode] ?? project.currentMode}`,
  );
  if (users.length > 0) {
    lines.push(`- **Usuarios / audiencia:** ${users.map((u) => `"${u}"`).join(", ")}`);
  } else {
    lines.push("- **Usuarios / audiencia:** (sin definir todavía)");
  }
  if (project.vision && project.vision.trim().length > 0) {
    lines.push(`- **Visión:** ${trimExcerpt(project.vision, 220)}`);
  }

  // 2. Last 5 decisions
  lines.push("");
  lines.push("### Últimas decisiones registradas");
  if (decisions.length === 0) {
    lines.push("- (aún no hay decisiones registradas para este proyecto)");
  } else {
    for (const d of decisions) {
      lines.push(
        `- **${d.decId}** — ${d.title || "(sin título)"} · rol: ${d.roleId} · estado: ${d.status} · ${fmtDate(d.date ?? d.createdAt)}`,
      );
    }
  }

  // 3. Last 5 hypotheses
  lines.push("");
  lines.push("### Últimas hipótesis registradas");
  if (hypotheses.length === 0) {
    lines.push("- (aún no hay hipótesis registradas — el bucle de aprendizaje está vacío)");
  } else {
    for (const h of hypotheses) {
      lines.push(
        `- rol: ${h.roleId} · estado: ${h.status} · ${fmtDate(h.createdAt)} — "${trimExcerpt(h.hypothesis)}"`,
      );
    }
  }

  // 4. Backlog counts
  lines.push("");
  lines.push("### Backlog (items por estado)");
  if (backlogCounts.length === 0) {
    lines.push("- (backlog vacío)");
  } else {
    for (const g of backlogCounts) {
      lines.push(`- ${g.status}: ${g._count._all}`);
    }
  }

  // 5. Latest session context
  lines.push("");
  lines.push("### Último SESSION_CONTEXT");
  if (!latestSession) {
    lines.push("- (no hay SESSION_CONTEXT previo — esta es la primera sesión registrada)");
  } else {
    if (latestSession.advance) {
      lines.push(`- **Avance:** ${trimExcerpt(latestSession.advance, 220)}`);
    }
    if (latestSession.pending) {
      lines.push(`- **Pendientes:** ${trimExcerpt(latestSession.pending, 220)}`);
    }
    if (latestSession.nextObjective) {
      lines.push(`- **Próximo objetivo:** ${trimExcerpt(latestSession.nextObjective, 220)}`);
    }
    lines.push(`- **Generado el:** ${fmtDate(latestSession.createdAt)}`);
  }

  // 6. Phase progress
  lines.push("");
  lines.push("### Progreso del ciclo metodológico");
  if (phaseProgress.length === 0) {
    lines.push("- (sin datos de progreso por fase)");
  } else {
    const completedPhases = phaseProgress
      .filter((p) => p.status === "completada")
      .map((p) => p.phase)
      .sort((a, b) => a - b);
    const inProgress = phaseProgress
      .filter((p) => p.status === "en_progreso")
      .map((p) => p.phase)
      .sort((a, b) => a - b);
    if (completedPhases.length > 0) {
      lines.push(
        `- Fases completadas: ${completedPhases.map((n) => `F${n} (${PHASE_NAMES[n] ?? ""})`.trim()).join(", ")}`,
      );
    } else {
      lines.push("- Fases completadas: (ninguna)");
    }
    if (inProgress.length > 0) {
      lines.push(`- Fases en progreso: ${inProgress.map((n) => `F${n}`).join(", ")}`);
    }
  }

  // 7. Repo state (Task 29) — read-only GitHub snapshot of the project's repo.
  // Three cases:
  //   - project.repo set + fetchRepoState succeeded → append the 5 repo sections.
  //   - project.repo set + fetchRepoState returned null → graceful degradation
  //     note (the API failed or the repo is not in the allowed list).
  //   - project.repo NOT set → graceful note that no repo is configured.
  // The repo IS the source of truth for code (Art. IV). Memory reads it, never
  // modifies it (Art. III). If anything is confusing, Core elevates the
  // ambiguity to the human (Art. IX) instead of deciding.
  lines.push("");
  if (project.repo) {
    if (repoState) {
      lines.push(formatRepoStateForReport(repoState));
    } else {
      lines.push("## Estado del repositorio GitHub");
      lines.push("");
      lines.push(
        `(No se pudo acceder al repositorio \`${project.repo}\`. El proyecto tiene repo configurado, pero la API de GitHub falló o el repo no está en la lista de permitidos. Las secciones siguientes del reporte siguen siendo válidas.)`,
      );
    }
  } else {
    lines.push("## Estado del repositorio GitHub");
    lines.push("");
    lines.push(
      "(Este proyecto no tiene repositorio GitHub configurado. Si el usuario pide trabajo git, pregúntale qué repo debe usar antes de emitir cualquier acción.)",
    );
  }

  return lines.join("\n");
}
