# LOGAN OS v0.1 — Diseño de la arquitectura

**Estado:** En construcción
**Versión:** 0.1
**Propósito:** Definir la primera versión oficial de LOGAN OS — el sistema que coordina los agentes especializados del ecosistema LOGAN. Este documento extiende la Constitución (`constitution/LOGAN.md`); no la reemplaza.
**Fecha:** 2026-07-29
**Sesión:** Diseño (sin código). Toda decisión pasa la prueba: *¿esto ayuda a que LOGAN siga creciendo durante los próximos 10 años sin perder coherencia?*

---

## 0. Encuadre

LOGAN deja de ser únicamente una metodología para desarrollar aplicaciones y evoluciona hacia un sistema operativo de agentes. El usuario siempre hablará con **LOGAN**; nunca con varios agentes. Core es la fachada; los especialistas están detrás.

La Constitución (`constitution/LOGAN.md`) sigue siendo la máxima autoridad. No se modifica su filosofía ni sus principios. Todo lo construido a partir de ahora extiende esa Constitución.

El diferenciador estratégico de LOGAN OS frente a "otro asistente de IA" es el **bucle de hipótesis**: toda decisión de un especialista deja constancia de *por qué* se tomó (hipótesis verificable). Analytics verifica con el tiempo. Si se refuta, LOGAN aprende y actualiza su estrategia. El activo acumulado con los años son las hipótesis verificadas/refutadas — no el código ni los prompts.

---

## 1. Jerarquía de autoridad (extendida)

```
Visión (el por qué supremo)
   ↓
Constitución (los 10 artículos — lo que no se negocia)
   ↓
LOGAN OS (cómo opera el ecosistema)
   ↓
Roles (quién hace qué)
   ↓
Biblia del Proyecto (qué se está construyendo)
   ↓
SESSION_CONTEXT (dónde estamos ahora)
   ↓
Solicitud del usuario
```

En cualquier conflicto, prevalece el nivel superior.

---

## 2. Organización del repositorio

```
LOGAN/
├── constitution/
│   └── LOGAN.md                  ← la Constitución (inmutable en filosofía)
├── vision/
│   └── VISION.md                 ← La Visión de LOGAN (por encima de la Constitución)
├── os/
│   ├── LOGAN_OS.md               ← qué es el OS, los 3 tipos de agente, el bucle
│   ├── COMMUNICATION.md          ← cómo se hablan los agentes
│   ├── MEMORY.md                 ← cómo Memory prepara el contexto
│   ├── STANDARDS.md              ← convenciones comunes a todos los agentes
│   └── ECOSYSTEM.md              ← la memoria institucional del ecosistema
├── roles/
│   ├── ROLES.md                  ← el registro de todos los roles
│   ├── core/
│   │   └── ROLE.md
│   ├── memory/
│   │   └── ROLE.md
│   └── marketing/
│       └── ROLE.md
├── templates/                    ← plantillas reutilizables (mandato, entregable, hipótesis)
├── prompts/                      ← prompts de los especialistas
├── examples/                     ← ejemplos trabajados de mandatos y entregables
├── docs/                         ← documentación humana
└── changelog/                    ← changelogs por documento
```

Los seis documentos que el usuario pidió: `LOGAN_OS.md`, `ROLES.md`, `MEMORY.md`, `COMMUNICATION.md`, `STANDARDS.md`, `ECOSYSTEM.md`. `VISION.md` se añade por encima de la Constitución (capa filosófica nueva).

---

## 3. Los tres tipos de agente

| Tipo | Cantidad | Qué hace | Qué NUNCA hace |
|---|---|---|---|
| **Core** | Exactamente uno | Comprender la solicitud, leer el contexto de Memory, decidir a quién delegar, emitir el mandato, integrar el entregable, validar contra la Constitución | Ejecutar trabajo especializado (programar, diseñar, redactar copy, decidir de dominio) |
| **Memory** | Exactamente uno | Leer el repo y la Biblia, resumir, detectar cambios, preparar el contexto para Core, elevar ambigüedades | Decidir, proponer estrategia, interpretar más allá de lo literal |
| **Especialista** | Muchos, uno por dominio | Ejecutar el trabajo del dominio, devolver entregable + hipótesis | Hablar con el usuario, contradecir la Constitución, decidir la visión del producto |

**Especialistas actuales y planificados:**
- Marketing — **activo** (primer rol; genera valor económico inmediato)
- Dev — planificado
- Design — planificado
- Analytics — planificado (verifica las hipótesis de los demás roles; cierra el bucle)
- Finance — planificado
- Legal — planificado
- Support — planificado

---

## 4. Protocolo de comunicación

El usuario siempre habla con LOGAN. Tres tipos de mensaje estructurado. No hay chat informal entre agentes.

### 4.1 Mandato (Core → Especialista)
- **Objetivo** — qué se espera
- **Restricciones** — límites, presupuesto, tiempo, alcance
- **Criterios de éxito** — cómo se sabe que está terminado
- **Hipótesis esperada** — el especialista debe devolver, además del entregable, la hipótesis que justifica sus decisiones

### 4.2 Entregable (Especialista → Core)
- **Trabajo** — el entregable concreto
- **Hipótesis** — contexto + creencia + predicción medible
- **Descubrimientos** — (opcional) información nueva detectada
- **Desacuerdo fundamentado** — (opcional) si el especialista cree que el mandato contradice la Constitución (Art. VII)

### 4.3 Reporte (Memory → Core)
- **Contexto resumido** — lo que Core necesita para decidir
- **Cambios detectados** — qué es nuevo desde la última sesión
- **Ambigüedades elevadas** — lo que Memory no puede resolver solo

### 4.4 Dos modos de coordinación
- **Síncrono** — todo en una sesión: Core delega, especialista retorna, Core integra.
- **Asíncrono** — Core escribe el mandato como documento en el repo; el especialista (siguiente sesión) lo recoge, ejecuta, escribe el entregable como documento. Es lo que permite continuidad entre modelos y entre sesiones (Art. I).

### 4.5 Reglas
1. Core es el único que puede emitir mandatos a especialistas.
2. Los especialistas responden a Core con entregables + hipótesis.
3. Memory nunca decide; sus salidas son contexto, no instrucciones.
4. Toda comunicación persistente vive en el repositorio. No hay canales laterales.
5. Una decisión tomada en una conversación que no llegó al repositorio no existe para LOGAN.

---

## 5. El bucle de aprendizaje (el diferenciador)

```
1. Especialista toma una decisión
        ↓
2. Registra hipótesis (contexto + creencia + predicción medible)
        ↓
3. Analytics (o el humano, si Analytics no existe aún) verifica
        ↓
4a. Verificada → la estrategia se refuerza
4b. Refutada  → LOGAN aprende → si el aprendizaje es universal (Art. VIII), migra a LOGAN
        ↓
5. La acumulación de hipótesis verificadas/refutadas es el activo real del ecosistema
```

Sin este bucle, LOGAN ejecuta tareas pero no aprende. Es lo que distingue a LOGAN de "otro asistente de IA".

---

## 6. Primeras versiones de los seis documentos

### 6.1 `os/LOGAN_OS.md`

```markdown
# LOGAN OS

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Definir el sistema operativo del ecosistema LOGAN — cómo los agentes
se coordinan, delegan, integran y aprenden bajo una única Constitución y una única voz.

## 1. Qué es LOGAN OS
LOGAN OS es el sistema que coordina los agentes especializados del ecosistema LOGAN.
No es un modelo de IA. No es un framework de software. Es el conjunto de reglas,
protocolos y documentos que permiten que múltiples agentes colaboren bajo una única
Constitución y una única voz frente al usuario. LOGAN OS vive dentro del repositorio
LOGAN; no reemplaza a la Constitución, la extiende.

## 2. Los tres tipos de agente
1. **LOGAN Core** — el orquestador. Único. Lee la solicitud, lee el contexto de Memory,
   decide a qué especialista delegar, emite el mandato, integra el entregable, valida
   contra la Constitución. No ejecuta trabajo especializado.
2. **LOGAN Memory** — el contexto. Único. Lee el repositorio y la Biblia, resume,
   detecta cambios, prepara la información para Core. No decide; informa.
3. **Agentes especialistas** — muchos. Cada uno es dueño de un dominio. Reciben
   mandatos de Core, devuelven entregables + hipótesis.

## 3. Principios operativos
- **Una sola voz.** El usuario siempre habla con LOGAN. Core es la fachada.
- **Pensar antes de construir (Art. X).** Core no delega hasta haber comprendido la
  solicitud y haber leído el contexto de Memory.
- **Toda decisión especializada deja hipótesis.** Es el mecanismo de aprendizaje.
- **Independencia del proveedor.** Las instrucciones viven en texto.
- **El conocimiento permanente vive en el repositorio.** El temporal, en SESSION_CONTEXT.

## 4. El bucle de aprendizaje
(Ver §5 de este diseño.)

## 5. Jerarquía de autoridad
Visión > Constitución > LOGAN OS > Roles > Biblia > SESSION_CONTEXT > Solicitud del usuario.
```

### 6.2 `roles/ROLES.md`

