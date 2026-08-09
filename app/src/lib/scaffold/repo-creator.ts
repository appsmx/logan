// LOGAN Scaffolding — repo creator + verifier.
//
// Two modes (per task spec):
//   1. `create`   — try POST /user/repos (or POST /orgs/{owner}/repos) to make
//                   a new GitHub repo. The fine-grained PAT used in this
//                   sandbox is scoped to specific repos (mrtramite +
//                   mariscoseljona) and does NOT have repo-creation permission.
//                   When that's the case, we return a clear `REPO_CREATE_FORBIDDEN`
//                   error explaining the user must create the repo manually and
//                   then use `repoMode="existing"`.
//   2. `existing` — verify the repo exists AND the token has access (GET
//                   /repos/{owner}/{repo}). If 404 → REPO_NOT_FOUND. If 403 →
//                   REPO_NOT_ACCESSIBLE.
//
// Safety (Art. IX): the owner is hardcoded to whatever LOGAN_GITHUB_OWNER
// returns (default "appsmx"). The repo name passed by the user must match
// the validation in the route layer (lowercase, hyphens, 3-40 chars). We
// additionally reject `logan` here too as a defense-in-depth.

import { githubFetch, getOwner } from "@/lib/git/github-client";
import type { ScaffoldError } from "./types";

type GitHubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  owner: { login: string };
};

type CreateRepoResult =
  | { ok: true; repo: string; repoUrl: string; mode: "create" | "existing" }
  | { ok: false; error: ScaffoldError };

/**
 * Tries to create a new repo `appsmx/{repoName}` via the GitHub API.
 * If the token lacks permission, returns REPO_CREATE_FORBIDDEN with a clear
 * hint to use `repoMode="existing"` after creating the repo manually.
 */
export async function createRepo(repoName: string): Promise<CreateRepoResult> {
  const owner = getOwner();

  // Defense-in-depth: reject `logan` here too.
  if (repoName.toLowerCase() === "logan") {
    return {
      ok: false,
      error: {
        ok: false,
        code: "REPO_NOT_ALLOWED",
        error: `El nombre "${repoName}" está prohibido — LOGAN no puede crear un repo llamado "logan" (Art. I — LOGAN no modifica su propia metodología).`,
      },
    };
  }

  // First, try POST /user/repos — creates a repo owned by the authenticated user.
  // This works for user-scoped PATs. If the token is org-scoped or lacks
  // repo-creation permission, GitHub returns 403 / 404.
  try {
    const created = await githubFetch<GitHubRepo>(`/user/repos`, {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        description: `Producto gestionado con la metodología LOGAN. Creado por LOGAN Scaffolding.`,
        private: true,
        auto_init: true, // creates initial README so the repo has a default branch
        gitignore_template: "Node",
      }),
    });
    return {
      ok: true,
      repo: created.name,
      repoUrl: created.html_url,
      mode: "create",
    };
  } catch (e) {
    const msg = (e as Error).message || String(e);
    // GitHub returns 403 for fine-grained tokens without "Administration: write"
    // (repo-creation permission). Sometimes 422 if the repo already exists.
    // Sometimes 404 if the user/org isn't accessible.
    if (msg.includes("403") || msg.includes("Resource not accessible") || msg.includes("Forbidden")) {
      return {
        ok: false,
        error: {
          ok: false,
          code: "REPO_CREATE_FORBIDDEN",
          error: `El token de GitHub actual NO tiene permiso para crear repositorios (requiere scope "Administration: write" en la organización o cuenta).`,
          hint: `Crea el repo manualmente en https://github.com/new (nombre: ${owner}/${repoName}, privado), concede acceso al token fine-grained, y vuelve a ejecutar el scaffold con repoMode="existing" y repoName="${repoName}".`,
        },
      };
    }
    // If 422 (already exists), fall back to verifying the existing repo.
    if (msg.includes("422") || msg.includes("already exists") || msg.toLowerCase().includes("name already exists")) {
      return await verifyExistingRepo(repoName, /* mode = */ "create");
    }
    return {
      ok: false,
      error: {
        ok: false,
        code: "REPO_CREATE_FAILED",
        error: `GitHub rechazó la creación del repo: ${msg}`,
        hint: `Intenta crear el repo manualmente y usa repoMode="existing".`,
      },
    };
  }
}

/**
 * Verifies an existing repo is accessible to the current token.
 * Used when the user explicitly says repoMode="existing".
 */
export async function verifyExistingRepo(
  repoName: string,
  mode: "create" | "existing" = "existing",
): Promise<CreateRepoResult> {
  const owner = getOwner();

  if (repoName.toLowerCase() === "logan") {
    return {
      ok: false,
      error: {
        ok: false,
        code: "REPO_NOT_ALLOWED",
        error: `El repositorio "${repoName}" está prohibido — LOGAN no puede modificar su propia metodología (Art. I).`,
      },
    };
  }

  let repo: GitHubRepo;
  try {
    repo = await githubFetch<GitHubRepo>(`/repos/${owner}/${encodeURIComponent(repoName)}`);
  } catch (e) {
    const msg = (e as Error).message || String(e);
    if (msg.includes("404")) {
      return {
        ok: false,
        error: {
          ok: false,
          code: "REPO_NOT_FOUND",
          error: `El repositorio ${owner}/${repoName} no existe o el token no tiene acceso.`,
          hint: `Crea el repo en https://github.com/new (nombre: ${repoName}, privado), concede acceso al token fine-grained, y vuelve a intentar.`,
        },
      };
    }
    if (msg.includes("403") || msg.includes("Resource not accessible") || msg.includes("Forbidden")) {
      return {
        ok: false,
        error: {
          ok: false,
          code: "REPO_NOT_ACCESSIBLE",
          error: `El token no tiene acceso al repositorio ${owner}/${repoName}.`,
          hint: `En https://github.com/settings/personal-access-tokens, edita el token y agrega ${owner}/${repoName} a la lista de repos permitidos con permisos de "Contents: read & write".`,
        },
      };
    }
    return {
      ok: false,
      error: {
        ok: false,
        code: "REPO_NOT_ACCESSIBLE",
        error: `No se pudo verificar el repositorio ${owner}/${repoName}: ${msg}`,
      },
    };
  }

  return {
    ok: true,
    repo: repo.name,
    repoUrl: repo.html_url,
    mode,
  };
}
