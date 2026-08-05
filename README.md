# LOGAN

**Learning, Organization, Governance, Architecture & Navigation**

Repositorio oficial de la metodología LOGAN — marco metodológico para el diseño y desarrollo de productos digitales asistidos por IA.

---

## Punto de entrada (para IA y humanos)

Este repositorio contiene la **metodología LOGAN** (inmutable en su filosofía) + la extensión a **LOGAN OS** (el sistema operativo de agentes) + la **app LOGAN OS** que operacionaliza todo.

### Lectura obligatoria al iniciar cualquier sesión (LOGAN §3.2)

1. **[`LOGAN.md`](./LOGAN.md)** — La Constitución. Autoridad metodológica universal. Los 10 artículos.
2. **[`vision/VISION.md`](./vision/VISION.md)** — La Visión de LOGAN (por encima de la Constitución; responde las 8 preguntas filosóficas).
3. **[`docs/SESSION_CONTEXT.md`](./docs/SESSION_CONTEXT.md)** — El estado de la sesión actual (dónde quedamos, qué falta, próximos pasos).

### Estructura del repositorio

```
LOGAN/
├── LOGAN.md                  ← La Constitución (10 artículos, autoridad universal)
├── README.md                 ← Este archivo
├── vision/
│   └── VISION.md             ← La Visión de LOGAN (filosófica, sobre la Constitución)
├── os/                       ← LOGAN OS — el manual de funcionamiento del ecosistema
│   ├── LOGAN_OS.md           ← Qué es LOGAN OS, los 3 tipos de agente, el bucle
│   ├── COMMUNICATION.md      ← Cómo se hablan los agentes (mandato, entregable, reporte)
│   ├── DELEGATION.md         ← Cómo Core reparte el trabajo
│   ├── MEMORY.md             ← Cómo Memory prepara el contexto
│   ├── STANDARDS.md          ← Convenciones comunes a todos los agentes
│   ├── ECOSYSTEM.md          ← La memoria institucional del ecosistema
│   └── ROLES.md              ← El registro oficial de todos los roles
├── roles/                    ← Documentos individuales por rol
│   ├── core/ROLE.md
│   ├── memory/ROLE.md
│   ├── marketing/ROLE.md     ← Primer especialista real, ACTIVO
│   ├── dev/ROLE.md           ← planificado
│   ├── design/ROLE.md        ← planificado
│   ├── analytics/ROLE.md     ← planificado (verifica hipótesis)
│   ├── finance/ROLE.md       ← planificado
│   ├── legal/ROLE.md         ← planificado
│   └── support/ROLE.md       ← planificado
├── templates/                ← Módulos reutilizables (Catálogo, Pagos, Clientes, etc.)
├── prompts/                  ← Prompts de los especialistas
├── examples/                 ← Ejemplos trabajados de mandatos y entregables
├── docs/                     ← Documentación humana + SESSION_CONTEXT
└── app/                      ← La app LOGAN OS (Next.js) que operacionaliza todo lo anterior
```

### Los 15 decisiones estratégicas (DEC-LOGAN-001 a 015)

Ver [`os/LOGAN_OS.md`](./os/LOGAN_OS.md) §13-15 para el registro completo de decisiones estratégicas del ecosistema (hosting, proveedores de IA, dominio, Vercel Pro, tiering pospuesto, módulos en templates/, etc.).

---

## Cómo iniciar un proyecto bajo LOGAN

Si estás iniciando una sesión de trabajo (como IA o como humano) bajo LOGAN:

1. **Lee [`LOGAN.md`](./LOGAN.md) completo** antes de producir cualquier resultado. Es la única fuente metodológica.
2. Lee [`vision/VISION.md`](./vision/VISION.md) para entender el porqué filosófico.
3. Lee [`docs/SESSION_CONTEXT.md`](./docs/SESSION_CONTEXT.md) para saber dónde quedó el proyecto.
4. Sigue el **Protocolo de Inicialización** (Sección 3 de `LOGAN.md`).
5. En tu proyecto, mantén los otros dos documentos que LOGAN exige:
   - `Biblia_<Proyecto>.md` — conocimiento del producto (Nivel Proyecto).
   - `SESSION_CONTEXT.md` — estado temporal de la sesión (Nivel Temporal).

> La **Biblia del proyecto** y el **SESSION_CONTEXT** no viven en este repo.
> Cada proyecto mantiene los suyos en su propio repositorio (ej: `github.com/appsmx/mrtramite`).

---

## La app LOGAN OS (`/app/`)

La subcarpeta [`/app/`](./app/) contiene la aplicación Next.js que operacionaliza LOGAN OS:

- **LOGAN Core** funcional (`POST /api/core`): orquestador, validación constitucional, persistencia de decisiones/hipótesis.
- **LOGAN Marketing** funcional (`POST /api/marketing/execute`): 11 capabilities (analyze_page, create_meta_campaigns, suggest_budget, etc.).
- **Bucle de hipótesis** (DEC-LOGAN-004): cada decisión de especialista deja hipótesis verificable; Analytics (o el humano) verifica después.
- **UI**: chat con LOGAN, secciones de Decisiones, Hipótesis, Marketing, Biblia, Auditoría, Ciclo metodológico, PCS.
- Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Prisma (SQLite local) + Z.ai SDK.

Ver [`app/README.md`](./app/README.md) para cómo correrla localmente.

---

## Estado de las etapas

- ✅ **Etapa 1** (LOGAN OS interno): cerrada. 7 documentos pasan auditoría LOGAN §6.1.
- ✅ **Etapa 2** (LOGAN Core funcional): cerrada. `POST /api/core` funciona end-to-end.
- ✅ **Etapa 3** (LOGAN Marketing funcional): cerrada. 11 capabilities activas.
- ⏳ **Etapa 4** (Mr. Trámite): el producto ya está construido (`github.com/appsmx/mrtramite`); LOGAN se conecta con él para generar hipótesis reales.
- ⏳ **Etapa 4.5** (LOGAN Dev): pendiente. El rol que genera código production-grade.
- ⏳ **Etapa 5** (Hércules Bro): pendiente.
- ⏳ **Etapa 6** (LOGAN corporativo en `logan.mx`): pendiente.

---

## Cita

```
Fuente: https://github.com/appsmx/logan
Documentos: LOGAN.md (Constitución) + os/*.md (LOGAN OS) + app/ (aplicación)
Versión: 1.0 (Constitución) + 0.1 (LOGAN OS)
Estado: Oficial (Constitución) + En construcción (LOGAN OS)
```

*LOGAN · Learning, Organization, Governance, Architecture & Navigation*