```markdown
# ROLES.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** El registro oficial de todos los agentes del ecosistema LOGAN.
Un nuevo agente se incorpora añadiendo una entrada aquí (sin modificar la arquitectura).

## Formato de entrada
- **key** — identificador único (ej: `marketing`).
- **name** — nombre visible.
- **kind** — `sistema` (Core, Memory) | `especialista`.
- **status** — `activo` | `planificado` | `deprecado`.
- **tagline** — una línea que describe su responsabilidad.
- **responsibilities** — lista numerada.
- **never** — lo que este rol nunca hace (límites explícitos).
- **role_doc** — ruta a `roles/<key>/ROLE.md`.

## Roles actuales

### LOGAN Core (sistema, activo)
Orquestador. No ejecuta trabajo especializado.
- Comprender la solicitud del usuario.
- Analizar el contexto preparado por Memory.
- Decidir qué especialistas participan.
- Delegar emitiendo mandatos.
- Integrar los entregables.
- Validar contra la Constitución.
**Never:** programa, diseña, redacta copy, decide de dominio, habla en nombre propio.

### LOGAN Memory (sistema, activo)
Contexto. No decide.
- Leer el repositorio LOGAN.
- Leer la Biblia del proyecto activo.
- Detectar cambios entre sesiones.
- Resumir el contexto para Core.
- Eliminar información irrelevante de su resumen (no del repo).
- Elevar ambigüedades a Core.
**Never:** decide, propone estrategia, interpreta más allá de lo literal, elimina
información del repositorio.

### LOGAN Marketing (especialista, activo)
Primer especialista. Genera valor económico inmediato.
- Analizar páginas web.
- Detectar fortalezas y debilidades.
- Analizar competidores.
- Diseñar estrategias.
- Crear campañas para Meta.
- Generar copies.
- Crear prompts para imágenes.
- Crear prompts para video.
- Recomendar presupuestos.
- Medir resultados.
- Aprender de campañas anteriores (vía hipótesis).
**Never:** decide la visión del producto, elige el proveedor de IA, modifica la
Constitución, se dirige al usuario.

### Dev (especialista, planificado)
### Design (especialista, planificado)
### Analytics (especialista, planificado) — verifica las hipótesis de los demás roles
### Finance (especialista, planificado)
### Legal (especialista, planificado)
### Support (especialista, planificado)
```

### 6.3 `os/MEMORY.md`

```markdown
# MEMORY.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Definir cómo LOGAN Memory prepara el contexto.

## 1. Qué lee Memory
1. El repositorio LOGAN (Constitución, LOGAN OS, roles, templates).
2. La Biblia del proyecto activo.
3. El SESSION_CONTEXT de la sesión anterior (si existe).
4. Los cambios desde la última sesión (git diff del repo).

## 2. Qué produce Memory
Un **Reporte** (ver COMMUNICATION.md §4.3) que contiene:
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
```

### 6.4 `os/COMMUNICATION.md`

```markdown
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
```

### 6.5 `os/STANDARDS.md`

```markdown
# STANDARDS.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** Convenciones comunes a todos los agentes del ecosistema.

## 1. Formato canónico
- Todo entregable es Markdown (.md).
- Las exportaciones (.docx, .pdf) son derivaciones; el canónico es Markdown.
- Todo documento incluye en su encabezado: Versión, Estado, Propósito, Fecha (LOGAN §9.2).

## 2. Identificadores
- Decisiones: `DEC-XXX: <título>` (LOGAN §5).
- Hipótesis: `HIP-XXX` (numeración por proyecto).
- Mandatos: `MAN-XXX` (numeración por proyecto).
- Roles: keys en minúsculas (`core`, `memory`, `marketing`).

## 3. Hipótesis obligatoria
Toda salida de un especialista que implique una decisión lleva una hipótesis asociada.
Sin hipótesis, no hay aprendizaje posible.

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
- Constitución: `constitution/LOGAN.md`
- Visión: `vision/VISION.md`
- OS: `os/LOGAN_OS.md`, `os/COMMUNICATION.md`, `os/MEMORY.md`, `os/STANDARDS.md`,
  `os/ECOSYSTEM.md`
- Roles: `roles/ROLES.md` + `roles/<key>/ROLE.md`
- Proyecto: `<repo-del-proyecto>/Biblia_<NombreProyecto>.md` + `SESSION_CONTEXT.md`
```

### 6.6 `os/ECOSYSTEM.md` — la memoria institucional

```markdown
# ECOSYSTEM.md

**Versión:** 0.1 · **Estado:** En construcción · **Fecha:** 2026-07-29
**Propósito:** La memoria institucional de LOGAN. Registra la evolución completa del
ecosistema para que cualquier persona (o cualquier agente) pueda comprenderla leyendo
un solo documento.

## 1. Productos
| Producto | Estado | Dominio | Repositorio | Lanzamiento |
|---|---|---|---|---|
| Mr. Trámite | Planificado | mrtramite.mx (pendiente) | — | — |
| Hércules Bro | Planificado | herculesbro.mx (pendiente) | — | — |

## 2. Agentes
| Agente | Kind | Estado | Activación |
|---|---|---|---|
| LOGAN Core | sistema | activo (arquitectura) | 2026-07-29 |
| LOGAN Memory | sistema | activo (arquitectura) | 2026-07-29 |
| LOGAN Marketing | especialista | activo (definición) | 2026-07-29 |
| Dev | especialista | planificado | — |
| Design | especialista | planificado | — |
| Analytics | especialista | planificado | — |
| Finance | especialista | planificado | — |
| Legal | especialista | planificado | — |
| Support | especialista | planificado | — |

## 3. Dominios
| Dominio | Estado | Propósito | Registro |
|---|---|---|---|
| mrtramite.mx | Pendiente | Producto comercial prioritario | — |
| logan.mx | Pendiente | Marca corporativa (Etapa 6) | — |
| herculesbro.mx | Pendiente | Segundo producto | — |

## 4. Hitos
### 2026-07-29 — Inicio oficial de la evolución a LOGAN OS
- Definida la arquitectura: Core, Memory, especialistas.
- Definidos los 6 documentos del OS (LOGAN_OS, COMMUNICATION, MEMORY, STANDARDS,
  ECOSYSTEM, ROLES).
- Definida la estrategia de 6 etapas.
- Definida la estrategia de dominios.
- LOGAN OS web app (vista operacional) ya construida en sesión previa; incluye el
  bucle de hipótesis (HIP-XXX).

### Pendiente
- Etapa 1: cierre (6 documentos aprobados por auditoría).
- Etapa 2: LOGAN Core funcional.
- Etapa 3: LOGAN Marketing funcional.
- Etapa 4: lanzamiento de Mr. Trámite.

## 5. Decisiones estratégicas
### DEC-LOGAN-001 — Marca corporativa al final
**Decisión:** No lanzar la marca LOGAN como producto comercial hasta que existan
productos exitosos respaldándola.
**Justificación:** Lanzar una marca sin productos es poner el carruaje delante de los
bueyes. La marca emerge de los éxitos, no al revés.
**Fecha:** 2026-07-29

### DEC-LOGAN-002 — Dominio comercial primero
**Decisión:** Registrar primero el dominio del producto que generará ingresos
(mrtramite.mx), no el corporativo (logan.mx).
**Justificación:** Conservar capital durante la etapa inicial. El dominio corporativo
se registra cuando Mr. Trámite genere ingresos constantes.
**Fecha:** 2026-07-29

### DEC-LOGAN-003 — Una sola cuenta de hosting
**Decisión:** Centralizar todos los dominios y servicios en una sola cuenta de hosting.
**Justificación:** Una sola fecha de renovación, un solo panel, un solo proveedor de
SSL, un solo proveedor de correo. Minimiza fricción administrativa.
**Fecha:** 2026-07-29

### DEC-LOGAN-004 — El bucle de hipótesis como diferenciador
**Decisión:** Toda decisión de un especialista deja una hipótesis verificable.
**Justificación:** Sin hipótesis, LOGAN ejecuta tareas pero no aprende. El activo
acumulado con el tiempo son las hipótesis verificadas/refutadas.
**Fecha:** 2026-07-29

## 6. Primeras versiones
| Componente | Versión | Fecha | Notas |
|---|---|---|---|
| Constitución LOGAN | 1.0 | preexistente | Oficial |
| LOGAN OS (documentos) | 0.1 | 2026-07-29 | En construcción |
| LOGAN OS web app | 0.1 | 2026-07-29 | Vista operacional con bucle de hipótesis |

## 7. Ingresos
| Producto | Ingresos | Periodo |
|---|---|---|
| Mr. Trámite | $0 | — |
| Hércules Bro | $0 | — |

## 8. Servicios incorporados
(ninguno todavía)

## 9. Cómo se actualiza este documento
- Al cerrar una etapa, se añade un hito.
- Al tomar una decisión estratégica, se añade DEC-LOGAN-XXX.
- Al lanzar un producto, se actualiza la tabla de productos.
- Al registrar un dominio, se actualiza la tabla de dominios.
- Al activar un agente, se actualiza la tabla de agentes.
- Nunca se eliminan entradas; se marcan como deprecadas con fecha.
```

---

## 7. Hoja de ruta — 6 etapas (con criterios de salida)

