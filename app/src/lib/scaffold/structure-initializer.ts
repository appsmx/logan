// LOGAN Scaffolding — initializes the LOGAN structure in the new repo.
//
// Creates 4 files in the repo via the GitHub Contents API:
//   1. Biblia_<ProductSlug>.md — initial Biblia (vision, users, placeholders)
//   2. SESSION_CONTEXT.md     — initial temporal state
//   3. README.md              — product README referencing LOGAN
//   4. .gitignore             — standard Next.js gitignore
//
// IMPORTANT: we write directly to `main` because this is a FRESH repo (Art. III
// — the simplest thing that works for scaffolding). This bypasses the safety
// regex in src/lib/git/tools.ts (PROTECTED_PATHS) which is appropriate for
// post-init operations (where we never want to overwrite a product's README)
// but not for the initial scaffolding (where creating README.md IS the goal).
//
// We use githubFetch directly (not gitWriteFile) to avoid the path-protection
// rejection. The repo-creator already verified the repo exists + token has
// access, so direct commits to main on a fresh repo are safe and acceptable
// per the task spec.
//
// Per Art. IX: scaffolding creates STRUCTURE not CONTENT. The Biblia has
// placeholders for catalog/stack/decisions — the product owner fills them in
// later. LOGAN proposes, the human decides.

import { githubFetch, getOwner } from "@/lib/git/github-client";
import {
  generateBiblia,
  generateSessionContext,
  generateReadme,
  generateGitignore,
} from "./biblia-generator";
import type { ScaffoldFileResult, ScaffoldRequest } from "./types";

type GitHubContentFile = {
  sha?: string;
  path?: string;
};

type GitHubPutResult = {
  content?: { sha?: string };
  commit?: { sha?: string };
};

/** Encodes a file path for use in the GitHub Contents API URL. */
function encodeURIComponentPath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/**
 * Writes one file to the repo on the given branch via the Contents API PUT.
 * If the file already exists (rare on a fresh repo, but possible if the user
 * pre-created the repo with auto_init), includes its `sha` so it gets updated
 * instead of erroring out.
 */
async function writeOneFile(
  repo: string,
  branch: string,
  path: string,
  content: string,
  commitMessage: string,
): Promise<ScaffoldFileResult> {
  const owner = getOwner();

  // Check if file already exists (so we include its `sha` in the PUT).
  let existingSha: string | undefined;
  let created = true;
  try {
    const existing = await githubFetch<GitHubContentFile>(
      `/repos/${owner}/${encodeURIComponent(repo)}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`,
    );
    if (existing?.sha) {
      existingSha = existing.sha;
      created = false;
    }
  } catch {
    // 404 = file doesn't exist yet — fine, we'll create it.
  }

  const base64Content = Buffer.from(content, "utf-8").toString("base64");
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch,
  };
  if (existingSha) body.sha = existingSha;

  const result = await githubFetch<GitHubPutResult>(
    `/repos/${owner}/${encodeURIComponent(repo)}/contents/${encodeURIComponentPath(path)}`,
    { method: "PUT", body: JSON.stringify(body) },
  );

  const commitSha = result?.commit?.sha || result?.content?.sha || "";
  return { path, commitSha, created };
}

/**
 * Initializes the LOGAN structure in a freshly created (or verified) repo.
 * Writes 4 files on `main`: Biblia, SESSION_CONTEXT, README, .gitignore.
 *
 * Returns the list of created files. If any file fails, throws an Error with
 * the path + the GitHub error message; the caller (route layer) decides
 * whether to abort the whole scaffold or continue.
 */
export async function initializeStructure(
  repo: string,
  branch: string,
  req: ScaffoldRequest,
): Promise<ScaffoldFileResult[]> {
  const bibliaContent = generateBiblia(req);
  const sessionContent = generateSessionContext(req);
  const readmeContent = generateReadme(req);
  const gitignoreContent = generateGitignore();

  const files: ScaffoldFileResult[] = [];

  // Write files sequentially (the Contents API isn't transactional, and on a
  // fresh repo sequential writes avoid race conditions on the default branch).
  files.push(
    await writeOneFile(repo, branch, `Biblia_${req.productSlug}.md`, bibliaContent, "docs: biblia inicial del proyecto"),
  );
  files.push(
    await writeOneFile(repo, branch, "SESSION_CONTEXT.md", sessionContent, "docs: session_context inicial"),
  );
  files.push(
    await writeOneFile(repo, branch, "README.md", readmeContent, "docs: readme inicial con referencia LOGAN"),
  );
  files.push(
    await writeOneFile(repo, branch, ".gitignore", gitignoreContent, "chore: gitignore estándar Next.js"),
  );

  return files;
}
