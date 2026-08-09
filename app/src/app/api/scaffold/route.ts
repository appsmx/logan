// LOGAN Scaffolding — POST /api/scaffold endpoint.
//
// Task 28: creates a new LOGAN product project end-to-end:
//   1. Validate input.
//   2. Handle repo (create new via API OR verify existing).
//   3. Add the new repo to the in-memory allowed-repos supplement (so git
//      tools work without restart).
//   4. Create the LOGAN Project row (with repo = repoName).
//   5. Initialize the repo with LOGAN structure (Biblia, SESSION_CONTEXT,
//      README, .gitignore) — direct commits to main (acceptable for a NEW repo).
//   6. Create a Memory Entry pointing to the new repo.
//   7. Return the project ID + repo URL + what was created.
//
// Art. III (simplicidad): one endpoint, 5 supporting functions, no
// over-engineering. Art. IV (única fuente de verdad): the Biblia lives in
// the PRODUCT repo. Art. IX (humano decide): scaffolding creates STRUCTURE;
// the product owner fills the Biblia later.
//
// Safety:
//   - Owner is hardcoded via LOGAN_GITHUB_OWNER (default "appsmx").
//   - `logan` repo is always forbidden.
//   - productSlug validated: lowercase, hyphens, 3-40 chars.
//   - We use githubFetch directly (bypassing the PROTECTED_PATHS regex) because
//     scaffolding a brand-new repo requires creating README.md — that's the
//     whole point. The protection regex is appropriate for post-init ops.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRepo, verifyExistingRepo } from "@/lib/scaffold/repo-creator";
import { initializeStructure } from "@/lib/scaffold/structure-initializer";
import { addAllowedRepo } from "@/lib/scaffold/allowed-repos";
import { deriveRepoName, deriveSlug } from "@/lib/scaffold/slug";
import type { ScaffoldError, ScaffoldRequest, ScaffoldResult } from "@/lib/scaffold/types";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

function fail(code: ScaffoldError["code"], error: string, status: number, hint?: string) {
  return NextResponse.json({ ok: false, code, error, ...(hint ? { hint } : {}) } as ScaffoldError, { status });
}

function validateInput(body: Partial<ScaffoldRequest>): ScaffoldRequest | { error: ScaffoldError } {
  const productName = (body.productName || "").trim();
  // Task 31 — defensive slug derivation: if the caller (Core or direct API)
  // omitted productSlug, derive it from productName. This is the safety net
  // behind the system-prompt teaching (Core is told to derive the slug itself,
  // but we also handle the case where it forgets or sends a partial payload).
  let productSlug = (body.productSlug || "").trim().toLowerCase();
  if (!productSlug && productName) {
    productSlug = deriveSlug(productName);
  }
  const vision = (body.vision || "").trim();
  const users = Array.isArray(body.users) ? body.users.filter((u): u is string => typeof u === "string" && u.trim().length > 0) : [];
  const repoMode = body.repoMode;
  // Task 31 — defensive repoName extraction: if the caller sent a full GitHub
  // URL (e.g. "https://github.com/appsmx/ferreteria-don-juan") instead of the
  // bare repo name, extract the repo segment. Bare names are normalized too.
  let repoName = "";
  if (body.repoName && typeof body.repoName === "string" && body.repoName.trim().length > 0) {
    repoName = deriveRepoName(body.repoName.trim());
  }

  if (!productName) {
    return { error: { ok: false, code: "INVALID_INPUT", error: "productName es obligatorio." } };
  }
  if (!productSlug) {
    // Could happen if productName has no usable chars (e.g. only emoji).
    return { error: { ok: false, code: "INVALID_INPUT", error: "No se pudo derivar productSlug a partir de productName.", hint: "Debe ser lowercase con guiones, 3-40 caracteres. Ej: 'ferreteria-don-juan'." } };
  }
  if (!SLUG_REGEX.test(productSlug)) {
    return { error: { ok: false, code: "INVALID_INPUT", error: `productSlug inválido: "${productSlug}".`, hint: "Debe empezar y terminar con letra o número, solo lowercase y guiones, 3-40 caracteres. Ej: 'ferreteria-don-juan'." } };
  }
  if (productSlug === "logan") {
    return { error: { ok: false, code: "INVALID_INPUT", error: 'productSlug "logan" está prohibido — LOGAN no crea proyectos llamados "logan" (Art. I).' } };
  }
  if (!vision) {
    return { error: { ok: false, code: "INVALID_INPUT", error: "vision es obligatoria.", hint: "1-3 oraciones describiendo la visión del producto." } };
  }
  if (repoMode !== "create" && repoMode !== "existing") {
    return { error: { ok: false, code: "INVALID_INPUT", error: `repoMode inválido: "${repoMode}".`, hint: 'Debe ser "create" o "existing".' } };
  }
  if (repoMode === "existing" && !repoName) {
    return { error: { ok: false, code: "INVALID_INPUT", error: 'repoName es obligatorio cuando repoMode="existing".' } };
  }
  if (repoMode === "existing" && repoName === "logan") {
    return { error: { ok: false, code: "INVALID_INPUT", error: 'repoName "logan" está prohibido (Art. I).' } };
  }

  return { productName, productSlug, vision, users, repoMode, repoName: repoMode === "existing" ? repoName : undefined };
}