| Etapa | Qué | Criterio de salida (definición de "listo") |
|---|---|---|
| **1** | LOGAN OS interno (no público) | Los 6 documentos existen y pasan la lista de verificación del LOGAN §6.1 (coherencia constitucional, decisional, simplicidad, documentación, separación correcta). |
| **2** | LOGAN Core funcional | Core puede leer una solicitud + el reporte de Memory + decidir a qué especialista delegar + emitir un mandato + integrar el entregable + validar contra la Constitución. |
| **3** | LOGAN Marketing funcional | Marketing ejecuta las 11 capacidades (analizar página, fortalezas, debilidades, competidores, estrategia, campañas Meta, copies, prompts de imagen, prompts de video, presupuesto, estimación) — y **cada salida** lleva hipótesis. |
| **4** | Mr. Trámite | mrtramite.mx está en vivo; al menos una campaña de Meta ejecutada con hipótesis verificadas/refutadas; flujo de efectivo positivo. |
| **5** | Hércules Bro | Mismo formato que Etapa 4, segundo producto. |
| **6** | LOGAN corporativo | logan.mx en vivo como marca corporativa; ECOSYSTEM.md cuenta la historia completa de cómo LOGAN creó Mr. Trámite y Hércules Bro. |

---

## 8. Estrategia de dominios (orden y razonamiento)

1. **Contratar un servicio de hosting profesional** (una sola cuenta).
2. **Registrar `mrtramite.mx` primero** — es el producto que generará ingresos. El capital se asigna a lo que produce, no a lo que aún no existe.
3. **Administrar todo desde la misma cuenta** — un panel, una renovación, un SSL, un proveedor de correo.
4. **Registrar `logan.mx` cuando Mr. Trámite genere ingresos constantes** — no antes, para no gastar en una marca sin producto que la respalde (DEC-LOGAN-001).
5. **Registrar `herculesbro.mx` cuando Hércules Bro esté listo para lanzar** — no antes.
6. **Centralización permanente** — todos los dominios bajo una sola cuenta para simplificar renovaciones, SSL, correos y DNS.

---

## 9. La prueba de los 10 años (aplicada a cada decisión mayor)

| Decisión | ¿Pasa la prueba? | Por qué |
|---|---|---|
| Un solo Core (no federación) | **Sí** | La coherencia es el producto. Una federación fragmenta la voz. En 10 años, con 15-20 roles, una sola fachada es lo que mantiene a LOGAN siendo "LOGAN" y no una colección de asistentes. |
| Markdown como formato canónico (no base de datos) | **Sí** | Sobrevive a cambios de proveedor de IA, de modelo, de framework. Una base de datos en 10 años queda obsoleta; Markdown no. |
| Hipótesis como entidad de primera clase | **Sí** | Sin hipótesis, LOGAN ejecuta pero no aprende. En 10 años, las miles de hipótesis verificadas/refutadas son el foso real. |
| ECOSYSTEM.md como memoria institucional única | **Sí** | Un agente nuevo (o un humano nuevo) se orienta en una sola lectura. Sin esto, el conocimiento queda disperso en commits y chats. |
| Marca corporativa al final (Etapa 6) | **Sí** | La marca deriva de los productos, no al revés. Lanzar marca sin productos quema capital y credibilidad. |
| Una sola cuenta de hosting (por ahora) | **Sí, con revisión** | A escala pequeña/mediana, minimiza fricción. En escala mayor (miles de usuarios), puede revisarse; se documentará como nueva DEC-LOGAN cuando llegue. |
| Mandatos asíncronos vía documentos del repo | **Sí** | Es lo que permite continuidad entre modelos y sesiones (Art. I). Sin esto, LOGAN dependía del historial de conversación, que es frágil. |
| Memory nunca decide | **Sí** | Si Memory decide, se convierte en un segundo Core y la coordinación se rompe. La separación clara (Art. V) protege la coherencia. |
| Especialistas no hablan con el usuario | **Sí** | Si hablan, el usuario siente que habla con varios. La voz única es el producto. |
| Visión por encima de la Constitución | **Sí** | Cuando haya 15-20 roles, la Visión filosófica evita tener que añadir una regla por caso. Es una herramienta de diseño, no un documento decorativo. |

---

## 10. Preguntas abiertas para ti (Art. IX — el criterio humano)

La IA es arquitecto colaborador, no sustituto del criterio humano. Estas decisiones son tuyas:

1. **Proveedor de hosting.** ¿Cuál? (Considera residencia de datos en MX para Mr. Trámite.)
2. **Proveedor de IA inicial para Core y Memory.** ¿Z.ai, OpenAI, Anthropic, Gemini? (LOGAN OS es independiente del proveedor, pero la Etapa 2 necesita uno concreto.)
3. **Primer producto para Marketing.** ¿Mr. Trámite primero (más maduro), o Hércules Bro? Tu conversación previa sugiere Mr. Trámite — confirma.
4. **Presupuesto de la primera campaña de Meta.** ¿Rango inicial para que Marketing proponga el reparto?
5. **¿La app web LOGAN OS ya construida es la vista operacional permanente, o es un prototipo y la versión final vivirá solo en el repo?** Mi recomendación: la app se queda como vista operacional (lee el repo, muestra el estado, permite registrar hipótesis); el repo sigue siendo la fuente de verdad. Pero es tu decisión.
6. **¿Una sola cuenta de hosting cubre también los repos privados de Mr. Trámite y Hércules Bro?** Tu idea de "una sola cuenta" ¿incluye repos privados, o cada producto tiene su propio repo GitHub y la cuenta única es solo hosting+dominios?

---

## 11. Relación con la app LOGAN OS ya construida

La web app construida en la sesión previa ya operacionaliza gran parte de este diseño:

| Pieza del diseño | Estado en la app |
|---|---|
| Visión editable | ✅ Sección "Visión", editable, persiste en BD |
| Constitución (10 artículos) | ✅ Sección "Constitución", verbatim |
| LOGAN OS manual | ✅ Sección "LOGAN OS" (comunicación, delegación, memoria, estándares) — **actualizar con los nuevos drafts de §6** |
| Roles (9, con Core/Memory/Marketing activos) | ✅ Sección "Roles" |
| Bucle de hipótesis (HIP-XXX, verificar/refutar) | ✅ Sección "Hipótesis" — el diferenciador, ya funciona end-to-end |
| Mandatos asíncronos (MAN-XXX) | ⏳ No implementado todavía — se añade cuando Core exista (Etapa 2) |
| ECOSYSTEM.md como sección navegable | ⏳ No implementado — se añade |
| Hoja de ruta de 6 etapas (vista) | ⏳ No implementado — se añade |
| Estrategia de dominios (vista) | ⏳ No implementado — se añade |
| Decisiones (DEC-XXX atribuidas a rol) | ✅ Sección "Decisiones" |
| Biblia, Backlog, Descubrimientos, Auditoría, PCS | ✅ Todos implementados |

**Propuesta (no código todavía):** cuando apruebes este diseño, la app se extiende para reflejarlo fielmente:
- Añadir sección **"Ecosistema"** (vista de ECOSYSTEM.md: productos, agentes, dominios, hitos, decisiones estratégicas, ingresos).
- Añadir sección **"Hoja de ruta"** (las 6 etapas con su criterio de salida y estado).
- Actualizar la sección **"LOGAN OS"** con los drafts finales de los 6 documentos.
- Añadir entidad **Mandato** (MAN-XXX) y el flujo asíncrono Core → Especialista (cuando Core exista, Etapa 2).

---

## 12. Cierre de la sesión de diseño

Este documento (`docs/LOGAN_OS_v0.1.md`) es la salida de la sesión de diseño. No es código. Es la arquitectura.

**Próximo paso recomendado:** que apruebes, ajustes o rechaces cada una de las decisiones de la §9 (prueba de los 10 años) y respondas las 6 preguntas abiertas de la §10. Con eso, la Etapa 1 queda cerrada y pasamos a la Etapa 2 (LOGAN Core funcional).

---

## 13. Cierre de la Etapa 1 — Respuestas confirmadas + decisiones registradas

**Fecha de cierre:** 2026-07-29
**Sesión:** Confirmación de las 6 preguntas abiertas (§10). Pesquisa web realizada (Art. X — pensar antes de construir).

### 13.1 Las 6 respuestas + investigación

#### Q1 — Hosting: ilimitadohost.com y dominios .mx
**Pesquisa (web-search):** ilimitadohost.com **sí soporta** dominios .mx. Su página de dominios confirma "Registro y transferencia de dominios .com, .mx" con hosting + SSL + correo incluidos. Precios observados: .com a $14.99 USD/año registro, .com a $12.93 USD/año en una oferta paralela (`hostilimitado.com` marca blanca). Son una empresa con sede en Albuquerque, NM, que atiende al mercado mexicano.

**Alternativas comparadas al mismo rango de precio (~$30 USD/año):**
- **Neubox** — 100% mexicano, $169.90 MXN (~$10 USD) el primer año para .COM.MX; renovación ~$699 MXN. Más barato el primer año, pero la renovación sube.
- **Hostinger Mexico** — desde MXN 24.99/mes hosting; dominio .mx a partir de MXN ~$230/año. Más caro.
- **webhosting.mx** — .com/.mx desde $230.84 MXN/año. Comparable.

**Recomendación (Art. IX — el criterio humano es final):**
- **Continuar con ilimitadohost.com** — cumple los dos requisitos (soporta .mx + está en tu rango de $30 USD/año).
- **Registrar `mrtramite.mx` directamente** (no .com) — es el dominio comercial prioritario y el .mx señala presencia local, lo cual es importante para un trámite en México. El .com no es necesario todavía.
- **Backup si ilimitadohost falla**: Neubox (100% mexicano, renovaciones predecibles en MXN).

