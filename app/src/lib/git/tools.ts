// LOGAN git tools — the 4 tool implementations with safety checks.
//
// Safety invariants enforced HERE (the last line of defense before the GitHub
// API call). Core's system-prompt also instructs the LLM, but the LLM is not
// trusted to police itself — these checks are non-negotiable.
//
//   git_create_branch:
//     - branchName MUST start with feature/ | fix/ | docs/ | chore/ | refactor/
//     - repo MUST be in allowed list (LOGAN_ALLOWED_REPOS); `logan` NEVER.
//
//   git_write_file:
//     - branch MUST NOT be main | master | prod | production.
//     - repo MUST be in allowed list.
//     - path MUST NOT match a protected pattern (LOGAN.md, README.md,
//       .github/*, .env*, prisma/schema.prisma, os/*, vision/*, roles/*,
//       docs/SESSION_CONTEXT.md).
//     - commitMessage MUST start with conventional commit type.
//     - content MUST be a non-empty string.
//
//   git_create_pr:
//     - branch MUST NOT be main.
//     - repo MUST be in allowed list.
//     - title MUST start with conventional commit type.
//     - hypothesisContext, hypothesis, hypothesisPrediction MUST be non-empty
//       (DEC-LOGAN-004 — every PR carries a hypothesis).
//     - The body gets a standardized footer appended automatically.
//
//   git_get_status:
//     - repo MUST be in allowed list. Read-only.

import { githubFetch, getOwner, isRepoAllowed, repoPath } from "@/lib/git/github-client";
import type {
  GitCreateBranchInput, GitCreateBranchResult,
  GitCreatePrInput, GitCreatePrResult,
  GitGetStatusInput, GitGetStatusResult,
  GitWriteFileInput, GitWriteFileResult,
} from "@/lib/git/types";

// ─── Safety constants ────────────────────────────────────────────────────────

export const PROTECTED_PATHS = [
  /^LOGAN\.md$/i,
  /^README\.md$/i,
  /^\.github\/.*/,
  /^\.env.*/,
  /^prisma\/schema\.prisma$/i,
  /^os\/.*/,
  /^vision\/.*/,
  /^roles\/.*/,
  /^docs\/SESSION_CONTEXT\.md$/i,
];

export const PROTECTED_BRANCHES = ["main", "master", "prod", "production"];

export const ALLOWED_BRANCH_PREFIXES = ["feature/", "fix/", "docs/", "chore/", "refactor/"];

export const REQUIRED_COMMIT_PREFIXES = [
  "feat:", "fix:", "docs:", "chore:", "refactor:", "test:", "style:",
];

export function isPathProtected(path: string): boolean {
  if (typeof path !== "string" || path.length === 0) return true;
  return PROTECTED_PATHS.some((regex) => regex.test(path));
}

export function isBranchProtected(branch: string): boolean {
  return PROTECTED_BRANCHES.includes((branch || "").toLowerCase());
}

export function isBranchNameAllowed(branchName: string): boolean {
  return ALLOWED_BRANCH_PREFIXES.some((prefix) => branchName.startsWith(prefix));
}

export function isCommitMessageValid(message: string): boolean {
  return REQUIRED_COMMIT_PREFIXES.some((prefix) => message.startsWith(prefix));
}

// ─── Helpers for GitHub Contents API ────────────────────────────────────────

type GitHubRef = {
  ref: string;
  node_id: string;
  url: string;
  object: { sha: string; type: string; url: string };
};

type GitHubContentFile = {
  sha?: string;
  path?: string;
  content?: string;
  encoding?: string;
  type?: string;
};

type GitHubPull = {
  number: number;
  html_url: string;
  title: string;
  body: string | null;
  head: { ref: string; sha: string };
  base: { ref: string };
};

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author?: { date?: string };
    committer?: { date?: string };
  };
};

type GitHubBranch = { name: string; commit: { sha: string } };

// ─── Tool 1: git_create_branch ───────────────────────────────────────────────

