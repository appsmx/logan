# ECOSYSTEM.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** La memoria institucional de LOGAN. Registra la evolución completa
del ecosistema para que cualquier persona (o cualquier agente) pueda comprenderla
leyendo un solo documento.

## 1. Productos
| Producto | Estado | Dominio | Repositorio | Lanzamiento |
|---|---|---|---|---|
| Mr. Trámite | En vivo | mrtramite.vercel.app (mrtramite.mx pendiente) | github.com/appsmx/mrtramite | 2026-07 |
| Hércules Bro | Planificado | herculesbro.mx (pendiente) | github.com/appsmx/hercules-bro (pendiente) | — |
| Sistema para Productores Musicales | Planificado | por definir | por definir | — |

## 2. Agentes
| Agente | Kind | Estado | Activación |
|---|---|---|---|
| LOGAN Core | sistema | activo | 2026-07-29 |
| LOGAN Memory | sistema | activo (en app) | 2026-07-29 |
| LOGAN Marketing | especialista | activo | 2026-07-29 |
| Dev | especialista | planificado | — |
| Design | especialista | activo (definición) | 2026-08-08 |
| Analytics | especialista | planificado | — |
| Finance | especialista | planificado | — |
| Legal | especialista | planificado | — |
| Support | especialista | planificado | — |

## 3. Dominios
| Dominio | Estado | Propósito | Proveedor | Registro |
|---|---|---|---|---|
| mrtramite.mx | Pendiente | Producto comercial prioritario | Neubox (DEC-LOGAN-015) | pendiente |
| logan.mx | Pendiente | Marca corporativa (Etapa 6) | Neubox | — |
| herculesbro.mx | Pendiente | Segundo producto | Neubox | — |

## 4. Decisiones estratégicas (DEC-LOGAN-XXX)
15 decisiones registradas en `vision/VISION.md` §13-15. Resumen:
- DEC-LOGAN-001: Marca corporativa al final
- DEC-LOGAN-004: El bucle de hipótesis es el diferenciador
- DEC-LOGAN-005/012/015: Hosting (corregido a Neubox)
- DEC-LOGAN-006: Proveedores de IA (Claude + Gemini vía tiers gratuitos)
- DEC-LOGAN-007: Presupuesto primera campaña Meta $60-100 USD
- DEC-LOGAN-008: App es parcialmente producción
- DEC-LOGAN-009: Sistema musical = 3er producto, no tier
- DEC-LOGAN-010: Posponer tiering; si existen, aplican a productos no al OS
- DEC-LOGAN-011: Módulos reutilizables en templates/
- DEC-LOGAN-013: Vercel Pro $20/mes para producción
- DEC-LOGAN-014: github.com/appsmx/logan público; productos privados

## 5. Hitos
### 2026-07-29 — Inicio oficial de la evolución a LOGAN OS
- Definida la arquitectura: Core, Memory, especialistas.
- Definidos los 6 documentos del OS.
- Etapa 1 cerrada (7 documentos pasan auditoría LOGAN §6.1).

### 2026-07-29 — Etapa 2 cerrada: LOGAN Core funcional
- POST /api/core operativo (Claude via Z.ai).
- Validador constitucional como segundo pase LLM.
- Persistencia de Decisiones, Hipótesis, SessionContexts.

### 2026-07-29 — Etapa 3 cerrada: LOGAN Marketing funcional
- POST /api/marketing/execute con 11 capabilities.
- Flujo de 3 llamadas LLM (Core delega → Marketing ejecuta → Core integra).
- Cada entregable nace con hipótesis vinculada (DEC-LOGAN-004).

### 2026-08-01 — Corrección Art. IX en persistence layer
- Bug fix: Decisions persistidas como "propuesta" cuando el validador flaggea.
- DEC-011 fantasma marcada como descartada en BD publicada.

### 2026-08-05 — LOGAN conectado con Mr. Trámite real
- Project "Mr. Trámite" creado con datos reales de la Biblia_MrTramite.md.
- Memory Entry apuntando a github.com/appsmx/mrtramite + mrtramite.vercel.app.
- DEC-001 y DEC-002 de Mr. Trámite importadas a LOGAN.

### 2026-08-08 — Rol Design activado (definición)
- `roles/design/ROLE.md` definido con responsabilidades, límites, mandato típico, entregable típico e hipótesis típica.
- Design pasa de "planificado" a "activo (definición)" en ROLES.md y ECOSYSTEM.md.
- Primer especialista de diseño operativo en el ecosistema LOGAN.

### Pendiente
- Etapa 4: cerrada — Mr. Trámite YA está construido (mrtramite.vercel.app)
- Etapa 4.5: LOGAN Dev funcional
- Etapa 5: Hércules Bro
- Etapa 6: LOGAN corporativo en logan.mx

## 6. Ingresos
| Producto | Ingresos | Periodo |
|---|---|---|
| Mr. Trámite | $0 (validación) | 2026-08 |
| Hércules Bro | $0 | — |

## 7. Servicios incorporados
- GitHub (appsmx) — repositorios públicos + privados
- Z.ai — proveedor LLM (Claude Sonnet via Z.ai free tier)
- Vercel — deploy de Mr. Trámite (mrtramite.vercel.app)
- Neubox — hosting + dominios .mx (pendiente activación)

## 8. Cómo se actualiza este documento
- Al cerrar una etapa, se añade un hito.
- Al tomar una decisión estratégica, se añade DEC-LOGAN-XXX.
- Al lanzar un producto, se actualiza la tabla de productos.
- Al registrar un dominio, se actualiza la tabla de dominios.
- Al activar un agente, se actualiza la tabla de agentes.
- Nunca se eliminan entradas; se marcan como deprecadas con fecha.