// POST /api/scaffold — create a new LOGAN product project end-to-end.
export async function POST(req: NextRequest) {
  let body: Partial<ScaffoldRequest>;
  try { body = (await req.json().catch(() => ({}))) as Partial<ScaffoldRequest>; }
  catch { return fail("INVALID_INPUT", "Cuerpo de la petición inválido.", 400); }

  const validated = validateInput(body);
  if ("error" in validated) {
    const e = validated.error;
    return fail(e.code, e.error, 400, e.hint);
  }
  const input = validated;

  // ── Step 1: Handle the repo (create OR verify existing) ──────────────────
  const repoResult = input.repoMode === "create"
    ? await createRepo(input.productSlug)
    : await verifyExistingRepo(input.repoName!, "existing");

  if (!repoResult.ok) {
    // Map error codes to HTTP status:
    // - REPO_CREATE_FORBIDDEN → 403 (token lacks permission)
    // - REPO_NOT_FOUND → 404
    // - REPO_NOT_ACCESSIBLE → 403
    // - others → 400 / 500
    const code = repoResult.error.code;
    const status = code === "REPO_NOT_FOUND" ? 404 : code === "REPO_CREATE_FORBIDDEN" || code === "REPO_NOT_ACCESSIBLE" ? 403 : 500;
    return fail(code, repoResult.error.error, status, repoResult.error.hint);
  }

  const { repo, repoUrl, mode } = repoResult;

  // ── Step 2: Add the repo to the in-memory allowed-repos supplement ───────
  // This lets the git tools (src/lib/git/tools.ts) operate on the new repo
  // without requiring a server restart.
  addAllowedRepo(repo);

  // ── Step 3: Create the LOGAN Project row ─────────────────────────────────
  let projectId = "";
  try {
    const project = await db.project.create({
      data: {
        name: input.productName,
        vision: input.vision,
        users: JSON.stringify(input.users),
        status: "En construcción",
        currentPhase: 1,
        currentMode: "exploracion",
        repo,
        phaseProgress: {
          create: Array.from({ length: 8 }, (_, i) => ({
            phase: i + 1,
            status: "pendiente",
            notes: "",
          })),
        },
      },
    });
    projectId = project.id;
  } catch (e) {
    return fail("PROJECT_CREATE_FAILED", `No se pudo crear el proyecto en LOGAN: ${(e as Error).message}`, 500);
  }

  // ── Step 4: Initialize the repo with LOGAN structure ─────────────────────
  let files: { path: string; commitSha: string; created: boolean }[] = [];
  try {
    files = await initializeStructure(repo, "main", input);
  } catch (e) {
    // The project row was already created; the repo exists but file init failed.
    // We don't roll back the project — the user can fix the repo and re-init.
    const msg = (e as Error).message || String(e);
    return fail(
      "FILE_INIT_FAILED",
      `El proyecto y el repo se crearon, pero la inicialización de archivos falló: ${msg}`,
      500,
      `El proyecto LOGAN existe (id=${projectId}) y el repo está en ${repoUrl}. Puedes inicializar los archivos manualmente: Biblia_${input.productSlug}.md, SESSION_CONTEXT.md, README.md, .gitignore.`,
    );
  }

  // ── Step 5: Create a Memory Entry pointing to the new repo ────────────────
  let memoryEntryId = "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    const summary = [
      `Producto: ${input.productName} (slug: ${input.productSlug}).`,
      `Repositorio: ${repoUrl}.`,
      `Visión: ${input.vision}`,
      input.users.length > 0 ? `Usuarios objetivo: ${input.users.join(", ")}.` : "Usuarios objetivo: (sin definir).",
      `Estado: En construcción (Fase 1 — Exploración).`,
      `Creado por LOGAN Scaffolding el ${today}.`,
    ].join("\n");
    const memoryEntry = await db.memoryEntry.create({
      data: {
        projectId,
        source: `GitHub: ${repoUrl}`,
        summary,
        changesDetected: `Repo inicializado con: Biblia_${input.productSlug}.md, SESSION_CONTEXT.md, README.md, .gitignore.`,
      },
    });
    memoryEntryId = memoryEntry.id;
  } catch (e) {
    // Non-fatal — the scaffold itself succeeded; we just don't have the
    // memory entry. Log and continue.
    console.error("[scaffold] MemoryEntry creation failed:", (e as Error).message);
  }

  const message = mode === "create"
    ? `Proyecto "${input.productName}" creado. Repo nuevo: ${repoUrl}. Archivos inicializados: Biblia_${input.productSlug}.md, SESSION_CONTEXT.md, README.md, .gitignore. Memory entry registrada.`
    : `Proyecto "${input.productName}" creado en el repo existente: ${repoUrl}. Archivos inicializados: Biblia_${input.productSlug}.md, SESSION_CONTEXT.md, README.md, .gitignore. Memory entry registrada. ${repo !== input.productSlug ? `(Nota: el repo "${repo}" no coincide con el slug "${input.productSlug}" — el archivo Biblia usa el slug.)` : ""}`;

  const result: ScaffoldResult = {
    ok: true,
    projectId,
    repo,
    repoUrl,
    repoMode: mode,
    files,
    memoryEntryId,
    message,
  };
  return NextResponse.json(result, { status: 201 });
}