export async function gitCreateBranch(input: GitCreateBranchInput): Promise<GitCreateBranchResult> {
  const repo = (input.repo || "").trim();
  const branchName = (input.branchName || "").trim();
  const fromBranch = (input.fromBranch || "main").trim();

  if (!isRepoAllowed(repo)) {
    throw new Error(
      `Repositorio "${repo}" no permitido. LOGAN solo puede modificar: ${listAllowedReposJoined()}.`,
    );
  }
  if (!branchName) throw new Error("branchName vacío.");
  if (!isBranchNameAllowed(branchName)) {
    throw new Error(
      `Nombre de branch inválido: "${branchName}". Debe empezar con uno de: ${ALLOWED_BRANCH_PREFIXES.join(", ")}.`,
    );
  }
  if (isBranchProtected(branchName)) {
    throw new Error(`No se puede crear un branch protegido: "${branchName}".`);
  }
  if (isBranchProtected(fromBranch) === false && fromBranch !== "main") {
    // Allow any source branch (e.g. feature/x from feature/y), but if user typed
    // a protected name as source, that's fine too. We just refuse if fromBranch
    // is empty. We do NOT require fromBranch to be "main" — branching off a
    // feature branch is sometimes legitimate.
  }

  // Get the SHA of the fromBranch.
  const fromRef = await githubFetch<GitHubRef>(
    repoPath(repo, `/git/refs/heads/${encodeURIComponent(fromBranch)}`),
  );
  const fromSha = fromRef?.object?.sha;
  if (!fromSha) {
    throw new Error(`No se encontró el branch origen "${fromBranch}" en ${repo}.`);
  }

  // Create the new branch ref.
  await githubFetch(repoPath(repo, `/git/refs`), {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: fromSha }),
  });

  return { branchName, sha: fromSha, repo };
}

// ─── Tool 2: git_write_file ──────────────────────────────────────────────────

export async function gitWriteFile(input: GitWriteFileInput): Promise<GitWriteFileResult> {
  const repo = (input.repo || "").trim();
  const branch = (input.branch || "").trim();
  const path = (input.path || "").trim();
  const content = input.content ?? "";
  const commitMessage = (input.commitMessage || "").trim();

  if (!isRepoAllowed(repo)) {
    throw new Error(
      `Repositorio "${repo}" no permitido. LOGAN solo puede modificar: ${listAllowedReposJoined()}.`,
    );
  }
  if (!branch) throw new Error("branch vacío.");
  if (isBranchProtected(branch)) {
    throw new Error(
      "No se permite escribir en branches protegidos. Crea un branch feature/ primero con git_create_branch.",
    );
  }
  if (!path) throw new Error("path vacío.");
  if (isPathProtected(path)) {
    throw new Error(`Path protegido por la Constitución. No se puede modificar: ${path}`);
  }
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("content vacío. LOGAN solo escribe archivos de texto no vacíos.");
  }
  if (!commitMessage) {
    throw new Error("commitMessage vacío.");
  }
  if (!isCommitMessageValid(commitMessage)) {
    throw new Error(
      `commitMessage inválido. Debe empezar con un tipo conventional commit: ${REQUIRED_COMMIT_PREFIXES.join(", ")}.`,
    );
  }

  // Check if file already exists (so we include its `sha` in the PUT).
  let existingSha: string | undefined;
  let updated = false;
  try {
    const existing = await githubFetch<GitHubContentFile>(
      repoPath(repo, `/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`),
    );
    if (existing?.sha) {
      existingSha = existing.sha;
      updated = true;
    }
  } catch {
    // 404 = file doesn't exist yet — that's fine, we'll create it.
  }

  const base64Content = Buffer.from(content, "utf-8").toString("base64");
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch,
  };
  if (existingSha) body.sha = existingSha;

  const result = await githubFetch<{ content?: { sha?: string }; commit?: { sha?: string } }>(
    repoPath(repo, `/contents/${encodeURIComponentPath(path)}`),
    { method: "PUT", body: JSON.stringify(body) },
  );
  const commitSha = result?.commit?.sha || result?.content?.sha || "";
  return { repo, branch, path, commitSha, updated };
}

// ─── Tool 3: git_create_pr ────────────────────────────────────────────────────