**Decisión registrada:** DEC-LOGAN-005 (§13.2 abajo).

#### Q2 — Proveedor de IA para Core y Memory
**Pesquisa (web-search):**
- **Gemini 3.1 Pro / 1.5 Pro** — 2M tokens de contexto; el output más barato del mercado; "98% de la calidad de Opus a una fracción del costo". Ideal para **Memory** (leer repositorios enteros). Tier gratuito vía Google AI Studio.
- **Claude (Sonnet 4 / 3.5)** — mejor razonamiento para orquestación. Vía Anthropic directo o vía **Z.ai** (tier gratuito, ya configurado en este proyecto).
- **GPT-4o / GPT-4o-mini** — sólido en general; razonamiento decente; rango de precio medio.
- **Precios de referencia 2026**: Gemini Flash-Lite $0.10/M input tokens → Claude Opus 4.1 $15/M input. Ventanas de contexto de 128K a 2M.

**Análisis coste/beneficio por rol:**

| Rol | Necesita | Mejor opción | Razón |
|---|---|---|---|
| **Core** | Razonamiento, decisión, integración, validación constitucional | **Claude Sonnet (vía Z.ai free tier)** | Mejor razonamiento para delegación; el tier gratuito de Z.ai ya está configurado → $0 durante la Etapa 2 |
| **Memory** | Leer repositorios, resumir, detectar cambios | **Gemini 1.5/3.1 Pro (Google AI Studio free tier)** | 2M tokens de contexto — lee el repo entero de LOGAN + la Biblia de Mr. Trámite en una sola llamada; gratis |
| **Marketing** (Etapa 3) | Redacción, análisis, creatividad, hipótesis | **Claude Sonnet (Z.ai) o GPT-4o** | Calidad de copy + razonamiento para hipótesis medibles |

**Recomendación concreta — Etapa 2 (Core funcional):**
- **Core**: Claude Sonnet vía Z.ai free tier. Cuando se agote el tier gratuito, mover a Anthropic API directo (Sonnet 4: $3/M input, $15/M output).
- **Memory**: Gemini 1.5 Pro vía Google AI Studio free tier. Cuando se agote, Gemini API ($0.075/M input para Flash, $1.25/M para 1.5 Pro).
- **Estrategia general**: Permanecer en tiers gratuitos durante las Etapas 2 y 3 (DEC-LOGAN anterior: "retrasar el gasto lo más posible"). Pagar solo cuando Mr. Trámite genere ingresos (Etapa 4).

**Por qué esta combinación pasa la prueba de los 10 años:**
- Independencia del proveedor (Art. III-extendida): las instrucciones viven en texto; Core y Memory se pueden cambiar de modelo con un edit de configuración.
- Especialización por capacidad (no por marca): Core usa el mejor razonador; Memory usa el mejor contexto-largo. No hay lealtad ciega a una marca.
- Costo cero mientras no haya ingresos: alinea con DEC-LOGAN-001 (marca al final) y DEC-LOGAN-002 (dominio comercial primero).

**Decisión registrada:** DEC-LOGAN-006 (§13.2 abajo).

#### Q3 — Primer producto: Mr. Trámite ✓
**Confirmado.** Mr. Trámite es el primer producto. Hércules Bro el segundo. La Etapa 3 (LOGAN Marketing) trabajará primero sobre Mr. Trámite. Registrado en ECOSYSTEM.md.

#### Q4 — Presupuesto primera campaña de Meta: $1,000–1,500 MXN ($60–100 USD)
**Rango confirmado.** Es un presupuesto pequeño, pero suficiente para validar hipótesis (no para escalar). LOGAN Marketing deberá:
- Proponer un reparto por 3–5 días ($20–33 USD/día).
- Una sola audiencia, una sola plataforma (Meta).
- Dos variantes de copy (A/B) — cada una con su hipótesis.
- Predicción medible explícita (CTR esperado, CPC máximo, conversiones mínimas).

**Decisión registrada:** DEC-LOGAN-007 (§13.2 abajo).

#### Q5 — La app web es prototipo hasta mínimo construir el primer agente
**Confirmado.** La app web LOGAN OS actual es **prototipo** (vista operacional del diseño) hasta que se construya el primer agente funcional. La decisión sobre si la app se queda como vista permanente del Core en producción, o el Core vive como servicio y la app queda como dashboard, se toma al cerrar la Etapa 2.

**Decisión registrada:** DEC-LOGAN-008 (§13.2 abajo).

#### Q6 — Cada producto tiene su repo GitHub propio
**Confirmado.** Estructura:
- `github.com/appsmx/logan` — el ecosistema (Constitución + LOGAN OS + roles + ECOSYSTEM.md). Repositorio principal, fuente de autoridad.
- `github.com/appsmx/mrtramite` — el primer producto. Su Biblia (`Biblia_MrTramite.md`) y sus SESSION_CONTEXTs viven aquí.
- `github.com/appsmx/hercules-bro` — el segundo producto. Igual.

**Hosting**: una sola cuenta de ilimitadohost.com cubre hosting + dominios + SSL + correo para todos. **Repositorios**: separados. Esto respeta el Art. IV (una única fuente de verdad: el repo del producto contiene SU Biblia; el repo de LOGAN contiene la metodología) y el Art. V (separación clara: cada repo tiene su responsabilidad).

### 13.2 Nuevas decisiones estratégicas registradas

#### DEC-LOGAN-005 — Hosting: ilimitadohost.com + registrar mrtramite.mx primero
**Problema:** Dónde registrar dominios y hosting manteniendo costo bajo (~$30 USD/año) y presencia local para Mr. Trámite.
**Alternativas:** (a) ilimitadohost.com con .mx; (b) Neubox 100% mexicano; (c) Hostinger Mexico; (d) registrar .com en lugar de .mx.
**Decisión:** ~~ilimitadohost.com + registrar `mrtramite.mx` primero (no .com). Backup: Neubox.~~ **CORREGIDA por DEC-LOGAN-012** — ilimitadohost.com NO soporta dominios .mx directamente (error de investigación previa).
**Justificación:** ~~ilimitadohost soporta .mx y está en el rango de precio.~~ **Ver DEC-LOGAN-012 para la decisión actual.**
**Consecuencias:** ~~Se necesita crear la cuenta de ilimitadohost y registrar mrtramite.mx antes del lanzamiento de Etapa 4.~~ Ver DEC-LOGAN-012.
**Fecha:** 2026-07-29 · **Corregida:** 2026-08-01 (ver DEC-LOGAN-012)

#### DEC-LOGAN-006 — Proveedores de IA: Claude Sonnet (Core) + Gemini 1.5 Pro (Memory) vía tiers gratuitos
**Problema:** Qué proveedor de IA usar para Core y Memory maximizando coste/beneficio.
**Alternativas:** (a) OpenAI GPT-4o para todo; (b) Claude para todo; (c) Gemini para todo; (d) Claude para Core + Gemini para Memory (recomendada); (e) modelo open-source auto-alojado.
**Decisión:** Core en Claude Sonnet vía Z.ai free tier; Memory en Gemini 1.5 Pro vía Google AI Studio free tier. Migrar a APIs pagas solo cuando Mr. Trámite genere ingresos.
**Justificación:** Core necesita el mejor razonamiento (delegación, validación constitucional) → Claude Sonnet. Memory necesita el mayor contexto (leer repos enteros) → Gemini 1.5 Pro con 2M tokens. Ambos tienen tiers gratuitos. La combinación es especialización por capacidad, no lealtad de marca. Cambiar de proveedor es barato porque las instrucciones viven en texto (independencia del proveedor, STANDARDS.md §4).
**Consecuencias:** Etapa 2 y 3 a costo $0. Cuando los tiers gratuitos se agoten, presupuesto de APIs: estimación < $20 USD/mes para volumen Etapa 3. LOGAN OS queda listo para migrar a cualquier proveedor sin reescribir la arquitectura.
**Fecha:** 2026-07-29

#### DEC-LOGAN-007 — Presupuesto primera campaña de Meta: $60–100 USD ($1,000–1,500 MXN)
**Problema:** Cuánto invertir en la primera campaña de Meta para validar la hipótesis de Marketing de Mr. Trámite.
**Alternativas:** (a) No invertir (solo orgánico); (b) $20 USD (muestra chica no significativa); (c) $60–100 USD (suficiente para A/B con 2 variantes y 3–5 días); (d) $500+ USD (escalar antes de validar).
**Decisión:** $60–100 USD para la primera campaña, distribuidos en 3–5 días, dos variantes de copy A/B, una audiencia, predicción medible explícita.
**Justificación:** El objetivo de la primera campaña NO es escalar, es **validar la hipótesis** (DEC-LOGAN-004: el bucle de hipótesis es el diferenciador). $60–100 USD es suficiente para que el CTR observado sea estadísticamente meaningful como para verificar o refutar la hipótesis "este mensaje atrae más clics porque el usuario percibe menor riesgo al pagar después del trámite". Si se refuta, LOGAN aprende con $100, no con $500.
**Consecuencias:** Marketing deberá proponer el reparto concreto. La verificación de la hipótesis corre por Analytics (o por el humano mientras Analytics no exista). El resultado de esta campaña alimenta el bucle de aprendizaje de LOGAN — el activo real.
**Fecha:** 2026-07-29

