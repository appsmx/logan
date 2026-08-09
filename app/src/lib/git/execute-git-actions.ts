// LOGAN git tools — executor that persists GitAction rows.
//
// This is the bridge between Core's structured actions and the 4 git tools.
// It runs the safety-checked tool, persists the GitAction row (status="creado"
// on success, "fallido" on any failure including safety rejections), and
// returns the ActionTaken entry that Core/the UI consumes.
//
// For git_create_pr we ALSO create a Hypothesis row (roleId="dev",
// status="pendiente") BEFORE the GitHub API call — so even if the API call
// fails, the hypothesis is registered (DEC-LOGAN-004: every PR carries a
// hypothesis, no exceptions, even when the PR creation itself fails).
//
// The executor is the LAST line of defense. Even if Core produces an unsafe
// action, the tool will throw and we persist status="fallido".

import { db } from "@/lib/db";
import type { ActionTaken, CoreAction } from "@/lib/core/types";
import {
  gitCreateBranch,
  gitWriteFile,
  gitCreatePr,
  gitGetStatus,
} from "@/lib/git/tools";
import {
  ALLOWED_BRANCH_PREFIXES,
  PROTECTED_BRANCHES,
  REQUIRED_COMMIT_PREFIXES,
} from "@/lib/git/tools";

// ─── Public API ──────────────────────────────────────────────────────────────

export async function executeGitActions(
  projectId: string,
  actions: CoreAction[],
): Promise<ActionTaken[]> {
  const results: ActionTaken[] = [];
  for (const action of actions) {
    if (!action.type.startsWith("git_")) continue;
    const r = await executeOneGitAction(projectId, action);
    if (r) results.push(r);
  }
  return results;
}

// ─── Per-action dispatch ─────────────────────────────────────────────────────

async function executeOneGitAction(
  projectId: string,
  action: CoreAction,
): Promise<ActionTaken | null> {
  if (action.type === "git_create_branch") {
    return executeCreateBranch(projectId, action);
  }
  if (action.type === "git_write_file") {
    return executeWriteFile(projectId, action);
  }
  if (action.type === "git_create_pr") {
    return executeCreatePr(projectId, action);
  }
  if (action.type === "git_get_status") {
    return executeGetStatus(projectId, action);
  }
  return null;
}

// ─── git_create_branch ───────────────────────────────────────────────────────

async function executeCreateBranch(
  projectId: string,
  action: Extract<CoreAction, { type: "git_create_branch" }>,
): Promise<ActionTaken> {
  const repo = (action.repo || "").trim();
  const branchName = (action.branchName || "").trim();
  const fromBranch = action.fromBranch || "main";

  // Persist pending row first.
  let gitAction = await safeCreateGitAction({
    projectId,
    tool: "git_create_branch",
    repo,
    branch: branchName,
    status: "pendiente",
  });
  const gitActionId = gitAction?.id || "";

  try {
    const result = await gitCreateBranch({ repo, branchName, fromBranch });
    await safeUpdateGitAction(gitActionId, { status: "creado", branch: result.branchName });
    return {
      type: "git_create_branch",
      repo: result.repo,
      branchName: result.branchName,
      sha: result.sha,
      gitActionId,
      status: "creado",
    };
  } catch (e) {
    const error = (e as Error).message || String(e);
    await safeUpdateGitAction(gitActionId, { status: "fallido", error });
    return {
      type: "git_create_branch",
      repo,
      branchName,
      gitActionId,
      status: "fallido",
    };
  }
}

// ─── git_write_file ──────────────────────────────────────────────────────────

async function executeWriteFile(
  projectId: string,
  action: Extract<CoreAction, { type: "git_write_file" }>,
): Promise<ActionTaken> {
  const repo = (action.repo || "").trim();
  const branch = (action.branch || "").trim();
  const path = (action.path || "").trim();
  const commitMessage = (action.commitMessage || "").trim();
  const content = action.content ?? "";

  let gitAction = await safeCreateGitAction({
    projectId,
    tool: "git_write_file",
    repo,
    branch,
    path,
    commitMessage,
    status: "pendiente",
  });
  const gitActionId = gitAction?.id || "";

  try {
    const result = await gitWriteFile({ repo, branch, path, content, commitMessage });
    await safeUpdateGitAction(gitActionId, { status: "creado" });
    return {
      type: "git_write_file",
      repo: result.repo,
      branch: result.branch,
      path: result.path,
      gitActionId,
      status: "creado",
    };
  } catch (e) {
    const error = (e as Error).message || String(e);
    await safeUpdateGitAction(gitActionId, { status: "fallido", error });
    return {
      type: "git_write_file",
      repo,
      branch,
      path,
      gitActionId,
      status: "fallido",
    };
  }
}

// ─── git_create_pr ───────────────────────────────────────────────────────────

