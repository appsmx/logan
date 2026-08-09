// LOGAN git tools — thin GitHub REST API client.
//
// We use plain `fetch` (NOT z-ai-web-dev-sdk — git tools are deterministic
// API calls, not LLM tasks). The token is a Classic PAT with full repo
// access; the CODE-LEVEL limits enforced in tools.ts are what keep LOGAN
// inside the Constitution (DEC-LOGAN-014).
//
// Owner is configurable via LOGAN_GITHUB_OWNER (default "appsmx" — AppsMX).
// Allowed repos are configured via LOGAN_ALLOWED_REPOS (comma-separated).
//
// CRITICAL: `logan` repo is HARDCODED as never allowed, regardless of env
// config. LOGAN cannot modify its own methodology (Art. IX + Art. I).

const GITHUB_API = "https://api.github.com";

/** The `logan` repo is never allowed — LOGAN cannot modify its own methodology. */
const FORBIDDEN_REPOS = new Set(["logan"]);

/** Returns the configured GitHub owner (defaults to "appsmx"). */
export function getOwner(): string {
  return process.env.LOGAN_GITHUB_OWNER || "appsmx";
}

/** True if the repo is in LOGAN_ALLOWED_REPOS (and not the forbidden "logan" repo). */
export function isRepoAllowed(repo: string): boolean {
  const r = (repo || "").trim().toLowerCase();
  if (!r) return false;
  if (FORBIDDEN_REPOS.has(r)) return false; // hardcode — even if env has it
  const allowed = (process.env.LOGAN_ALLOWED_REPOS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(r);
}

/** Returns the list of allowed repos (human-readable, original case from env). */
export function listAllowedRepos(): string[] {
  return (process.env.LOGAN_ALLOWED_REPOS || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && !FORBIDDEN_REPOS.has(x.toLowerCase()));
}

/**
 * Wrapper around fetch for GitHub REST API. Adds Authorization, Accept, and
 * the X-GitHub-Api-Version header. Returns parsed JSON. Throws on non-2xx.
 *
 * Path is the part AFTER https://api.github.com (e.g. "/repos/appsmx/mrtramite/branches").
 */
export async function githubFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN no configurado");
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${GITHUB_API}${path}`, { ...options, headers });
  if (!res.ok) {
    let errMessage = res.statusText;
    try {
      const errBody = (await res.json()) as { message?: string };
      if (errBody?.message) errMessage = errBody.message;
    } catch {
      // ignore JSON parse errors — fall back to statusText
    }
    // Never include the token in error messages.
    throw new Error(`GitHub API ${res.status}: ${errMessage}`);
  }
  // 204 No Content (e.g. delete endpoints — we don't use these, but be safe).
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Path helpers (so callers don't repeat the owner prefix) ─────────────────

/** Builds the URL path for a repo-scoped resource: /repos/{owner}/{repo}{suffix}. */
export function repoPath(repo: string, suffix = ""): string {
  return `/repos/${getOwner()}/${repo}${suffix}`;
}
