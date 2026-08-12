# LOGAN

**Learning, Organization, Governance, Architecture & Navigation**

Repositorio oficial de la metodología LOGAN — marco metodológico para el diseño y desarrollo de productos digitales asistidos por IA.

---

## Punto de entrada (para IA y humanos)

Este repositorio contiene la **metodología LOGAN** (inmutable en su filosofía). La app que operacionaliza la metodología vive en otro repo: **[`github.com/appsmx/logan-app`](https://github.com/appsmx/logan-app)**.

### Lectura obligatoria al iniciar cualquier sesión (LOGAN §3.2)

1. **[`LOGAN.md`](./LOGAN.md)** — La Constitución. Autoridad metodológica universal. Los 10 artículos.
2. **[`vision/VISION.md`](./vision/VISION.md)** — La Visión de LOGAN (por encima de la Constitución; responde las 8 preguntas filosóficas + 16 decisiones estratégicas DEC-LOGAN-001 a 016).
3. **[`docs/SESSION_CONTEXT.md`](./docs/SESSION_CONTEXT.md)** — El estado de la sesión actual (dónde quedamos, qué falta, próximos pasos).

### Estructura del repositorio (metodología)

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
│   ├── dev/ROLE.md           ← ACTIVO (v1.0)
│   ├── design/ROLE.md       ← ACTIVO (v1.0)
│   ├── analytics/ROLE.md     ← ACTIVO (v1.0)
│   ├── finance/ROLE.md       ← ACTIVO (v1.0)
│   ├── legal/ROLE.md         ← ACTIVO (v1.0)
│   └── support/ROLE.md       ← ACTIVO (v1.0)
├── templates/                ← Módulos reutilizables
│   └── asistente-ia/         ← Plantilla WhatsApp bot reutilizable (DEC-LOGAN-011)
├── prompts/                  ← Prompts de los especialistas
├── examples/                 ← Ejemplos trabajados de mandatos y entregables
├── docs/                     ← Documentación humana + SESSION_CONTEXT
└── changelog/                ← Changelogs por documento
```

### La app LOGAN OS

La aplicación Next.js que operacionaliza LOGAN OS (Core + 9 roles + git tools + showcase + Asistente IA + Scaffolding + Memory con git access) vive en:

**👉 [`github.com/appsmx/logan-app`](https://github.com/appsmx/logan-app)**

Esa app es lo que se deploya en Vercel y eventualmente en `logancorp.mx`.

---

## Cómo iniciar un proyecto bajo LOGAN

Si estás iniciando una sesión de trabajo (como IA o como humano) bajo LOGAN:

1. **Lee [`LOGAN.md`](./LOGAN.md) completo** antes de producir cualquier resultado.
2. Lee [`vision/VISION.md`](./vision/VISION.md) para entender el porqué filosófico.
3. Lee [`docs/SESSION_CONTEXT.md`](./docs/SESSION_CONTEXT.md) para saber dónde quedó el proyecto.
4. Sigue el **Protocolo de Inicialización** (Sección 3 de `LOGAN.md`).
5. Si necesitas la app, clona `github.com/appsmx/logan-app`.

> La **Biblia del proyecto** y el **SESSION_CONTEXT** no viven en este repo.
> Cada proyecto mantiene los suyos en su propio repositorio (ej: `github.com/appsmx/mrtramite`).

---

## Los 16 decisiones estratégicas (DEC-LOGAN-001 a 016)

Ver [`vision/VISION.md`](./vision/VISION.md) §13-16 para el registro completo de decisiones estratégicas del ecosistema.

---

## Estado de las etapas

- ✅ **Etapa 1** (LOGAN OS interno): cerrada.
- ✅ **Etapa 2** (LOGAN Core funcional): cerrada.
- ✅ **Etapa 3** (LOGAN Marketing funcional): cerrada.
- ✅ **Etapas 4-4.5**: Mr. Trámite construido + LOGAN Dev/Design/Analytics/Finance/Legal/Support funcionales.
- ⏳ **Etapa 5** (Hércules Bro): pendiente.
- ⏳ **Etapa 6** (LOGAN corporativo en `logancorp.mx`): pendiente — LOGAN OS completo, falta deploy.

---

## Cita

```
Fuente: https://github.com/appsmx/logan (metodología) + https://github.com/appsmx/logan-app (app)
Documentos: LOGAN.md (Constitución) + os/*.md (LOGAN OS)
Versión: 1.0 (Constitución) + 1.0 (LOGAN OS)
Estado: Oficial (Constitución) + Completo (LOGAN OS)
```

*LOGAN · Learning, Organization, Governance, Architecture & Navigation*
