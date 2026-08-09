// LOGAN Scaffolding — Biblia markdown generator.
//
// Generates the initial `Biblia_<ProductSlug>.md` markdown for the new repo.
//
// Art. IV (única fuente de verdad): the Biblia lives in the PRODUCT repo, not
// in LOGAN. LOGAN just creates the empty structure with the vision + users
// the human provided. Everything else is "(pendiente)" — the product owner
// fills it in (Art. IX).
//
// Art. II (la documentación precede al desarrollo): scaffolding the Biblia IS
// the first documentation. Without it, no construction. This file is what
// makes the project LOGAN-compliant from day 1.

import type { ScaffoldRequest } from "./types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugTitleCase(slug: string): string {
  // "ferreteria-don-juan" → "Ferreteria Don Juan"
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function bulletList(items: string[]): string {
  if (!items || items.length === 0) return "- (sin definir todavía — preguntar al producto)";
  return items.map((u) => `- ${u}`).join("\n");
}

/**
 * Generates the initial Biblia markdown for the new product repo.
 *
 * Sections (matches the structure the task spec defined):
 *   1. Header (versión, estado, propósito, fecha)
 *   2. Visión del producto
 *   3. Usuarios objetivo
 *   4. Catálogo de productos/servicios (placeholder)
 *   5. Stack tecnológico (placeholder)
 *   6. Decisiones aprobadas (placeholder — DEC-001 will come from LOGAN)
 *   7. Estado del MVP (table)
 */
export function generateBiblia(req: ScaffoldRequest): string {
  const productTitle = slugTitleCase(req.productSlug);
  const dateStr = today();

  return `# Biblia_${req.productSlug}.md

**Versión:** 0.1
**Estado:** En construcción
**Propósito:** Capturar el conocimiento específico del producto ${req.productName}.
**Fecha:** ${dateStr}

---

## 1. Visión del producto

${req.vision.trim()}

## 2. Usuarios objetivo

${bulletList(req.users)}

## 3. Catálogo de productos/servicios

(Pendiente de documentar — LOGAN ayudará a definirlo en la primera sesión de Discovery.)

## 4. Stack tecnológico

(Pendiente — LOGAN Dev propondrá en la fase de Arquitectura.)

## 5. Decisiones aprobadas

(Sin decisiones aún — la primera sesión de LOGAN registrará DEC-001.)

## 6. Estado del MVP

| Componente | Estado |
|---|---|
| Biblia del proyecto | ✅ Inicial (este documento) |
| Resto | ⏳ Pendiente |

---

*Biblia_${req.productSlug}.md v0.1 — creada por LOGAN Scaffolding el ${dateStr}.*
*Producto: ${req.productName} (${productTitle}).*
`;
}

/**
 * Generates the initial `SESSION_CONTEXT.md` for the new product repo.
 * Per PCS §10: SESSION_CONTEXT captures the temporal state of the session.
 * For a brand-new project, this is just "no previous session".
 */
export function generateSessionContext(req: ScaffoldRequest): string {
  const dateStr = today();
  return `# SESSION_CONTEXT.md

Proyecto: ${req.productName}
Metodología: LOGAN v1.0
Estado: En construcción
Avance: Proyecto recién creado. No hay sesión previa.

## Objetivo completado en esta sesión

Scaffolding inicial del proyecto (repo + Biblia + LOGAN connection) completado por LOGAN Scaffolding.

## Decisiones tomadas

(Ninguna todavía.)

## Documentos actualizados

- Biblia_${req.productSlug}.md — creada v0.1
- SESSION_CONTEXT.md — creado
- README.md — creado
- .gitignore — creado

## Pendientes

- Completar la sección "Catálogo de productos/servicios" de la Biblia.
- Definir el stack tecnológico con LOGAN Dev.
- Registrar DEC-001 (primera decisión importante del proyecto).

## Riesgos identificados

(Ninguno identificado todavía.)

## Próximo objetivo

Iniciar la Fase 1 (Comprender el problema): abrir LOGAN OS, seleccionar este proyecto, y empezar una sesión con LOGAN Core para definir los siguientes pasos del MVP.

## Observaciones

Este repositorio fue creado automáticamente por LOGAN Scaffolding el ${dateStr}.
Cualquier IA que retome este proyecto debe leer primero:
1. LOGAN.md (metodología universal)
2. Biblia_${req.productSlug}.md (este producto)
3. SESSION_CONTEXT.md (este archivo — estado temporal)
`;
}

/**
 * Generates the initial `README.md` for the new product repo.
 * References LOGAN so any developer (or AI) landing in the repo knows where
 * the methodology lives.
 */
export function generateReadme(req: ScaffoldRequest): string {
  const productTitle = slugTitleCase(req.productSlug);
  const dateStr = today();
  return `# ${req.productName}

> **${productTitle}** — producto gestionado con la metodología [LOGAN](https://github.com/appsmx/logan).

${req.vision.trim()}

## Estructura LOGAN

Este repositorio sigue la metodología **LOGAN** (Learning, Organization, Governance, Architecture & Navigation). Tres documentos son la fuente de verdad del proyecto:

| Documento | Qué contiene | Quién lo actualiza |
|---|---|---|
| \`LOGAN.md\` | Metodología universal (compartida entre proyectos) | AppsMX — NO se modifica por proyecto |
| \`Biblia_${req.productSlug}.md\` | Conocimiento específico de este producto | El equipo del producto + LOGAN |
| \`SESSION_CONTEXT.md\` | Estado temporal de la sesión actual | LOGAN (al cerrar cada sesión) |

## Cómo trabajar en este proyecto

1. Antes de empezar cualquier tarea, lee los tres documentos anteriores.
2. Toda decisión importante se registra como \`DEC-XXX\` en la Biblia (Art. VI).
3. Toda construcción va en un branch \`feature/\` y se integra vía Pull Request (Art. IX — el humano decide).
4. Al cerrar la sesión, LOGAN genera un nuevo SESSION_CONTEXT (Protocolo de Continuidad de Sesión, §10).

## LOGAN OS

La interfaz operativa de LOGAN vive en [\`logan-studio\`](https://github.com/appsmx/logan-studio) — ahí es donde Core, Marketing, Dev, Design, Analytics, Finance, Legal, Support y los demás roles ejecutan el trabajo metodológico.

---

*Creado por LOGAN Scaffolding el ${dateStr}.*
`;
}

/** Standard Next.js .gitignore. */
export function generateGitignore(): string {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations/

# sqlite
*.db
*.db-journal
`;
}