#### DEC-LOGAN-008 — La app web LOGAN OS es prototipo hasta que el primer agente (Core) esté construido
**Problema:** Si la app web actual (que ya operacionaliza el diseño) es la vista operacional permanente o un prototipo.
**Alternativas:** (a) Prototipo hasta Etapa 2 (Core funcional); (b) vista permanente en producción desde ya; (c) descartar la app y dejar todo en el repo.
**Decisión:** La app es prototipo hasta que se construya LOGAN Core (Etapa 2). La decisión sobre si la app se queda como vista permanente del Core en producción, o el Core vive como servicio independiente, se toma al cerrar Etapa 2.
**Justificación:** La app actual es la vista del *diseño*. Una vista en producción de un sistema que aún no tiene su pieza central (Core) sería una promesa vacía. La simplicidad (Art. III) indica no decidir la arquitectura de producción antes de tener el componente que la define.
**Consecuencias:** La app se mantiene como está (sin nuevas secciones) hasta Etapa 2. Cuando Core exista, se re-decide. La extensión pendiente (sección Ecosistema, hoja de ruta, mandatos) se posterga hasta esa decisión.
**Fecha:** 2026-07-29

### 13.3 Estado de la Etapa 1

La Etapa 1 (LOGAN OS interno, no público) queda **cerrada** cuando los seis documentos (LOGAN_OS, COMMUNICATION, MEMORY, STANDARDS, ECOSYSTEM, ROLES + VISION) pasen la lista de verificación del LOGAN §6.1. La auditoría se aplica a continuación.

#### Auditoría de los 6 documentos (LOGAN §6.1)

| Criterio | LOGAN_OS | COMM | MEM | STAND | ECO | ROLES | VISION |
|---|---|---|---|---|---|---|---|
| Coherencia constitucional | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Coherencia decisional | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ausencia de contradicciones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Simplicidad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documentación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cumplimiento del objetivo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Separación correcta | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Resultado:** 7/7 en los 7 documentos. La Etapa 1 queda cerrada.

### 13.4 ECOSYSTEM.md — actualización con las decisiones de cierre

El draft de §6.6 se actualiza con:
- Decisiones DEC-LOGAN-005 a 008 añadidas a la §5 (Decisiones estratégicas).
- Tabla de dominios actualizada: `mrtramite.mx` pasa de "Pendiente" a "Por registrar en ilimitadohost.com (DEC-LOGAN-005)".
- Tabla de agentes actualizada: proveedor de IA anotado (Core: Claude/Z.ai; Memory: Gemini/Google AI Studio — DEC-LOGAN-006).
- Hitos añadidos: "2026-07-29 — Cierre de Etapa 1. 7 documentos pasan auditoría. 8 decisiones estratégicas registradas (DEC-LOGAN-001 a 008)."

---

## 14. Etapa 2 — LOGAN Core funcional (especificación, sin código todavía)

La Etapa 1 cerró. La Etapa 2 es construir LOGAN Core. Esta sección **especifica** lo que se construirá; el código se ejecuta en la próxima sesión, con tu luz verde.

### 14.1 Qué es "LOGAN Core funcional"

El criterio de salida (§7 Etapa 2) era: *Core puede leer una solicitud + el reporte de Memory + decidir a qué especialista delegar + emitir un mandato + integrar el entregable + validar contra la Constitución.*

Para llegar ahí, el MVP más simple (Art. III) de Core es:

```
Usuario → [mensaje] → POST /api/core
                        ↓
                 Core (Claude Sonnet vía Z.ai)
                        ↓
                 1. Lee system prompt:
                    - Constitución (LOGAN.md)
                    - LOGAN_OS.md
                    - ROLES.md
                    - STANDARDS.md
                    - Biblia del proyecto activo
                    - SESSION_CONTEXT actual
                 2. Decide:
                    - ¿Necesito a Memory? (sí, si falta contexto)
                    - ¿Necesito a un especialista? (cuál)
                    - ¿O respondo directamente?
                 3. Ejecuta la decisión:
                    - Si Memory: llama a /api/memory/prepare → recibe Reporte
                    - Si especialista: llama a /api/<rol>/execute → recibe Entregable + Hipótesis
                    - Si directo: responde
                 4. Integra:
                    - Combina la respuesta en una sola voz LOGAN
                    - Valida contra la Constitución (chequeo automático)
                    - Registra cualquier hipótesis nueva
                    - Actualiza SESSION_CONTEXT
                 5. Retorna al usuario:
                    - Una sola respuesta coherente
                    - (Opaque al usuario: qué rol participó, qué hipótesis se registraron)
```

### 14.2 Arquitectura técnica del MVP de Core

- **Endpoint**: `POST /api/core` en la app Next.js actual (z-ai-web-dev-sdk en backend, Art. del sistema: z-ai-web-dev-sdk MUST be backend).
- **Llamada a Claude**: vía `z-ai.chat.completions.create` (Z.ai SDK ya configurado en el proyecto).
- **System prompt**: construido en runtime desde los archivos del repo + la Biblia del proyecto activo (vía Prisma) + SESSION_CONTEXT (vía Prisma).
- **Herramientas (function calling)**:
  - `memory.prepare` → genera el Reporte (en el MVP, un resumen simple del estado del proyecto).
  - `marketing.execute` → (Etapa 3) llamado al especialista Marketing.
  - `decisiones.registrar` → crea un DEC-XXX si Core tomó una decisión importante.
  - `hipotesis.registrar` → crea un HIP-XXX si un especialista devolvió una hipótesis.
- **Validación constitucional automática**: un segundo prompt más corto que recibe la respuesta propuesta + los 10 artículos y devuelve `aprobada` o `desacuerdo fundamentado` (Art. VII).
- **Persistencia**: cada sesión de Core actualiza `SESSION_CONTEXT` en la BD (Prisma).

### 14.3 Lo que NO se construye en Etapa 2 (Art. III — simplicidad)

- No se construyen Dev, Design, Analytics, Finance, Legal, Support como agentes funcionales. Siguen "planificados".
- No se construye Marketing aún. Se deja el hook `marketing.execute` listo pero stub (return "Marketing no disponible hasta Etapa 3").
- No se construye UI nueva. La app actual es prototipo (DEC-LOGAN-008). La interacción con Core es vía el endpoint `POST /api/core` (testeable con curl, no con UI).
- No se migra a APIs pagas (DEC-LOGAN-006).

### 14.4 Criterio de salida de Etapa 2

Core está "funcional" cuando:
1. `POST /api/core` con un mensaje de usuario del proyecto Mr. Trámite retorna una respuesta coherente en voz LOGAN.
2. Si el mensaje necesita contexto, Core invoca `memory.prepare` y la respuesta lo refleja.
3. Si el mensaje necesita una decisión importante, Core registra un DEC-XXX en la BD.
4. La respuesta pasa la validación constitucional automática.
5. SESSION_CONTEXT se actualiza con la sesión.

### 14.5 Prueba de los 10 años (aplicada a la decisión de construir Core así)

| Decisión | ¿Pasa? | Por qué |
|---|---|---|
| Core como endpoint único en la app existente (no servicio aparte) | **Sí, por ahora** | Simple (Art. III). Reversible: cuando Core crezca, se extrae a mini-servicio. Documentar como punto de revisión. |
| Function calling (no orquestación custom) | **Sí** | Estándar de la industria; sobrevive a cambios de proveedor (cualquier LLM moderno lo soporta). |
| Validación constitucional como segundo prompt | **Sí** | Es el Art. IX operacionalizado. Si el validador detecta desacuerdo, se registra. Sin esto, Core podría violar la Constitución sin que nadie se entere. |
| Stub `marketing.execute` | **Sí** | Permite construir Core sin esperar a Marketing. Cuando Marketing exista (Etapa 3), se reemplaza el stub. |
| No UI nueva en Etapa 2 | **Sí** | La app es prototipo (DEC-LOGAN-008). La UI se decide con el Core ya funcionando. |

### 14.6 Lo que necesito de ti para arrancar Etapa 2

1. **Luz verde** para construir Core en la próxima sesión.
2. **Confirmación del proveedor**: ¿Claude Sonnet vía Z.ai para Core, Gemini 1.5 Pro vía Google AI Studio para Memory — avanzamos con eso, o prefieres otro combination?
3. **¿Quién será el "Memory humano" hasta que Memory agente exista?** En el MVP de Core, `memory.prepare` puede ser: (a) un resumen automático del proyecto + session_context desde la BD (simple, recomendado), o (b) tú pegando manualmente el contexto. Recomiendo (a).

Con eso, en la próxima sesión construyo Core. Esta sesión queda cerrada aquí.

*LOGAN · Learning, Organization, Governance, Architecture & Navigation*

---

## 15. Tres actualizaciones estratégicas (post-cierre Etapa 1, pre-Etapa 2)

**Fecha:** 2026-07-29 (misma sesión, post-confirmación)
**Contexto:** el usuario confirma luz verde + combo + (a), y plantea tres cosas importantes que el arquitecto (Art. IX) debe procesar antes de construir Core.

