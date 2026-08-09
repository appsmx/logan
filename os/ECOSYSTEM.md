# ECOSYSTEM.md

**Versión:** 0.5 · **Estado:** En construcción · **Fecha:** 2026-08-08
**Propósito:** La memoria institucional de LOGAN.

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
16 decisiones vigentes (DEC-LOGAN-001 a 016). Ver `vision/VISION.md`.

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

### Pendiente
- Deploy en Vercel Pro (configurar DATABASE_URL Postgres + prisma migrate deploy).
- Etapa 5: Hércules Bro.
- Etapa 6: LOGAN corporativo en logan.mx.

## 6. Ingresos
| Producto | Ingresos | Periodo |
|---|---|---|
| Mr. Trámite | $0 (validación) | 2026-08 |

## 7. Servicios incorporados
- GitHub (appsmx) — repositorios públicos + privados
- Z.ai — proveedor LLM (Claude Sonnet via Z.ai free tier, DEC-LOGAN-006)
- Vercel — deploy de Mr. Trámite (mrtramite.vercel.app)
- Neubox — hosting + dominios .mx (pendiente activación)

## 8. Cómo se actualiza este documento
Al cerrar una etapa → añadir hito. Al activar un agente → actualizar tabla. Nunca se eliminan entradas.