// GET /api/scaffold — endpoint metadata for sanity check.
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/scaffold",
    description: "Crea un nuevo producto LOGAN end-to-end: repo + estructura LOGAN + Biblia inicial + Memory Entry.",
    bodySchema: {
      productName: "string (req) — nombre humano del producto (ej: 'Ferretería Don Juan')",
      productSlug: "string (opcional) — lowercase, guiones, 3-40 chars. Si se omite, se deriva de productName (Task 31).",
      vision: "string (req) — visión del producto (1-3 oraciones)",
      users: "string[] (req) — usuarios objetivo",
      repoMode: '"create" | "existing" (req) — por defecto "existing" en el prompt de Core',
      repoName: "string (req si repoMode=existing) — nombre del repo existente bajo appsmx/. Acepta una URL de GitHub completa (se extrae el segmento) o un nombre bare.",
    },
    notes: [
      "Art. III (simplicidad): scaffolding crea la ESTRUCTURA, no el contenido.",
      "Art. IV (única fuente de verdad): la Biblia vive en el PRODUCT repo, no en LOGAN.",
      "Art. IX (humano decide): el product owner completa la Biblia con detalles reales.",
      "El token fine-grained actual NO tiene permiso de crear repos — si repoMode=create falla con REPO_CREATE_FORBIDDEN, crea el repo manualmente y usa repoMode=existing.",
      "Después del scaffold, el nuevo repo se agrega a la lista in-memory de permitidos — las herramientas git funcionan sin reiniciar el server.",
      "Task 31: el endpoint acepta lenguaje natural indirectamente — Core deriva los campos estructurados y los envía. Defensivamente, si productSlug se omite, se deriva de productName; si repoName es una URL de GitHub, se extrae el segmento.",
    ],
  });
}