async function executeCreatePr(
  projectId: string,
  action: Extract<CoreAction, { type: "git_create_pr" }>,
): Promise<ActionTaken> {
  const repo = (action.repo || "").trim();
  const branch = (action.branch || "").trim();
  const title = (action.title || "").trim();
  const body = (action.body || "").trim();
  const hypothesisContext = (action.hypothesisContext || "").trim();
  const hypothesis = (action.hypothesis || "").trim();
  const hypothesisPrediction = (action.hypothesisPrediction || "").trim();

  let gitAction = await safeCreateGitAction({
    projectId,
    tool: "git_create_pr",
    repo,
    branch,
    status: "pendiente",
  });
  const gitActionId = gitAction?.id || "";

  // DEC-LOGAN-004: create the Hypothesis row BEFORE the GitHub API call,
  // so even if the API call fails, the hypothesis is registered. roleId="dev"
  // because PRs are Dev-role deliverables.
  let hypothesisId = "";
  try {
    const hyp = await db.hypothesis.create({
      data: {
        projectId,
        roleId: "dev",
        context: hypothesisContext,
        hypothesis,
        prediction: hypothesisPrediction,
        status: "pendiente",
        outcome: "",
        evidence: "",
      },
    });
    hypothesisId = hyp.id;
    await safeUpdateGitAction(gitActionId, { hypothesisId });
  } catch (e) {
    // Even hypothesis creation failure should not block — try to proceed so
    // we can still surface a fallido to the user.
    console.error("[git] create hypothesis failed:", (e as Error).message);
  }

  try {
    const result = await gitCreatePr({
      repo,
      branch,
      title,
      body,
      hypothesisContext,
      hypothesis,
      hypothesisPrediction,
    });
    await safeUpdateGitAction(gitActionId, {
      status: "creado",
      hypothesisId,
      prNumber: result.prNumber,
      prUrl: result.prUrl,
    });
    return {
      type: "git_create_pr",
      repo,
      branch,
      prNumber: result.prNumber,
      prUrl: result.prUrl,
      hypothesisId,
      gitActionId,
      status: "creado",
    };
  } catch (e) {
    const error = (e as Error).message || String(e);
    await safeUpdateGitAction(gitActionId, { status: "fallido", error, hypothesisId });
    return {
      type: "git_create_pr",
      repo,
      branch,
      hypothesisId: hypothesisId || undefined,
      gitActionId,
      status: "fallido",
    };
  }
}

// ─── git_get_status ──────────────────────────────────────────────────────────

async function executeGetStatus(
  projectId: string,
  action: Extract<CoreAction, { type: "git_get_status" }>,
): Promise<ActionTaken> {
  const repo = (action.repo || "").trim();

  let gitAction = await safeCreateGitAction({
    projectId,
    tool: "git_get_status",
    repo,
    status: "pendiente",
  });
  const gitActionId = gitAction?.id || "";

  try {
    const result = await gitGetStatus({ repo });
    await safeUpdateGitAction(gitActionId, { status: "creado" });
    return {
      type: "git_get_status",
      repo: result.repo,
      branches: result.branches,
      openPRs: result.openPRs,
      gitActionId,
      status: "creado",
    };
  } catch (e) {
    const error = (e as Error).message || String(e);
    await safeUpdateGitAction(gitActionId, { status: "fallido", error });
    return {
      type: "git_get_status",
      repo,
      gitActionId,
      status: "fallido",
    };
  }
}

// ─── DB helpers (never throw — the executor is best-effort) ───────────────────

type CreateGitActionInput = {
  projectId: string;
  tool: string;
  repo: string;
  branch?: string | null;
  path?: string | null;
  commitMessage?: string | null;
  status: string;
};

async function safeCreateGitAction(input: CreateGitActionInput) {
  try {
    return await db.gitAction.create({
      data: {
        projectId: input.projectId,
        tool: input.tool,
        repo: input.repo,
        branch: input.branch ?? null,
        path: input.path ?? null,
        commitMessage: input.commitMessage ?? null,
        status: input.status,
      },
    });
  } catch (e) {
    console.error("[git] safeCreateGitAction failed:", (e as Error).message);
    return null;
  }
}

type UpdateGitActionInput = {
  status: string;
  error?: string;
  hypothesisId?: string;
  prNumber?: number;
  prUrl?: string;
  branch?: string;
};

async function safeUpdateGitAction(gitActionId: string, input: UpdateGitActionInput) {
  if (!gitActionId) return;
  try {
    await db.gitAction.update({
      where: { id: gitActionId },
      data: {
        status: input.status,
        ...(input.error !== undefined ? { error: input.error } : {}),
        ...(input.hypothesisId !== undefined ? { hypothesisId: input.hypothesisId } : {}),
        ...(input.prNumber !== undefined ? { prNumber: input.prNumber } : {}),
        ...(input.prUrl !== undefined ? { prUrl: input.prUrl } : {}),
        ...(input.branch !== undefined ? { branch: input.branch } : {}),
      },
    });
  } catch (e) {
    console.error("[git] safeUpdateGitAction failed:", (e as Error).message);
  }
}

// Re-export safety helpers for tests / external callers.
export {
  ALLOWED_BRANCH_PREFIXES,
  PROTECTED_BRANCHES,
  REQUIRED_COMMIT_PREFIXES,
};
