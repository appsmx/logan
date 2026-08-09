// LOGAN Scaffolding — slug + repo-name derivation helpers.
//
// Task 31: teaches LOGAN to accept NATURAL LANGUAGE when creating new projects
// (e.g. "Crea un proyecto para Ferretería Don Juan. Repo:
// https://github.com/appsmx/ferreteria-don-juan") and derive the structured
// fields automatically, so the user doesn't have to speak in technical terms.
//
// Art. III (simplicidad): two pure functions, no side effects, no dependencies.
// Art. IX (humano decide): the helpers only NORMALIZE what the user said —
// they never invent a name or repo the user didn't provide.

/**
 * Derive a URL-safe slug from a product name.
 *
 * "Ferretería Don Juan" → "ferreteria-don-juan"
 * "Mariscos El Jona"    → "mariscos-el-jona"
 * "Café & Panadería"    → "cafe-panaderia"
 * "¡Logan OS!"          → "logan-os"
 *
 * Steps:
 *   1. lowercase
 *   2. NFD-normalize and strip combining marks (accents: á→a, é→e, …)
 *   3. remove any char that's not [a-z0-9\s-]   (drops &, !, ¡, ¿, …)
 *   4. trim
 *   5. collapse whitespace runs to a single hyphen
 *   6. collapse multiple hyphens
 *   7. trim leading/trailing hyphens
 *
 * Returns "" if the input is empty or produces no usable chars.
 */
export function deriveSlug(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining marks (accents)
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars (keep a-z 0-9 space -)
    .trim()
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Extract the repo name from a GitHub URL.
 *
 *   "https://github.com/appsmx/ferreteria-don-juan"     → "ferreteria-don-juan"
 *   "https://github.com/appsmx/ferreteria-don-juan.git" → "ferreteria-don-juan"
 *   "https://github.com/appsmx/ferreteria-don-juan/"    → "ferreteria-don-juan"
 *   "git@github.com:appsmx/ferreteria-don-juan.git"     → "ferreteria-don-juan"
 *   "ferreteria-don-juan"                                → null  (not a URL — caller uses as-is)
 *
 * Returns null when no GitHub URL pattern matches, so the caller can decide
 * (use the value as a bare repo name, or ask the user for clarification).
 */
export function extractRepoNameFromUrl(url: string): string | null {
  if (!url) return null;
  // Match the path segment after the owner in either HTTPS or SSH URL forms.
  // Accepts github.com/owner/repo OR github.com:owner/repo.
  const match = url.match(/github\.com[:/]([^/]+)\/([^/]+)/);
  if (!match) return null;
  return match[2]
    .replace(/\.git$/, "") // strip .git suffix
    .replace(/\/+$/, "") // strip trailing slashes
    .toLowerCase()
    .trim();
}

/**
 * Convenience: derive a repo name from EITHER a GitHub URL OR a bare repo name.
 *
 * - If the input matches a GitHub URL pattern → extract the repo segment.
 * - Otherwise → treat the input as a bare repo name and normalize it
 *   (lowercase, strip accents, strip special chars except hyphens).
 *
 * Returns "" if no usable input. Useful as a defensive fallback in the
 * scaffold endpoint when Core (or a direct API caller) sends something
 * that may or may not be a full URL.
 */
export function deriveRepoName(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";
  const fromUrl = extractRepoNameFromUrl(trimmed);
  if (fromUrl) return fromUrl;
  // Bare repo name — normalize it the same way as a slug.
  return deriveSlug(trimmed);
}
