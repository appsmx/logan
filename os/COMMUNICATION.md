# COMMUNICATION.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Cómo se hablan los agentes entre sí.

## 1. Principio de voz única
El usuario siempre habla con LOGAN. Core es la fachada. Los especialistas no se
dirigen al usuario; se dirigen a Core.

## 2. Tipos de mensaje
Tres tipos estructurados. No hay chat informal entre agentes.

### Mandato (Core → Especialista)
Objetivo · Restricciones · Criterios de éxito · Hipótesis esperada.

### Entregable (Especialista → Core)
Trabajo · Hipótesis (contexto + creencia + predicción) · Descubrimientos (opcional)
· Desacuerdo fundamentado (opcional, Art. VII).

### Reporte (Memory → Core)
Contexto resumido · Cambios detectados · Ambigüedades elevadas.

## 3. Modos de coordinación
- **Síncrono** — todo en una sesión.
- **Asíncrono** — Core escribe el mandato como documento en el repo; el especialista
  (siguiente sesión) lo recoge, ejecuta, escribe el entregable como documento.
  Permite continuidad entre modelos (Art. I).

## 4. Reglas
1. Core es el único que puede emitir mandatos a especialistas.
2. Los especialistas responden a Core con entregables + hipótesis.
3. Memory nunca decide; sus salidas son contexto, no instrucciones.
4. Toda comunicación persistente vive en el repositorio. No hay canales laterales.
5. Una decisión tomada en una conversación que no llegó al repositorio no existe
  para LOGAN.
