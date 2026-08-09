// LOGAN git tools — shared types.
//
// Task 23: gives LOGAN Core the ability to create branches, write files, and
// open Pull Requests in GitHub repositories with strong safety guarantees
// (DEC-LOGAN-014 — code-level limits on what LOGAN can touch).
//
// 4 tools, no more (Art. III — simplicidad):
//   git_create_branch
//   git_write_file
//   git_create_pr
//   git_get_status
//
// LOGAN NEVER merges, NEVER force-pushes, NEVER deletes branches (Art. IX —
// the human decides).

/** Input shape for git_create_branch. */
export type GitCreateBranchInput = {
  repo: string;
  branchName: string;
  fromBranch?: string; // defaults to "main"
};

/** Input shape for git_write_file. */
export type GitWriteFileInput = {
  repo: string;
  branch: string;
  path: string;
  content: string;
  commitMessage: string;
};

/** Input shape for git_create_pr. Carries the mandatory hypothesis (DEC-LOGAN-004). */
export type GitCreatePrInput = {
  repo: string;
  branch: string;
  title: string;
  body: string;
  hypothesisContext: string;
  hypothesis: string;
  hypothesisPrediction: string;
};

/** Input shape for git_get_status (read-only). */
export type GitGetStatusInput = {
  repo: string;
};

/** Result of git_create_branch. */
export type GitCreateBranchResult = {
  branchName: string;
  sha: string;
  repo: string;
};

/** Result of git_write_file. */
export type GitWriteFileResult = {
  repo: string;
  branch: string;
  path: string;
  commitSha: string;
  updated: boolean; // true if file existed and was updated
};

/** Result of git_create_pr. */
export type GitCreatePrResult = {
  prNumber: number;
  prUrl: string;
  branch: string;
  repo: string;
  hypothesisId: string; // the dev-role Hypothesis created for this PR (DEC-LOGAN-004)
};

/** Result of git_get_status (read-only). */
export type GitGetStatusResult = {
  repo: string;
  branches: string[];
  openPRs: {
    number: number;
    title: string;
    head: string; // branch name
  }[];
  lastCommit: {
    sha: string;
    message: string;
    date: string;
  } | null;
};

/** Union of all git tool results. */
export type GitToolResult =
  | ({ tool: "git_create_branch" } & GitCreateBranchResult)
  | ({ tool: "git_write_file" } & GitWriteFileResult)
  | ({ tool: "git_create_pr" } & GitCreatePrResult)
  | ({ tool: "git_get_status" } & GitGetStatusResult);

/** Discriminated union of all git tool inputs (for the executor). */
export type GitToolInput =
  | ({ tool: "git_create_branch" } & GitCreateBranchInput)
  | ({ tool: "git_write_file" } & GitWriteFileInput)
  | ({ tool: "git_create_pr" } & GitCreatePrInput)
  | ({ tool: "git_get_status" } & GitGetStatusInput);