export async function gitCreatePr(input: GitCreatePrInput): Promise<GitCreatePrResult> {
  const repo = (input.repo || "").trim();
  const branch = (input.branch || "").trim();
  const title = (input.title || "").trim();
  const body = (input.body || "").trim();
  const hypothesisContext = (input.hypothesisContext || "").trim();
  const hypothesis = (input.hypothesis || "").trim();
  const hypothesisPrediction = (input.hypothesisPrediction || "").trim();

  if (!isRepoAllowed(repo)) {
    throw new Error(
      `Repositorio "${repo}" no permitido. LOGAN solo puede modificar: ${listAllowedReposJoined()}.`,
    );
  }
  if (!branch) throw new Error("branch vacío.");
  if (isBranchProtected(branch)) {
    throw new Error("No se puede abrir un PR desde un branch protegido (main/master/prod).");
  }
  if (!title) throw new Error("title vacío.");
  if (!isCommitMessageValid(title)) {
    throw new Error(
      `title inválido. Debe empezar con un tipo conventional commit: ${REQUIRED_COMMIT_PREFIXES.join(", ")}.`,
    );
  }
  if (!body) throw new Error("body vacío. El PR necesita descripción.");
  if (!hypothesisContext || !hypothesis || !hypothesisPrediction) {
    throw new Error(
      "Hipótesis incompleta. hypothesisContext, hypothesis y hypothesisPrediction son obligatorios (DEC-LOGAN-004).",
    );
  }

  const fullBody = buildPrBody(body, {
    hypothesisContext,
    hypothesis,
    hypothesisPrediction,
  });

  const pr = await githubFetch<GitHubPull>(repoPath(repo, `/pulls`), {
    method: "POST",
    body: JSON.stringify({ title, head: branch, base: "main", body: fullBody }),
  });
  if (!pr?.number || !pr?.html_url) {
    throw new Error("GitHub no devolvió número/URL del PR.");
  }
  // hypothesisId is set by the EXECUTOR (which persists the Hypothesis row).
  // We return a placeholder that the executor overrides.
  return {
    prNumber: pr.number,
    prUrl: pr.html_url,
    branch,
    repo,
    hypothesisId: "", // executor fills
  };
}

// ─── Tool 4: git_get_status ──────────────────────────────────────────────────

export async function gitGetStatus(input: GitGetStatusInput): Promise<GitGetStatusResult> {
  const repo = (input.repo || "").trim();
  if (!isRepoAllowed(repo)) {
    throw new Error(
      `Repositorio "${repo}" no permitido. LOGAN solo puede leer: ${listAllowedReposJoined()}.`,
    );
  }

  // 3 parallel read calls.
  const [branchesRes, pullsRes, commitRes] = await Promise.allSettled([
    githubFetch<GitHubBranch[]>(repoPath(repo, `/branches?per_page=100`)),
    githubFetch<GitHubPull[]>(repoPath(repo, `/pulls?state=open&per_page=100`)),
    githubFetch<GitHubCommit>(repoPath(repo, `/commits/main`)),
  ]);

  const branches = branchesRes.status === "fulfilled" && Array.isArray(branchesRes.value)
    ? branchesRes.value.map((b) => b.name)
    : [];
  const openPRs = pullsRes.status === "fulfilled" && Array.isArray(pullsRes.value)
    ? pullsRes.value.map((p) => ({ number: p.number, title: p.title, head: p.head?.ref ?? "" }))
    : [];
  const lastCommit = commitRes.status === "fulfilled" && commitRes.value
    ? {
        sha: commitRes.value.sha,
        message: commitRes.value.commit?.message ?? "",
        date: commitRes.value.commit?.author?.date || commitRes.value.commit?.committer?.date || "",
      }
    : null;

  return { repo, branches, openPRs, lastCommit };
}

// ─── PR body builder ─────────────────────────────────────────────────────────

function buildPrBody(
  userBody: string,
  hyp: { hypothesisContext: string; hypothesis: string; hypothesisPrediction: string },
): string {
  const footer = [
    "",
    "---",
    "",
    "## Hipótesis (DEC-LOGAN-004)",
    "",
    `- Contexto: ${hyp.hypothesisContext}`,
    `- Hipótesis: ${hyp.hypothesis}`,
    `- Predicción medible: ${hyp.hypothesisPrediction}`,
    "",
    "## Validación constitucional",
    "",
    "LOGAN generó este PR. Revisa que respete los 10 artículos antes de mergear (Art. IX — el humano decide).",
    "",
    "## Cómo verificar la hipótesis",
    "",
    "[pendiente — Analytics lo completará cuando exista]",
    "",
  ].join("\n");
  return `${userBody}${footer}`;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function listAllowedReposJoined(): string {
  const list = (process.env.LOGAN_ALLOWED_REPOS || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && x.toLowerCase() !== "logan");
  return list.length > 0 ? list.join(", ") : "(ninguno configurado)";
}

/**
 * Encodes a file path for use in the GitHub Contents API URL. The Contents
 * API takes the path as a path parameter (NOT query string), so slashes must
 * stay literal and only special characters in segment names need encoding.
 */
function encodeURIComponentPath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}