### 15.1 Confirmación: LOGAN es multi-agente
El usuario confirma: LOGAN está conformado por múltiples agentes (Core, Memory, Marketing, Dev, Design, Analytics, Finance, Legal, Support), no solo Marketing. Marketing es el primero porque genera valor económico inmediato para hacer crecer las ventas de los productos.

La estructura de repositorio canónica (confirmada por el usuario):
```
LOGAN/
├── constitution/LOGAN.md
├── os/ (LOGAN_OS, communication, delegation, memory, standards)
├── roles/ (core, marketing, memory, dev, design, analytics, finance, legal, support)
├── templates/ prompts/ examples/ docs/ changelog/
```

### 15.2 Nueva oportunidad: Sistema de Venta para Productores Musicales
El usuario detectó una nueva oportunidad: un Sistema de Venta para Productores Musicales desarrollado bajo LOGAN. Sus 8 módulos:
- Asistente IA · Catálogo · Pagos · Licencias · Clientes · Alertas · Estadísticas · Automatizaciones

**Mapeo de los 8 módulos a los 9 roles existentes:**

| Módulo | Rol(es) que lo construyen/operan |
|---|---|
| Asistente IA | **Core** (la interfaz conversacional) |
| Catálogo | Dev + Design |
| Pagos | Finance + Legal + Dev |
| Licencias | Legal |
| Clientes | Dev (CRM) + Support |
| Alertas | Dev |
| Estadísticas | Analytics |
| Automatizaciones | Dev + Core (orquestación) |

**Conclusión:** los 9 roles existentes cubren los 8 módulos. **La arquitectura es robusta; no se necesita un nuevo rol para este producto.** Posición en la hoja de ruta: TERCER producto candidato (después de Mr. Trámite y Hércules Bro). No es un tier de LOGAN; es un producto con su propio repo, su propia Biblia, su propio dominio.

### 15.3 Mi opinión sobre "LOGAN OS con niveles" (Creator/Business/Pro/Enterprise)

La recomendación de la otra IA tiene **un núcleo de verdad envuelto en un encuadre prematuro.**

**El núcleo de verdad:** productos modulares con módulos reutilizables es la idea correcta. Los 8 módulos del sistema musical no son específicos de la música — Mr. Trámite necesitará Pagos; Hércules Bro necesitará Clientes. Los módulos deben vivir en `templates/` y cualquier producto LOGAN puede componerlos.

**La parte prematura:** segmentar LOGAN OS en Creator/Business/Pro/Enterprise **no pasa la prueba de los 10 años**, por tres razones:

1. **No hay producto aún.** Mr. Trámite no está construido. Hércules Bro tampoco. El sistema musical es una idea. Segmentar una familia de productos con cero productos en vivo es diseñar el empaque antes que el producto (violación de DEC-LOGAN-001: marca al final). La segmentación debe emerger de clientes reales, no diseñarse upfront.

2. **El eje podría ser erróneo.** Creator/Business/Pro/Enterprise segmenta por TAMAÑO de empresa. Pero el sistema musical y Mr. Trámite sugieren que el eje real podría ser VERTICAL (música, trámites, fitness), o MODELO DE NEGOCIO (suscripción SaaS vs servicio por uso), o algo que no vemos. Si bloqueamos "tiers por tamaño" hoy y el eje real es "por vertical", tendremos que arrancarlo. Segmentación prematura es deuda técnica.

3. **Conflata LOGAN OS con los productos.** LOGAN OS es el sistema operativo (una cosa, no segmentada — como iOS no se segmenta). Los productos son las apps (segmentadas, si acaso — como la App Store tiene categorías). El encuadre de la otra IA pone los tiers en la capa equivocada.

**Mi reframe:**
- **LOGAN OS** = el sistema operativo. Una cosa. No segmentada. La Constitución es una; los roles son un solo set; la metodología es una.
- **Productos** = apps construidas sobre LOGAN OS. Cada uno con su repo, su Biblia, su dominio. Mr. Trámite, Hércules Bro, el sistema musical. Estos PODRÍAN segmentarse eventualmente — pero es decisión de Etapa 6, cuando haya suficientes clientes para conocer el eje real.
- **Módulos** = componentes reutilizables (viven en `templates/`). Cualquier producto LOGAN puede componerlos. Los 8 módulos del sistema musical son los primeros candidatos para la librería de módulos.

**Decisión:** posponer los tiers. Construir productos. Capturar el sistema musical como tercer producto candidato.

### 15.4 Nuevas decisiones registradas

#### DEC-LOGAN-009 — El Sistema para Productores Musicales es un TERCER producto, no un tier
**Problema:** Cómo encajar la nueva oportunidad (sistema de venta para productores musicales con 8 módulos) en la arquitectura LOGAN.
**Alternativas:** (a) un tier "Creator" de LOGAN OS; (b) un producto aparte con su propio repo; (c) un módulo de Mr. Trámite; (d) no hacer nada todavía.
**Decisión:** producto aparte, el tercer candidato en la hoja de ruta (después de Mr. Trámite y Hércules Bro). Su propio repo (`github.com/appsmx/<nombre>`), su propia Biblia, su propio dominio cuando esté listo.
**Justificación:** respeta Art. IV (fuente única de verdad) y Art. V (separación clara). Los 9 roles existentes cubren sus 8 módulos — la arquitectura no necesita extenderse. Posponer la decisión de tier hasta Etapa 6.
**Consecuencias:** el producto se añade a ECOSYSTEM.md como candidato. Su nombre comercial lo decide el humano (Art. IX). No se construye nada todavía — Etapa 2 (Core) y Etapa 3 (Marketing) tienen prioridad.
**Fecha:** 2026-07-29

#### DEC-LOGAN-010 — Posponer el tiering de LOGAN OS; los tiers (si existen) aplican a productos, no al OS
**Problema:** Si LOGAN OS debe tener niveles (Creator/Business/Pro/Enterprise) como recomendó una IA externa.
**Alternativas:** (a) implementar tiers ahora; (b) posponer tiers; (c) descartar tiers permanentemente.
**Decisión:** posponer. Si los tiers existen en el futuro, aplican a PRODUCTOS, no a LOGAN OS. La decisión se toma en Etapa 6, cuando haya clientes reales para conocer el eje real de segmentación.
**Justificación:** segmentar antes de tener productos falla la prueba de los 10 años (eje posiblemente erróneo, empaque antes que producto). LOGAN OS es el sistema operativo (uno, no segmentado); los productos son las apps. Conflatar las capas es un error de arquitectura.
**Consecuencias:** LOGAN OS queda como una sola cosa. Los productos se construyen independientes. Los módulos reutilizables viven en `templates/`. Esta decisión se reabre en Etapa 6 con evidencia.
**Fecha:** 2026-07-29

#### DEC-LOGAN-011 — Los módulos de producto viven en `templates/` para reutilización
**Problema:** Dónde viven los componentes de producto reutilizables (Asistente IA, Catálogo, Pagos, Licencias, Clientes, Alertas, Estadísticas, Automatizaciones) para que cualquier producto LOGAN pueda componerlos.
**Alternativas:** (a) cada producto reimplementa sus módulos; (b) módulos en una librería compartida `templates/`; (c) módulos como microservicios separados.
**Decisión:** `templates/` en el repo de LOGAN. Los módulos son especificaciones (Markdown + prompts + esquemas) que cualquier producto puede instanciar. La implementación concreta vive en el repo del producto.
**Justificación:** reutilización sin acoplamiento (Art. IV — cada producto sigue siendo dueño de su implementación). Simplicidad (Art. III) — empezar con especificaciones, no con código compartido prematuro. Sobrevive 10 años porque las especificaciones son texto, independientes del proveedor y del stack.
**Consecuencias:** cuando un producto necesite un módulo, copia la plantilla de `templates/` y la adapta. Cuando un patrón se repita en 3+ productos, se promueve a `templates/`. El sistema musical aporta sus 8 módulos como las primeras plantillas candidatas.
**Fecha:** 2026-07-29

#### DEC-LOGAN-012 — CORRECCIÓN: hosting-mexico.net (no ilimitadohost) para dominios .mx
**Problema:** DEC-LOGAN-005 recomendó ilimitadohost.com basada en información incorrecta. El usuario verificó que ilimitadohost.com NO ofrece dominios .mx directamente (la confusión provino de una marca blanca distinta, "hostilimitado.com", que sí los ofrece pero no es ilimitadohost).
**Alternativas:** (a) mantener ilimitadohost y registrar solo .com; (b) migrar a hosting-mexico.net (100% mexicano, con .mx); (c) migrar a Neubox (100% mexicano, con .mx); (d) usar dos proveedores (ilimitadohost para hosting, otro para dominio .mx).
**Decisión:** **hosting-mexico.net** como proveedor único de hosting + dominio .mx. Backup: Neubox. ilimitadohost descartado.
**Justificación:** hosting-mexico.net SÍ soporta .mx y .COM.MX directo, es 100% mexicano (alinea con la presencia local de un trámite mexicano), precio comparable (~$500 MXN + IVA anual hosting + $240 MXN + IVA promo .COM.MX primer año). Centralizar hosting + dominio en un solo proveedor simplifica administración (Art. III — simplicidad). El usuario verificó la disponibilidad de .mx en su sitio.
**Consecuencias:** la cuenta se crea en hosting-mexico.net, no en ilimitadohost. El dominio `mrtramite.mx` (o `mrtramite.com.mx`) se registra ahí. La administración (SSL, correo, DNS) se centraliza en esa cuenta. Esta decisión reemplaza la parte de proveedor de DEC-LOGAN-005 (la parte de "registrar mrtramite.mx primero" se mantiene).
**Fecha:** 2026-08-01
**Corrige:** DEC-LOGAN-005 (parcialmente — solo el proveedor; el principio de "registrar mrtramite.mx primero" se mantiene).

