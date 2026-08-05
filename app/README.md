# LOGAN OS

**Sistema operativo de IA que coordina múltiples agentes especializados para crear, administrar y hacer crecer empresas digitales.**

LOGAN evolucionó de una metodología (`LOGAN.md`, v1.0, la Constitución) a un sistema operativo de agentes: Core (orquesta), Memory (prepara contexto) y especialistas (Marketing, Dev, Design, Analytics, Finance, Legal, Support). Todos comparten una Constitución, una metodología y una sola voz frente al usuario.

> **El diferenciador:** toda decisión de un especialista deja constancia de *por qué* se tomó (una hipótesis verificable). Analytics verifica con el tiempo. Si se refuta, LOGAN aprende y actualiza su estrategia. El activo acumulado con los años son las hipótesis verificadas, no el código.

## Estructura del repositorio

```
LOGAN/
├── docs/
│   ├── LOGAN.md            ← la Constitución (10 artículos — máxima autoridad)
│   └── LOGAN_OS_v0.1.md    ← el diseño de LOGAN OS (11 decisiones estratégicas)
├── constitution/           ← (planeado) LOGAN.md como archivo canónico
├── os/                     ← (planeado) manual del OS: communication, memory, standards, ecosystem
├── roles/                  ← (planeado) core, memory, marketing, dev, design, analytics, finance, legal, support
├── templates/              ← (planeado) módulos reutilizables para productos
├── prompts/ examples/ docs/ changelog/   ← (planeado)
├── prisma/schema.prisma    ← Project, Vision, Decision, Hypothesis, MarketingAsset, SessionContext, etc.
└── src/
    ├── app/
    │   ├── api/core/       ← POST /api/core — el endpoint de LOGAN Core (Claude via Z.ai)
    │   └── page.tsx        ← la app web (14 secciones; "Hablar con LOGAN" es el chat en vivo)
    ├── lib/core/           ← system-prompt, memory-report, constitutional-validator, execute-actions
    └── lib/logan-os-data.ts ← Constitución + manual OS + roles + fases + glosario (estático)
```

## Cómo correrlo en local

```bash
bun install
bun run db:push     # crea el SQLite local
cp .env.example .env
bun run dev          # http://localhost:3000
```

## Cómo hablar con LOGAN Core

Desde la app: selecciona/crea un proyecto → sección "Hablar con LOGAN".

Desde curl:
```bash
PROJECT_ID=$(curl -s http://localhost:3000/api/projects | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
curl -X POST http://localhost:3000/api/core \
  -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PROJECT_ID\",\"message\":\"Hola LOGAN. ¿Qué eres?\"}" | python3 -m json.tool
```

Cada turno: Core lee la Constitución + la Biblia del proyecto + el reporte de Memory, responde en voz LOGAN, registra Decisiones/Hipótesis en la BD, y un **validador constitucional** (segunda llamada al LLM) verifica la respuesta contra los 10 artículos. Si detecta una posible violación, la marca en la respuesta — pero no la bloquea (Art. VII/IX: el humano decide).

## Stack

- Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- Prisma (SQLite local; Postgres en producción)
- TanStack Query + Zustand + framer-motion + next-themes
- z-ai-web-dev-sdk (Claude Sonnet vía Z.ai — tier gratuito)

## Decisiones estratégicas

Las decisiones importantes están registradas en `docs/LOGAN_OS_v0.1.md` (DEC-LOGAN-001 a 011). Algunas:

- **DEC-LOGAN-001**: marca corporativa al final (después de productos exitosos).
- **DEC-LOGAN-004**: el bucle de hipótesis es el diferenciador.
- **DEC-LOGAN-005**: ilimitadohost.com + mrtramite.mx primero.
- **DEC-LOGAN-006**: Claude (Core) + Gemini (Memory) vía tiers gratuitos.
- **DEC-LOGAN-008**: la app es parcialmente producción (chat = vista real de Core).
- **DEC-LOGAN-009/010**: el sistema musical es 3er producto, no un tier; los tiers se posponen a Etapa 6.
- **DEC-LOGAN-011**: módulos reutilizables en `templates/`.

## Estado

- ✅ Etapa 1 (LOGAN OS interno) — cerrada.
- ✅ Etapa 2 (LOGAN Core funcional) — cerrada.
- ⏳ Etapa 3 (LOGAN Marketing funcional) — siguiente.
- ⏳ Etapa 4 (Mr. Trámite), Etapa 5 (Hércules Bro), Etapa 6 (LOGAN corporativo).

## Fuente

- Constitución: `docs/LOGAN.md` (de https://github.com/appsmx/logan, v1.0, Oficial).
- Diseño LOGAN OS: `docs/LOGAN_OS_v0.1.md`.

*LOGAN · Learning, Organization, Governance, Architecture & Navigation*
