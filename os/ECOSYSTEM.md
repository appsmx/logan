# ECOSYSTEM.md

**Versión:** 1.1 · **Estado:** En producción · **Fecha:** 2026-08-12
**Propósito:** La memoria institucional de LOGAN.

## 1. Productos
| Producto | Estado | Dominio | Repositorio | Lanzamiento |
|---|---|---|---|---|
| Mr. Trámite | En vivo | mrtramite.vercel.app (mrtramite.mx pendiente) | github.com/appsmx/mrtramite | 2026-07 |
| Mariscos Quiroa | En vivo | mariscosquiroa.com | github.com/appsmx/mariscosquiroa | 2026-08 |
| Hércules Bro | Planificado | herculesbro.mx (pendiente) | github.com/appsmx/hercules-bro (pendiente) | — |
| Sistema para Productores Musicales | Planificado | por definir | por definir | — |

## 2. Agentes
| Agente | Kind | Estado | Activación |
|---|---|---|---|
| LOGAN Core | sistema | activo | 2026-07-29 |
| LOGAN Memory | sistema | activo (en app) | 2026-07-29 |
| LOGAN Marketing | especialista | activo | 2026-07-29 |
| LOGAN Dev | especialista | activo | 2026-08-08 |
| LOGAN Design | especialista | activo | 2026-08-08 |
| LOGAN Analytics | especialista | activo | 2026-08-08 |
| LOGAN Finance | especialista | activo | 2026-08-08 |
| LOGAN Legal | especialista | activo | 2026-08-08 |
| LOGAN Support | especialista | activo | 2026-08-08 |

## 3. Dominios
| Dominio | Estado | Propósito | Proveedor |
|---|---|---|---|
| mrtramite.mx | Pendiente | Producto comercial prioritario | Neubox (DEC-LOGAN-015) |
| logancorp.mx | Pendiente | Marca corporativa — página showcase ilustrativa (DEC-LOGAN-016) | Neubox |
| herculesbro.mx | Pendiente | Segundo producto | Neubox |

## 4. Decisiones estratégicas
17 decisiones vigentes (DEC-LOGAN-001 a 017). Ver `vision/VISION.md`.

## 5. Hitos

### 2026-07-29 — Etapas 1-3 cerradas: Core + Marketing funcionales
### 2026-08-08 — Etapa 4.5: Dev + Design funcionales + integración Core
### 2026-08-08 — Analytics funcional: bucle de aprendizaje cerrado
### 2026-08-08 — UI completa: Dev, Design, Analytics en la app
### 2026-08-08 — SQLite → Postgres, Analytics conectado a Core
### 2026-08-08 — Finance funcional
- `POST /api/finance/execute` con 8 capabilities (project_financials, cost_analysis, pricing_model, viability_analysis, budget_allocation, unit_economics, investment_analysis, financial_report).
- Core delega a Finance con `finance_execute` action type.
- FinanceSection UI completa.
- Prisma schema: modelo FinanceAsset añadido.
- LOGAN tiene ahora **7 agentes activos**.

### 2026-08-08 — Legal + Support activos. LOGAN OS completa 9/9 roles v0.5.
- `POST /api/legal/execute` con 8 capabilities (draft_terms, draft_privacy_policy, review_contract, compliance_check, draft_contract, regulatory_risk_analysis, data_protection_audit, legal_disclaimer).
- `POST /api/support/execute` con 8 capabilities (answer_faq, draft_help_article, categorize_issue, propose_solution, escalation_summary, satisfaction_analysis, improvement_proposal, onboarding_guide).
- Core delega a Legal con `legal_execute` y a Support con `support_execute` (en paralelo con Marketing, Dev, Design, Analytics, Finance).
- LegalSection y SupportSection UI completas.
- Prisma schema: modelos LegalAsset + SupportAsset añadidos.
- Bug fix crítico: parser de Core actualizado para reconocer todos los tipos de delegación (dev_execute, design_execute, analytics_verify, analytics_patterns, finance_execute, legal_execute, support_execute) — antes solo reconocía marketing_execute y los demás se descartaban silenciosamente.
- LOGAN tiene ahora **9 agentes activos** — mapa de roles del ecosistema completo.

### 2026-08-09 — Deploy en Vercel + Neon Postgres + multi-provider LLM
- App desplegada en `logancorp.vercel.app` (Vercel project `logancorp`).
- 3 rutas activas: `/` (app LOGAN OS), `/showcase` (página marketing futurista), `/api/core` (LOGAN Core con GLM-5.2).
- Neon Postgres conectado + tablas creadas vía `prisma db push`.
- Multi-provider LLM (DEC-LOGAN-006): `z-ai-web-dev-sdk` removido del código, cliente `fetch` propio. Z.ai primario (GLM-5.x), Gemini fallback.
- Mix de modelos consolidado (DEC-LOGAN-017, 2026-08-12):
  - GLM-5.2 — Core (decide + integrate) + Dev.
  - GLM-5.1 — Design + Analytics + Legal.
  - GLM-5-turbo — Validator + Marketing + Finance + Support + Assistant + Showcase.
- Repos separados (DEC-LOGAN-014): `logan` (metodología) público + `logan-app` (este código) público.
- 2 bugs críticos corregidos en Task 34 (2026-08-10): texto cortado en respuestas largas (`max_tokens` 4096 → 8192) y repos dinámicos (`isRepoAllowed` async con cache BD 60s).
- **Estado:** LOGAN OS v1.1 — completo y en producción.

### Pendiente
- Comprar `logancorp.mx` en Neubox y migrar DNS a Vercel.
- Configurar Google Workspace para correos.
- Cargar $200 USD en Z.ai (créditos) — sin créditos, los endpoints LLM devuelven 503.
- Activar Vercel Pro ($20/mes) cuando los turnos delegados excedan 10s en producción.
- Conectar WhatsApp Cloud API a productos (Mr. Trámite, Mariscos Quiroa) usando `templates/asistente-ia/`.
- Etapa 5: Hércules Bro.
- Etapa 6: LOGAN corporativo en `logancorp.mx` (showcase B2B).

## 6. Ingresos
| Producto | Ingresos | Periodo |
|---|---|---|
| Mr. Trámite | $0 (validación) | 2026-08 |

## 7. Servicios incorporados
- GitHub (appsmx) — repositorios públicos (`logan`, `logan-app`) + privados (`mrtramite`, `mariscosquiroa`, `hercules-bro`)
- Z.ai — proveedor LLM primario (GLM-5.2/5.1/5-turbo, DEC-LOGAN-017)
- Google AI Studio — proveedor LLM fallback (Gemini 2.0 Flash free tier)
- Vercel — deploy de `logancorp.vercel.app` (LOGAN OS) + `mrtramite.vercel.app` (Mr. Trámite)
- Neon — Postgres gestionado para LOGAN OS en producción
- Neubox — hosting + dominios `.mx` (pendiente activación de `logancorp.mx`, `mrtramite.mx`, `herculesbro.mx`)

## 8. Cómo se actualiza este documento
Al cerrar una etapa → añadir hito. Al activar un agente → actualizar tabla. Nunca se eliminan entradas.