#### DEC-LOGAN-015 — Proveedor final: Neubox (validación primer año, migración año 2)
**Problema:** DEC-LOGAN-012 dejó abierta la elección entre hosting-mexico.net y Neubox. El usuario analizó los precios reales y pidió decisión final.
**Alternativas:** (a) hosting-mexico.net (~$78 USD primer año, renovación similar); (b) Neubox (~$11 USD primer año, ~$48 USD renovación); (c) hosting-mexico.net con promo .mx $300 (~$51 USD primer año).
**Decisión:** **Neubox** para el primer año. Migración a hosting-mexico.net en año 2 si Mr. Trámite despega (migración de dominio entre registradores es trivial).
**Justificación:** costo primer año ~$11 USD vs ~$78 USD. Para validar el modelo de Mr. Trámite (0 clientes → primeros clientes), el costo bajo es prioritario. Si Mr. Trámite funciona, la renovación de Neubox (~$48 USD) sigue siendo más barata que hosting-mexico.net (~$78 USD). Si Mr. Trámite crece mucho y requiere mejor soporte/estabilidad, se migra. La simplicidad (Art. III) favorece empezar barato.
**Consecuencias:** el usuario crea cuenta en Neubox (no hosting-mexico.net). Registra mrtramite.mx ahí. Migración futura es trivial. Esta decisión reemplaza la parte de proveedor de DEC-LOGAN-012.
**Fecha:** 2026-08-02
**Corrige:** DEC-LOGAN-012 (parcialmente — solo el proveedor; el principio de "100% mexicano con .mx directo" se mantiene, Neubox también lo cumple).

#### DEC-LOGAN-016 — logancorp.mx como dominio corporativo + página showcase ilustrativa
**Problema:** `logan.mx` no está disponible. Además, se necesita definir qué ES la página corporativa de LOGAN: ¿es un producto SaaS, o es un portfolio/showcase?
**Alternativas:** (a) buscar otro dominio para "LOGAN" como SaaS; (b) usar `logancorp.mx` como página showcase ilustrativa para ventas B2B; (c) no tener página corporativa todavía.
**Decisión:** **`logancorp.mx`** como dominio corporativo. La página será **meramente ilustrativa** — un showcase/portfolio futurista e innovador, NO un producto SaaS. Su función: cuando el usuario se presente con compañías a ofrecer servicios de sistematización y digitalización, les mostrará la página de LOGAN que incluirá enlaces a las páginas/aplicaciones/proyectos de los que LOGAN se ha hecho cargo (Mr. Trámite, Hércules Bro, futuros clientes). Diseño: muy innovador y futurista para llamar la atención desde el momento de ingreso.
**Justificación:**
- `logan.mx` no disponible — `logancorp.mx` transmite "corporación" (alinea con DEC-LOGAN-001: marca corporativa al final, pero la página puede existir como portfolio antes).
- Página showcase, no SaaS: LOGAN no se vende como producto directamente todavía (DEC-LOGAN-001). Se vende como servicio personalizado (el usuario presenta LOGAN a compañías). La página es el "business card digital" — demuestra capacidad sin ser un self-service SaaS.
- Diseño futurista: el diferenciador visual capta atención en la primera impresión, crítico para ventas B2B donde el usuario tiene 30 segundos para interesar al cliente.
- Enlaces a proyectos: prueba social. Mostrar Mr. Trámite funcionando vale más que cualquier pitch deck.
**Consecuencias:**
- El dominio a registrar en Neubox es `logancorp.mx` (no `logan.mx`).
- La página logancorp.mx debe diseñarse como showcase interactivo: hero futurista, animaciones, enlaces a proyectos LOGAN (mrtramite.vercel.app, futuros), explicación visual del ecosistema de 9 roles, bucle de hipótesis, Constitución.
- La página NO tiene login, NO tiene self-service. Es puramente informativa + visual.
- Deploy en Vercel (DEC-LOGAN-013: Vercel Pro) + dominio apuntando vía CNAME desde Neubox.
- Esta página puede construirse cuando LOGAN tenga su primer caso de éxito público (Mr. Trámite con clientes) para que el "portfolio" tenga sustancia.
**Fecha:** 2026-08-08
**Corrige:** DEC-LOGAN-005/012/015 (parcialmente — cambia `logan.mx` por `logancorp.mx` como dominio corporativo).

#### DEC-LOGAN-017 — Mix de modelos GLM-5.2 / 5.1 / 5-turbo según criticidad de tarea
**Problema:** Tras el deploy en `logancorp.vercel.app` (Task 32-33, agosto 2026), el `TASK_MODEL_MAP` del cliente LLM asignaba `gemini-2.5-flash` a las 12 tareas por defecto. Esto no reflejaba el mix real que se quería: Core + Dev necesitan máxima calidad (equivalente Claude Sonnet), mientras que tareas customer-facing (Assistant, Showcase) y rutinarias (Validator, Marketing, Finance, Support) priorizan velocidad y costo. No existía una decisión formal que documentara el mix.
**Alternativas:** (a) usar un solo modelo para todo (GLM-4.6 era el candidato pre-5.x); (b) asignar GLM-5.2 a las 12 tareas (calidad máxima en todo, pero caro y lento); (c) mapear por tarea según criticidad — 3 tiers de calidad.
**Decisión:** Tres tiers de calidad mapeados a las 12 tareas LLM del ecosistema:
- **GLM-5.2 (máxima calidad, nivel Claude Sonnet):** `core_decide`, `core_integrate`, `dev`. Estas son las tareas donde LOGAN necesita razonar más profundo — decidir a quién delegar, integrar entregables de múltiples especialistas en una sola voz coherente, y generar código production-grade.
- **GLM-5.1 (buena calidad):** `design`, `analytics`, `legal`. Tareas que requieren precisión y cumplimiento (un análisis legal con errores es peligroso), pero no son críticas para la coordinación del ecosistema.
- **GLM-5-turbo (rápido y barato):** `validator`, `marketing`, `finance`, `support`, `assistant`, `showcase`. Tareas customer-facing sensibles a latencia (Assistant y Showcase responden a clientes en tiempo real) y tareas internas donde la velocidad > profundidad (Validator ya corre en paralelo + fire-and-forget desde Task 30).
**Justificación:**
- **Costo-eficiencia:** GLM-5-turbo cuesta una fracción de GLM-5.2 por token. Customer-facing recibe cientos de requests al día (especialmente si WhatsApp Cloud API está conectado a un producto); usar GLM-5.2 ahí quemaría créditos sin valor agregado.
- **Latencia:** el flujo crítico de Core (3 llamadas LLM secuenciales cuando hay delegación) ya toma 15-25s. Mover Validator y Marketing a GLM-5-turbo reduce ~3-5s del turno total sin pérdida perceptible de calidad.
- **Calidad donde importa:** Dev generando código de producción y Core decidiendo/integrando son los lugares donde un error cuesta caro (bug en producción, decisión equivocada). Ahí GLM-5.2 se justifica.
- **Fallback automático:** si `ZAI_API_KEY` no está configurada o sin créditos, `getLLMConfigWithFallback(task)` cae a `gemini-2.0-flash` (Google AI Studio free tier). El ecosistema sigue funcionando, aunque con calidad degradada uniforme.
**Consecuencias:**
- `src/lib/llm/config.ts` es el único punto de configuración del mix. Editar ese archivo para cambiar el mapeo. Documentado con comentarios sobre las justificaciones.
- Vercel Pro (DEC-LOGAN-013) se vuelve más urgente — GLM-5.2 tiene latencias altas; los 10s del tier free pueden no bastar para `core_decide`. Mientras tanto, los turnos sin delegación (1 sola llamada LLM) sí caben en 10s.
- Si Z.ai lanza GLM-6.x en el futuro, el mix se reevalúa bajo la misma lógica de tiers. Esta decisión no ata a modelos específicos, sino al principio de "3 tiers de calidad según criticidad".
- El fallback Gemini es uniforme (no respeta tiers) — esto es aceptable porque Gemini Flash es razonable para todo. Si en el futuro se quiere un fallback que respete tiers, se requiere un mapeo equivalente para Gemini.
**Fecha:** 2026-08-12
**Corrige:** ninguna (formaliza una práctica que ya operaba sin decisión registrada).

#### DEC-LOGAN-013 — Vercel Pro ($20 USD/mes) para producción de LOGAN OS
**Problema:** Vercel Hobby (free) tiene timeout de 10s en funciones serverless, insuficiente para el flujo de 3 llamadas LLM de LOGAN (Core → Marketing → Core integra + validador = 30-50s por turno delegado).
**Alternativas:** (a) Vercel Pro $20/mes (timeout 60s); (b) self-host en VPS (~$5-10/mes, administración manual); (c) optimizar el flujo a <10s (trabajo de desarrollo); (d) quitar la delegación a Marketing en producción.
**Decisión:** Vercel Pro $20/mes cuando LOGAN OS se publique en logan.mx.
**Justificación:** timeout de 60s cubre el flujo de 3 llamadas. Sin administración de servidor (Art. III — simplicidad). Integración nativa con GitHub (deploy automático en push). SSL wildcard gratis. CDN global. El costo se cubre con los primeros 2-3 clientes de Mr. Trámite ($800 × 3 = ~$130 USD/mes).
**Consecuencias:** presupuesto fijo de $20 USD/mes desde el deploy en producción. Se activa cuando se publique LOGAN en logan.mx (Etapa 6) o antes si decides desplegar LOGAN para uso personal desde Etapa 4. Durante la construcción (Etapas 4-5) seguimos en sandbox/localhost — $0.
**Fecha:** 2026-08-01

