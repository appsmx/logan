// LOGAN Scaffolding — in-memory supplement to LOGAN_ALLOWED_REPOS.
//
// Problem: the env var `LOGAN_ALLOWED_REPOS` is read at process start and
// cannot be modified at runtime. When LOGAN scaffolds a new product repo, the
// git tools (src/lib/git/tools.ts) would refuse to operate on the new repo
// because it isn't in the env var — until the user edits `.env` and restarts.
//
// Solution (Art. III — the simplest that works): keep an in-memory Set of
// additional allowed repos. The scaffold endpoint calls `addAllowedRepo()` on
// success, and `isRepoAllowed()` in github-client.ts checks BOTH the env var
// AND this set.
//
// Trade-off (Art. III accepted): this list is reset on every serverless cold
// start. For a long-lived dev server (the current setup), this is fine — the
// user only needs the supplement to work until they restart with the new env
// var. For production, the user should add the repo to `.env` LOGAN_ALLOWED_REPOS
// after scaffolding.

/** In-memory supplement. Resets on cold-start. */
const extraAllowedRepos = new Set<string>();

/**
 * Adds a repo to the in-memory allowed list. Idempotent. Lowercased.
 * Called by the scaffold endpoint on success.
 */
export function addAllowedRepo(repo: string): void {
  const r = (repo || "").trim().toLowerCase();
  if (!r) return;
  // `logan` is ALWAYS forbidden — never allow it even via this hook.
  if (r === "logan") return;
  extraAllowedRepos.add(r);
}

/** Returns true if the repo was added at runtime via addAllowedRepo(). */
export function isExtraAllowedRepo(repo: string): boolean {
  const r = (repo || "").trim().toLowerCase();
  if (!r) return false;
  return extraAllowedRepos.has(r);
}

/** Returns the list of in-memory allowed repos (original case preserved as given). */
export function listExtraAllowedRepos(): string[] {
  return Array.from(extraAllowedRepos);
}
