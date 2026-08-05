# MEMORY.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Cómo LOGAN Memory prepara el contexto.

## 1. Qué lee Memory
1. El repositorio LOGAN (Constitución, LOGAN OS, roles, templates).
2. La Biblia del proyecto activo.
3. El SESSION_CONTEXT de la sesión anterior (si existe).
4. Los cambios desde la última sesión (git diff del repo).

## 2. Qué produce Memory
Un **Reporte** (ver COMMUNICATION.md §2.3) que contiene:
- Contexto resumido (lo que Core necesita para decidir).
- Cambios detectados (qué es nuevo desde la última sesión).
- Ambigüedades elevadas (lo que Memory no puede resolver solo).

## 3. Qué NUNCA hace Memory
- No decide el próximo paso.
- No propone estrategia.
- No interpreta más allá de lo literal. Si hay ambigüedad, la eleva a Core.
- No elimina información del repositorio (solo la omite de su resumen).

## 4. Independencia del proveedor
La salida de Memory es texto Markdown. Cualquier modelo competente puede producir
el reporte. No depende de estructuras opacas de un proveedor específico.

## 5. Cuándo se invoca a Memory
- Al iniciar una sesión (antes de que Core decida nada).
- Cuando Core detecta que falta información (Sistema de Descubrimiento, LOGAN §8).
- Cuando un especialista detecta un cambio en el repositorio durante su trabajo.

## 6. Implementación actual (Etapa 2-3)
Memory NO es un agente LLM autónomo todavía. Es una función automática que
construye un reporte desde la BD: estado del proyecto, fase actual, modo de
trabajo, decisiones recientes, hipótesis activas, entregables de marketing,
último SessionContext. Cuando LOGAN Memory agente exista (Etapa 4+), leerá
el repo GitHub real del proyecto y detectará cambios via git diff.