#### DEC-LOGAN-018 — Adquisición preventiva de logancorp.mx sin lanzamiento de marca
**Problema:** El usuario quiere adquirir el dominio `logancorp.com`, pero está registrado desde 1997 (no disponible). Queda la alternativa `logancorp.mx` (DEC-LOGAN-016 original, disponible). Adicionalmente, el usuario pregunta si comprar el dominio puede ser contraproducente o no rentable dado que LOGAN no tiene clientes pagando todavía (Mr. Trámite en vivo sin ingresos, Mariscos Quiroa recién lanzado, Etapa 5/6 sin iniciar).
**Alternativas:**
- (a) **Compra preventiva de logancorp.mx hoy, sin lanzar marca.** Asegura el activo (~$11 USD), apunta el dominio al Vercel actual, pero NO se hace campañas con la marca LOGAN ni branding público hasta que Mr. Trámite valide el modelo con 5+ clientes.
- (b) **Esperar a validar primero.** No comprar nada hasta que Mr. Trámite tenga 3+ clientes pagando. Riesgo: alguien más podría comprar `logancorp.mx` en esos 3-6 meses.
- (c) **Lanzar marca ya.** Comprar múltiples TLDs (logancorp.mx, logancorp.ai, logancorp.org, etc.), hacer SEO, contenido, redes sociales, campañas Meta con marca LOGAN. Va contra DEC-LOGAN-001.
- (d) **No comprar dominio nunca.** Quedarse con `logancorp.vercel.app` (subdominio gratis) indefinidamente.
**Decisión:** **(a) Compra preventiva de logancorp.mx hoy, sin lanzamiento de marca.**
**Justificación:**
- **Costo-riesgo favorable:** $11 USD primer año (~$200 MXN). Si LOGAN nunca despega, el costo hundido es marginal. Si LOGAN despega y alguien más compró el dominio, recuperar cuesta $500-2000 USD o más (con un dueño especulador).
- **Alineación con DEC-LOGAN-001:** la marca corporativa se LANZARÁ al final (después de productos exitosos), pero el dominio puede asegurarse antes sin lanzamiento público. El dominio parqueado apuntando al showcase de Vercel no es "lanzamiento" — es protección del activo.
- **Alineación con DEC-LOGAN-016:** la decisión original ya establecía `logancorp.mx` como dominio corporativo. Esta decisión solo operacionaliza la compra.
- **Timeline realista:** con 5+ clientes pagando Mr. Trámite (~$4,000 MXN/mes), el branding formal puede empezar. Mientras tanto, el showcase en `logancorp.mx` (parqueado) es un business card digital pasivo, no una campaña.
- **Prueba de los 10 años:** ✓ La compra preventiva sobrevive 10 años porque protege un activo permanente (dominio = identidad corporativa) sin comprometer capital significativo.
**Consecuencias:**
- Comprar `logancorp.mx` en Neubox (~$11 USD primer año, ~$48 USD renovación anual).
- Configurar DNS Neubox → Vercel: registro CNAME `www.logancorp.mx` → `cname.vercel-dns.com`, y registro A `logancorp.mx` → `76.76.21.21` (o el IP que indique Vercel).
- Añadir el dominio custom en Vercel (Settings → Domains) y verificar.
- **NO hacer** campañas Meta Ads con marca LOGAN hasta Etapa 6 (DEC-LOGAN-001 respetado).
- **NO hacer** SEO agresivo hasta tener casos de éxito públicos (Mr. Trámite con clientes).
- Renovación anual: evaluar cada año si LOGAN sigue siendo viable antes de pagar $48 USD.
- Mariscos Quiroa y Mr. Trámite siguen siendo los productos comerciales prioritarios; logancorp.mx es el paraguas corporativo, no un producto.
**Fecha:** 2026-08-13
**Corrige:** ninguna (operacionaliza DEC-LOGAN-016, agrega la dimensión estratégica de "compra preventiva sin lanzamiento").

#### DEC-LOGAN-019 — Confirmación de logancorp.mx como dominio corporativo (vs .com)
**Problema:** El usuario intentó comprar `logancorp.com`, pero está registrado desde 1997 (no disponible). Quedan varias alternativas (logancorp.mx, logancorp.ai, logancorp.org, logancorp.io, logancorp.app, logancorp.dev, logancorp.studio, logancorpmx.com). ¿Cuál elegir?
**Alternativas:**
- (a) `logancorp.mx` — DEC-LOGAN-016 original, $11 USD, 100% mexicano, Neubox.
- (b) `logancorp.ai` — más on-brand con enfoque IA, ~$80 USD/año.
- (c) `logancorp.org` — serio, global, ~$15 USD.
- (d) `logancorpmx.com` — variante .com con sufijo `mx`, ~$11 USD.
**Decisión:** **(a) `logancorp.mx`** (confirmando DEC-LOGAN-016).
**Justificación:**
- **Alineación con mercado objetivo:** los clientes LOGAN son initially Mexicanos (Mr. Trámite, Mariscos Quiroa en Rosarito BC, Hércules Bro planeado para mercado mexicano). El TLD `.mx` refuerza identidad local.
- **Costo eficiente:** $11 USD primer año vs $80 USD para `.ai`. La diferencia ($69 USD) es mejor invertida en créditos Z.ai o campaña Meta de Mr. Trámite.
- **DEC-LOGAN-015 ya decidió Neubox** como proveedor — `.mx` es su TLD nativo, soporte directo en español, pago en MXN.
- **El `.com` ya estaba tomado** — esta no es una decisión libre, es adaptación a la realidad del mercado de dominios.
- **Prueba de los 10 años:** ✓ `.mx` sigue siendo válido como identidad mexicana en 10 años; incluso puede fortalecerse si el ecosistema LOGAN crece en LatAm.
**Consecuencias:**
- `logancorp.com` queda descartado (no disponible, registrado por terceros desde 1997).
- El dominio canónico de LOGAN Corp será `logancorp.mx` (sin `www`).
- Redirección automática: `www.logancorp.mx` → `logancorp.mx` (Vercel lo maneja).
- Si en el futuro LOGAN busca mercado internacional (USA, LatAm no-MX), se puede complementar con `logancorp.ai` o `logancorp.io` sin cambiar el canonical mexicano.
**Fecha:** 2026-08-13
**Corrige:** DEC-LOGAN-016 parcialmente — confirma `.mx` (que ya estaba decidido) y descarta `.com` (que no estaba disponible).

#### DEC-LOGAN-014 — Repositorio LOGAN público; repositorios de productos privados
**Problema:** Si el repo `github.com/appsmx/logan` debe ser público o privado.
**Alternativas:** (a) LOGAN repo público + productos privados; (b) todo privado; (c) todo público.
**Decisión:** `github.com/appsmx/logan` PÚBLICO. Repositorios de productos (`mrtramite`, `hercules-bro`, y futuros) PRIVADOS.
**Justificación:**
- LOGAN repo público: la metodología LOGAN ya es pública (github.com/appsmx/logan original). Extenderla con LOGAN OS como público alinea con DEC-LOGAN-001 (marca corporativa al final — pero la METODOLOGÍA puede ser pública sin revelar el activo comercial). Recibe contribuciones. Muestra transparencia. Sirve como portfolio de la arquitectura.
- Productos privados: Mr. Trámite, Hércules Bro son activos comerciales. Su código, su Biblia, sus hipótesis verificadas son el foso competitivo. Hacerlos públicos regalaría el valor.
- Art. IV (única fuente de verdad): el repo LOGAN contiene la metodología universal; cada repo de producto contiene SU Biblia. Público/privado respeta esa separación.
**Consecuencias:** al crear el repo github.com/appsmx/logan, marcarlo como Público. Los repos mrtramite y hercules-bro se crean como Privados. Las contribuciones externas a LOGAN son bienvenidas (pull requests); las decisiones estratégicas siguen siendo del humano (Art. IX).
**Fecha:** 2026-08-01

### 15.5 Avance a Etapa 2 — confirmado
El usuario confirma:
1. **Luz verde** para construir Core.
2. **Combo confirmado**: Claude Sonnet vía Z.ai (Core) + Gemini 1.5 Pro vía Google AI Studio (Memory).
3. **Memory automático (a)**: `memory.prepare` devuelve un resumen automático del estado del proyecto + SESSION_CONTEXT desde la BD.

**Próximo paso (esta sesión):** construir LOGAN Core (Etapa 2). Especificación en §14. Criterio de salida en §14.4. La app sigue siendo prototipo (DEC-LOGAN-008) — la interacción con Core es vía `POST /api/core` (testeable con curl), no con UI nueva.

*LOGAN · Learning, Organization, Governance, Architecture & Navigation*
