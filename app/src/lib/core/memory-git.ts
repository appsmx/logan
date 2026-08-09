// LOGAN Memory — git access layer.
//
// Task 29: upgrades the Memory role so it can fetch the actual state of a
// project's GitHub repository (last commits, changed files, branches, PRs)
// and surface it to Core as real context — not just what's in the BD.
//
// This module is READ-ONLY (Art. III — simplicidad). Memory NEVER modifies
// repos. It just observes them. The repo IS the source of truth for code
// (Art. IV); Memory reads it, doesn't duplicate it in the BD.
//
// Implementation:
//   - Uses `githubFetch()` from src/lib/git/github-client.ts (same auth as
//     the git tools — fine-grained PAT).
//   - `fetchRepoState(repo)` calls 4 endpoints in parallel (Promise.allSettled
//     so partial failures don't kill the whole fetch), then a second small
//     wave for branch commit-dates and per-commit file lists.
//   - `formatRepoStateForReport(state)` produces the 5 markdown sections
//     appended to the Memory Report.
//
// Graceful degradation: if any call fails, the corresponding section shows
// a "(no disponible)" note instead of crashing. If repo is null/empty/not
// allowed, fetchRepoState returns null (the report shows a "no repo" note).
//
// Rate limits: GitHub API allows 5000 requests/hour. The Memory Report is
// built once per Core turn — at most ~10-15 calls per turn. Well within limits.

import { githubFetch, getOwner, isRepoAllowed, repoPath } from "@/lib/git/github-client";

// ─── Public types ────────────────────────────────────────────────────────────

export type RepoCommit = {
  sha: string;
  message: string; // first line only (subject)
  date: string;    // ISO 8601
  author: string;
};

export type RepoFile = {
  path: string;
  status: string; // added | modified | removed | renamed
};

export type RepoBranch = {
  name: string;
  lastCommitDate: string; // ISO 8601
};

export type RepoPR = {
  number: number;
  title: string;
  author: string;
  branch: string; // head.ref
};

export type RepoState = {
  repo: string;
  defaultBranch: string;
  lastCommit: RepoCommit | null;
  totalCommits: number | null;
  recentCommits: RepoCommit[];        // up to 5
  recentFiles: RepoFile[];            // from last 3 commits, deduped
  activeBranches: RepoBranch[];       // non-main branches with their last commit date
  openPRs: RepoPR[];
  partialErrors: string[];            // human-readable notes about which calls failed
  fetchedAt: string;                  // ISO timestamp
};

// ─── Internal GitHub API types (only what we read) ──────────────────────────

type GitHubRepoMeta = {
  default_branch?: string;
  name?: string;
};

type GitHubCommitListItem = {
  sha: string;
  commit?: {
    message?: string;
    author?: { date?: string; name?: string };
    committer?: { date?: string; name?: string };
  };
  author?: { login?: string };
};

type GitHubCommitDetail = {
  sha: string;
  message?: string;
  files?: Array<{ filename?: string; status?: string }>;
  commit?: {
    author?: { date?: string; name?: string };
    committer?: { date?: string; name?: string };
  };
};

type GitHubBranch = {
  name: string;
  commit: { sha: string; url?: string };
};

type GitHubPull = {
  number: number;
  title?: string;
  head?: { ref?: string };
  user?: { login?: string };
};

// ─── Constants ───────────────────────────────────────────────────────────────

/** Branches we treat as "the default" — filtered out of the "active branches" list. */
const DEFAULT_BRANCH_NAMES = new Set(["main", "master", "prod", "production", "develop"]);

/** Cap on recentFiles to keep the report readable. */
const MAX_RECENT_FILES = 50;

/** Per-page for the commits list. We only show 5, but allow some headroom. */
const COMMITS_PER_PAGE = 5;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetches the current state of a GitHub repository via the REST API.
 *
 * Returns null if:
 *   - repo is null/empty
 *   - repo is not in the allowed list (LOGAN_ALLOWED_REPOS or the in-memory supplement)
 *   - the very first metadata call fails (404, network error, etc.)
 *
 * Otherwise returns a RepoState object. Partial failures (e.g. branches call
 * fails but commits succeed) are reflected as `partialErrors` strings and the
 * affected fields are empty arrays / nulls — the report degrades gracefully.
 *
 * Per Art. III (simplicidad): this is the simplest thing that gives Core real
 * repo context. Per Art. IV (única fuente de verdad): we read the repo, we
 * don't duplicate its content in the BD. Per Art. IX: Memory observes — it
 * doesn't decide what the changes mean, Core does.
 */
