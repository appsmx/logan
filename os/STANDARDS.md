# STANDARDS.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Convenciones comunes a todos los agentes del ecosistema.

## 1. Formato canónico
- Todo entregable es Markdown (.md).
- Las exportaciones (.docx, .pdf) son derivaciones; el canónico es Markdown.
- Todo documento incluye en su encabezado: Versión, Estado, Propósito, Fecha (LOGAN §9.2).

## 2. Identificadores
- Decisiones de proyecto: `DEC-XXX: <título>` (LOGAN §5). Persisten en la BD del proyecto.
- Decisiones de ecosistema: `DEC-LOGAN-XXX`. Persisten en LOGAN_OS.md (este repo).
- Hipótesis: persisten en la BD del proyecto (tabla Hypothesis). Status: pendiente | en_observacion | verificada | refutada.
- Mandatos: `MAN-XXX` (numeración por proyecto, cuando exista LOGAN Dev).
- Roles: keys en minúsculas (`core`, `memory`, `marketing`).

## 3. Hipótesis obligatoria
Toda salida de un especialista que implique una decisión lleva una hipótesis asociada.
Sin hipótesis, no hay aprendizaje posible (DEC-LOGAN-004 — el diferenciador).

## 4. Independencia del proveedor
LOGAN OS no se ata a OpenAI, Anthropic, Gemini ni Mistral. Las instrucciones viven
en texto. El costo de cambiar de proveedor debe ser bajo. Si una instrucción solo
funciona con un proveedor, se documenta como excepción y se justifica.

## 5. Simplicidad (Art. III)
Ante dos soluciones válidas, se elige la más simple. Cualquier complejidad introducida
debe justificarse explícitamente. Si una propuesta compleja no puede justificar por qué
la solución simple es insuficiente, se rechaza.

## 6. Aprendizaje (Art. VIII)
Cuando un proyecto genera un aprendizaje universal, migra a LOGAN. La migración se
documenta en ECOSYSTEM.md. Los aprendizajes específicos se quedan en la Biblia.

## 7. Nombres de archivo
- Constitución: `LOGAN.md` (raíz del repo)
- Visión: `vision/VISION.md`
- OS: `os/LOGAN_OS.md`, `os/COMMUNICATION.md`, `os/MEMORY.md`, `os/STANDARDS.md`,
  `os/ECOSYSTEM.md`, `os/DELEGATION.md`
- Roles: `roles/ROLES.md` + `roles/<key>/ROLE.md`
- Proyecto: `<repo-del-proyecto>/Biblia_<NombreProyecto>.md` + `SESSION_CONTEXT.md`
- App LOGAN OS: `app/` (subcarpeta de este repo)

## 8. Validación constitucional (Art. VII/IX operacionalizado)
Cuando el validador constitucional detecta una violación en una respuesta de Core:
- La respuesta se entrega igual (no se bloquea — Art. IX: el humano decide).
- Se añade una nota visible: "⚠️ Validación constitucional — Art. X: ..."
- Las Decisiones persistidas en ese turno quedan como `status="propuesta"` (no `aprobada`).
- El humano aprueba, modifica o descarta.
