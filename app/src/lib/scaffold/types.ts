// LOGAN Scaffolding — types.
//
// Task 28: gives LOGAN the ability to create a new product project end-to-end
// (repo + structure + Biblia + LOGAN connection).
//
// Art. III (simplicidad): one endpoint, four supporting functions, no
// over-engineering. Art. IV (única fuente de verdad): the new project's Biblia
// lives in the new repo, NOT in LOGAN — LOGAN just creates it. Art. IX
// (humano decide): scaffolding creates the STRUCTURE, the product owner fills
// the Biblia with real product details later.

/** Input shape for POST /api/scaffold. */
export type ScaffoldRequest = {
  /** Human-readable product name, e.g. "Ferretería Don Juan". */
  productName: string;
  /** Repo name + Biblia slug. Lowercase, hyphens only, 3-40 chars. */
  productSlug: string;
  /** Product vision (1-3 sentences). */
  vision: string;
  /** Target users (audience descriptions). */
  users: string[];
  /**
   * "create" → try to create a new GitHub repo via API.
   * "existing" → assume the repo already exists; just verify access + populate.
   */
  repoMode: "create" | "existing";
  /** Required when repoMode="existing". The repo name to use (under appsmx/). */
  repoName?: string;
};

/** Result of one file creation step (committed to the repo via Contents API). */
export type ScaffoldFileResult = {
  path: string;
  commitSha: string;
  created: boolean; // true = new file, false = updated
};

/** The success response shape. */
export type ScaffoldResult = {
  /** True when everything succeeded. */
  ok: true;
  /** The new LOGAN Project row ID. */
  projectId: string;
  /** The repo name actually used (under the configured owner). */
  repo: string;
  /** The full HTML URL of the repo on GitHub. */
  repoUrl: string;
  /** "created" = new repo via API; "existing" = used existing repo. */
  repoMode: "create" | "existing";
  /** Files written to the repo. */
  files: ScaffoldFileResult[];
  /** ID of the MemoryEntry created for the new project. */
  memoryEntryId: string;
  /** Friendly summary message in Spanish. */
  message: string;
};

/** The error response shape (HTTP 4xx/5xx). */
export type ScaffoldError = {
  ok: false;
  /** Machine-readable error code. */
  code:
    | "INVALID_INPUT"
    | "REPO_CREATE_FORBIDDEN"
    | "REPO_CREATE_FAILED"
    | "REPO_NOT_FOUND"
    | "REPO_NOT_ACCESSIBLE"
    | "REPO_NOT_ALLOWED"
    | "PROJECT_CREATE_FAILED"
    | "FILE_INIT_FAILED"
    | "MEMORY_ENTRY_FAILED";
  /** Human-readable Spanish error message. */
  error: string;
  /** Optional next-step hint for the user. */
  hint?: string;
};