export async function fetchRepoState(repo: string): Promise<RepoState | null> {
  const r = (repo || "").trim();
  if (!r) return null;
  if (!isRepoAllowed(r)) return null;

  try {
    // Wave 1: 4 parallel calls. If the metadata call fails (404 etc), we
    // bail out and return null — there's no point fetching branches of a
    // repo that doesn't exist or isn't accessible.
    const [repoRes, commitsRes, branchesRes, pullsRes] = await Promise.allSettled([
      githubFetch<GitHubRepoMeta>(repoPath(r)),
      githubFetch<GitHubCommitListItem[]>(repoPath(r, `/commits?per_page=${COMMITS_PER_PAGE}`)),
      githubFetch<GitHubBranch[]>(repoPath(r, `/branches?per_page=100`)),
      githubFetch<GitHubPull[]>(repoPath(r, `/pulls?state=open&per_page=100`)),
    ]);

    if (repoRes.status !== "fulfilled" || !repoRes.value) {
      // The repo metadata call failed — this is the "hard fail" case.
      // Log it so it shows in dev.log; return null so the Memory Report shows
      // the "no repo access" note instead of garbage.
      const reason =
        repoRes.status === "rejected"
          ? repoRes.reason?.message || String(repoRes.reason)
          : "metadata vacía";
      console.error(`[memory-git] fetchRepoState(${r}): metadata falló — ${reason}`);
      return null;
    }

    const partialErrors: string[] = [];
    const defaultBranch = repoRes.value.default_branch || "main";

    // ── Recent commits ─────────────────────────────────────────────────────
    let recentCommits: RepoCommit[] = [];
    if (commitsRes.status === "fulfilled" && Array.isArray(commitsRes.value)) {
      recentCommits = commitsRes.value.map((c) => mapCommitListItem(c));
    } else {
      partialErrors.push("commits recientes no disponibles");
    }
    const lastCommit = recentCommits[0] || null;

    // ── Active branches (non-default) ──────────────────────────────────────
    let activeBranches: RepoBranch[] = [];
    if (branchesRes.status === "fulfilled" && Array.isArray(branchesRes.value)) {
      const nonDefault = branchesRes.value.filter(
        (b) => b?.name && !DEFAULT_BRANCH_NAMES.has(b.name),
      );
      if (nonDefault.length > 0) {
        // Wave 2a: fetch each branch's tip commit in parallel to get the date.
        const tipResults = await Promise.allSettled(
          nonDefault.map((b) =>
            b.commit?.sha
              ? githubFetch<GitHubCommitDetail>(
                  repoPath(r, `/commits/${encodeURIComponent(b.commit.sha)}`),
                )
              : Promise.reject(new Error("branch sin SHA")),
          ),
        );
        activeBranches = nonDefault
          .map((b, i) => {
            const res = tipResults[i];
            let date = "";
            if (res.status === "fulfilled" && res.value) {
              date =
                res.value.commit?.author?.date ||
                res.value.commit?.committer?.date ||
                "";
            }
            return { name: b.name, lastCommitDate: date };
          })
          .filter((b) => b.lastCommitDate); // drop branches where we couldn't get a date
        if (tipResults.some((t) => t.status === "rejected")) {
          partialErrors.push("algunas fechas de branch no disponibles");
        }
      }
    } else {
      partialErrors.push("branches no disponibles");
    }

    // ── Open PRs ────────────────────────────────────────────────────────────
    let openPRs: RepoPR[] = [];
    if (pullsRes.status === "fulfilled" && Array.isArray(pullsRes.value)) {
      openPRs = pullsRes.value.map((p) => ({
        number: p.number,
        title: p.title || "(sin título)",
        author: p.user?.login || "(desconocido)",
        branch: p.head?.ref || "",
      }));
    } else {
      partialErrors.push("PRs abiertos no disponibles");
    }

    // ── Total commits (Link header trick) ───────────────────────────────────
    let totalCommits: number | null = null;
    try {
      totalCommits = await fetchTotalCommits(r);
    } catch {
      partialErrors.push("conteo total de commits no disponible");
    }

    // ── Recent files (from last 3 commits) ─────────────────────────────────
    let recentFiles: RepoFile[] = [];
    const last3Shas = recentCommits.slice(0, 3).map((c) => c.sha).filter(Boolean);
    if (last3Shas.length > 0) {
      const fileResults = await Promise.allSettled(
        last3Shas.map((sha) =>
          githubFetch<GitHubCommitDetail>(
            repoPath(r, `/commits/${encodeURIComponent(sha)}`),
          ),
        ),
      );
      // Iterate in order — first commit wins on path collisions (it's the
      // most recent one and represents the latest state of the file).
      const seen = new Map<string, RepoFile>();
      for (const res of fileResults) {
        if (res.status !== "fulfilled" || !res.value?.files) continue;
        for (const f of res.value.files) {
          const filename = f?.filename;
          const status = f?.status || "modified";
          if (!filename) continue;
          if (!seen.has(filename)) {
            seen.set(filename, { path: filename, status });
          }
        }
      }
      recentFiles = Array.from(seen.values()).slice(0, MAX_RECENT_FILES);
      if (fileResults.some((t) => t.status === "rejected")) {
        partialErrors.push("algunos archivos recientes no disponibles");
      }
    }

    return {
      repo: r,
      defaultBranch,
      lastCommit,
      totalCommits,
      recentCommits,
      recentFiles,
      activeBranches,
      openPRs,
      partialErrors,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`[memory-git] fetchRepoState(${r}):`, (e as Error).message);
    return null;
  }
}

/**
 * Formats a RepoState as the 5 markdown sections that get appended to the
 * Memory Report:
 *
 *   ## Estado del repositorio GitHub
 *   ## Cambios recientes (últimos 5 commits)
 *   ## Archivos modificados recientemente
 *   ## Branches activos
 *   ## PRs abiertos
 *
 * Plus an optional note line at the end if any partial errors were detected.
 */
export function formatRepoStateForReport(state: RepoState): string {
  const lines: string[] = [];

  // 1. Repo metadata
  lines.push("## Estado del repositorio GitHub");
  lines.push("");
  lines.push(`- **Repositorio:** \`${state.repo}\``);
  lines.push(`- **Branch por defecto:** ${state.defaultBranch}`);
  if (state.lastCommit) {
    lines.push(
      `- **Último commit:** \`${state.lastCommit.sha.slice(0, 7)}\` — "${state.lastCommit.message}" (${fmtIsoDate(state.lastCommit.date)}, ${state.lastCommit.author})`,
    );
  } else {
    lines.push("- **Último commit:** (no disponible)");
  }
  if (state.totalCommits !== null) {
    lines.push(`- **Total de commits:** ${state.totalCommits}`);
  }

  // 2. Recent commits
  lines.push("");
  lines.push("## Cambios recientes (últimos 5 commits)");
  lines.push("");
  if (state.recentCommits.length === 0) {
    lines.push("- (sin commits disponibles)");
  } else {
    for (const c of state.recentCommits) {
      lines.push(
        `- \`${c.sha.slice(0, 7)}\` (${fmtIsoDate(c.date)}) ${c.author} — ${c.message}`,
      );
    }
  }

  // 3. Recent files
  lines.push("");
  lines.push("## Archivos modificados recientemente");
  lines.push("");
  if (state.recentFiles.length === 0) {
    lines.push("- (sin cambios de archivo detectados en los últimos 3 commits)");
  } else {
    for (const f of state.recentFiles) {
      lines.push(`- \`${f.path}\` (${f.status})`);
    }
  }

  // 4. Active branches
  lines.push("");
  lines.push("## Branches activos");
  lines.push("");
  if (state.activeBranches.length === 0) {
    lines.push("- (no hay branches activos fuera de main/master)");
  } else {
    for (const b of state.activeBranches) {
      lines.push(`- \`${b.name}\` — último commit ${fmtIsoDate(b.lastCommitDate)}`);
    }
  }

  // 5. Open PRs
  lines.push("");
  lines.push("## PRs abiertos");
  lines.push("");
  if (state.openPRs.length === 0) {
    lines.push("- (no hay PRs abiertos)");
  } else {
    for (const p of state.openPRs) {
      lines.push(
        `- #${p.number} "${p.title}" por ${p.author} desde \`${p.branch || "(sin branch)"}\``,
      );
    }
  }

  // Partial errors note (if any)
  if (state.partialErrors.length > 0) {
    lines.push("");
    lines.push(
      `> Nota: algunas llamadas a la API de GitHub fallaron (${state.partialErrors.join("; ")}). El resto del reporte sigue siendo válido — el humano decide cómo interpretarlo (Art. IX).`,
    );
  }

  return lines.join("\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapCommitListItem(c: GitHubCommitListItem): RepoCommit {
  const message = (c.commit?.message || "").split("\n")[0].trim() || "(sin mensaje)";
  const date =
    c.commit?.author?.date || c.commit?.committer?.date || "";
  const author =
    c.commit?.author?.name || c.author?.login || "(desconocido)";
  return { sha: c.sha || "", message, date, author };
}

function fmtIsoDate(iso: string): string {
  if (!iso) return "(sin fecha)";
  // The API returns ISO 8601 (e.g. "2026-08-09T14:23:11Z"). Slice to the date
  // part — avoids timezone ambiguity in the report.
  try {
    return iso.slice(0, 10);
  } catch {
    return iso;
  }
}

/**
 * Fetches the total commit count for a repo by reading the GitHub API Link
 * header on the /commits?per_page=1 response. The Link header's `rel="last"`
 * segment includes `&page=N` where N is the total number of pages, which
 * equals the total commit count when per_page=1.
 *
 * Returns null if the call fails, the Link header is absent (single page of
 * results), or the header doesn't match the expected pattern.
 */
async function fetchTotalCommits(repo: string): Promise<number | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const url = `https://api.github.com/repos/${getOwner()}/${encodeURIComponent(repo)}/commits?per_page=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }

  // The Link header appears only when there are multiple pages of results.
  // For repos with 0 or 1 commit, there's no Link header — fall back to
  // counting the items in the JSON body.
  const link = res.headers.get("link") || res.headers.get("Link");
  if (link) {
    // Example: <https://api.github.com/repositories/123/commits?per_page=1&page=42>; rel="last"
    const match = link.match(/page=(\d+)>;\s*rel="last"/);
    if (match) return parseInt(match[1], 10);
  }
  try {
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return null;
  }
}
