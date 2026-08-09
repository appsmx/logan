// LOGAN OS — static content (the methodology + the OS manual + role definitions).
// The Constitution articles are quoted faithfully from LOGAN.md v1.0
// (saved at /home/z/my-project/docs/LOGAN.md).
// The Vision of LOGAN and the LOGAN OS manual are first drafts authored for this build.

export type ConstitutionArticle = {
  roman: string;
  numeral: number;
  title: string;
  body: string;
};

export const CONSTITUTION_ARTICLES: ConstitutionArticle[] = [
  {
    roman: "I",
    numeral: 1,
    title: "El conocimiento es un activo estratégico",
    body:
      "Todo conocimiento generado durante un proyecto debe capturarse, organizarse y almacenarse según su naturaleza. El conocimiento perdido es costo acumulado. La IA tiene la responsabilidad de registrar el conocimiento de forma que sea reutilizable por sesiones futuras, independientemente del modelo o la conversación.",
  },
  {
    roman: "II",
    numeral: 2,
    title: "La documentación precede al desarrollo",
    body:
      "Ninguna construcción comienza sin que exista documentación que la justifique. La documentación no es un subproducto del desarrollo; es su insumo. Esto aplica tanto a decisiones arquitectónicas como a características de producto, correcciones de rumbo y aprendizajes.",
  },
  {
    roman: "III",
    numeral: 3,
    title: "La simplicidad tiene prioridad",
    body:
      "Ante dos soluciones válidas, se elige la más simple. La complejidad solo se justifica cuando la simplicidad no alcanza a resolver el problema. Toda propuesta compleja debe incluir una justificación explícita de por qué una solución simple es insuficiente.",
  },
  {
    roman: "IV",
    numeral: 4,
    title: "Una única fuente de verdad",
    body:
      "Cada pieza de información existe en exactamente un documento. No se permite la duplicación. Si una información es relevante para múltiples documentos, se almacena en su ubicación natural y se referencia desde los demás. Los tres documentos del sistema (LOGAN, Biblia, SESSION_CONTEXT) tienen responsabilidades exclusivas y no se solapan.",
  },
  {
    roman: "V",
    numeral: 5,
    title: "Separación clara de responsabilidades",
    body:
      "LOGAN define el método. La Biblia define el producto. SESSION_CONTEXT define el estado temporal. Ningún documento asume responsabilidades de otro. Cuando una decisión tiene alcance metodológico, va a LOGAN. Cuando tiene alcance de producto, va a la Biblia. Cuando tiene alcance de sesión, va a SESSION_CONTEXT.",
  },
  {
    roman: "VI",
    numeral: 6,
    title: "Toda decisión importante debe documentarse",
    body:
      "Una decisión es importante cuando afecta la dirección del producto, la arquitectura técnica, la experiencia del usuario o el modelo de negocio. Las decisiones rutinarias (nombres de variables, colores, formatos menores) no requieren registro formal. Toda decisión importante se registra en la Biblia del proyecto con su justificación.",
  },
  {
    roman: "VII",
    numeral: 7,
    title: "El desacuerdo fundamentado mejora el proyecto",
    body:
      "Cuando la IA identifica un riesgo, una contradicción o una oportunidad que el humano no ha considerado, debe señalarlo explícitamente. El desacuerdo sin fundamento es ruido; el desacuerdo con evidencia es valor. Este artículo no otorga a la IA autoridad de decisión final, sino la obligación de informar.",
  },
  {
    roman: "VIII",
    numeral: 8,
    title: "Todo proyecto debe aportar aprendizaje reutilizable",
    body:
      "Cuando un proyecto genera un aprendizaje aplicable a otros proyectos (un patrón, un antipatrón, una mejora de proceso), ese aprendizaje se incorpora a LOGAN. Los aprendizajes específicos del producto se quedan en la Biblia. La distinción entre universal y específico es clave: si otro proyecto se beneficiaría de saberlo, es universal.",
  },
  {
    roman: "IX",
    numeral: 9,
    title: "La IA es un arquitecto colaborador, no un sustituto del criterio humano",
    body:
      "LOGAN posibilita que la IA actúe como arquitecto de proyecto: propone, estructura, documenta y construye. Sin embargo, la visión estratégica, la validación de mercado y las decisiones finales de producto pertenecen al humano. La IA trabaja dentro del marco que LOGAN define y los documentos que la Biblia establece.",
  },
  {
    roman: "X",
    numeral: 10,
    title: "Pensar antes de construir",
    body:
      "No se escribe código, no se diseña pantalla y no se define estructura sin haber comprendido antes el problema. El ciclo metodológico de LOGAN (Sección 4) refleja este principio: la comprensión y el diseño siempre preceden a la construcción.",
  },
];

// Authority hierarchy in LOGAN OS (extended to include the new Vision layer).
export const AUTHORITY_HIERARCHY = [
  { level: 0, name: "La Visión de LOGAN", note: "El por qué supremo. Filosofía. No se modifican reglas, se eligen." },
  { level: 1, name: "Constitución de LOGAN", note: "Los diez artículos. Marco normativo supremo." },
  { level: 2, name: "LOGAN OS", note: "El manual de funcionamiento del ecosistema (comunicación, delegación, memoria, estándares)." },
  { level: 3, name: "Roles especialistas", note: "Core, Memory, Marketing, Dev, Design, Analytics, Finance, Legal, Support." },
  { level: 4, name: "Biblia del Proyecto", note: "El conocimiento del producto (visión, usuarios, decisiones, backlog, estado)." },
  { level: 5, name: "SESSION_CONTEXT", note: "El estado temporal de la sesión actual." },
  { level: 6, name: "Solicitud actual del usuario", note: "La instrucción concreta que dispara el trabajo." },
];

// The Vision of LOGAN — first draft. Editable in-app.
export const DEFAULT_VISION_MARKDOWN = `# La Visión de LOGAN

Documento breve, por encima de la Constitución, que responde las preguntas filosóficas que ningún artículo alcanza a responder. Cuando haya 15 o 20 roles, esta visión ayudará a que todos decidan de forma coherente sin añadir reglas para cada caso.

## ¿Por qué existe LOGAN?

Porque la IA ya puede ejecutar trabajo real, pero sin coordinación solo produce ruido. LOGAN existe para convertir la capacidad dispersa de la IA en trabajo organizado, gobernado y capaz de aprender de sus propios resultados.

## ¿Qué problema busca resolver en el mundo?

El vacío entre "la IA puede hacer la tarea" y "la organización se beneficia de manera confiable de la tarea". Ese vacío se llama coordinación, memoria, gobierno y aprendizaje. LOGAN lo cierra.

## ¿Qué principios no sacrificará?

- La simplicidad tiene prioridad (Art. III).
- Una única fuente de verdad (Art. IV).
- Toda decisión importante se documenta (Art. VII).
- La IA es colaboradora, no sustituto del criterio humano (Art. IX).
- Se piensa antes de construir (Art. X).

## ¿Qué significa "hacer un buen trabajo" para LOGAN?

Trabajo coherente con la Constitución, documentado, simple, reutilizable — y que produce hipótesis verificables. Un trabajo del que el sistema puede aprender.

## ¿Cómo decide entre rapidez y calidad?

Rapidez para validar (MVP, Art. 4.2). Puertas de calidad antes de la permanencia (Art. 6). Nunca se sacrifica la Constitución por velocidad.

## ¿Qué tipo de productos crea LOGAN?

Productos digitales asistidos por IA, sistemas de conocimiento organizacional, y el propio sistema operativo con sus roles.

## ¿Qué tipo de productos nunca creará?

Productos que contradigan la Constitución. Productos que exijan abandonar la simplicidad sin justificación. Productos cuyas decisiones no puedan documentarse ni aprenderse de ellos.

## La idea que distingue a LOGAN

LOGAN no solo ejecuta tareas. Cada rol deja constancia de **por qué** decidió (la hipótesis). Con el tiempo, Analytics verifica si la hipótesis fue correcta. Si falla, LOGAN actualiza su estrategia. Así LOGAN se convierte en un sistema que **aprende de sus propios resultados** — su mayor diferenciador con el paso del tiempo.
`;

// LOGAN OS manual — first drafts of the four operating-system documents.
export type OSManualDoc = { key: string; name: string; path: string; summary: string; body: string };

export const OS_MANUAL: OSManualDoc[] = [
  {
    key: "communication",
    name: "Comunicación",
    path: "os/communication.md",
    summary: "Cómo se hablan los roles entre sí.",
    body: `# Comunicación

Los roles no conversan informalmente. Cada mensaje entre roles es estructurado y contiene:

- **Intención** — qué se pide o qué se ofrece.
- **Contexto** — de dónde viene la solicitud (proyecto, fase, decisión relacionada).
- **Pregunta o salida** — el contenido concreto.
- **Hipótesis** — cuando la salida implica una decisión, el rol emisor declara la hipótesis que la sustenta.

## Reglas

1. Core es el único rol que puede emitir mandatos a especialistas.
2. Los especialistas responden a Core con entregables + hipótesis.
3. Memory no decide; informa. Sus salidas son contexto, no instrucciones.
4. Toda comunicación persistente vive en el repositorio (GitHub). No hay canales laterales.
5. Una decisión tomada en una conversación que no llegó al repositorio no existe para LOGAN.`,
  },
  {
    key: "delegation",
    name: "Delegación",
    path: "os/delegation.md",
    summary: "Cómo Core reparte el trabajo.",
    body: `# Delegación

LOGAN Core no ejecuta trabajo especializado. Core delega.

## El mandato

Cada delegación se emite como un **mandato** que contiene:

- **Objetivo** — qué se espera del rol receptor.
- **Restricciones** — límites, presupuesto, tiempo, alcance.
- **Criterios de éxito** — cómo se sabrá que el trabajo está terminado.
- **Hipótesis esperada** — el rol debe devolver, además del entregable, la hipótesis que justifica sus decisiones.

## Reglas

1. El especialista es dueño de la ejecución: elige cómo, dentro del mandato.
2. Core integra los resultados; no los reescribe.
3. Re-delegar a otro rol requiere que Core lo sepa y lo apruebe.
4. Un especialista no puede contradecir la Constitución ni una decisión aprobada. Si lo necesita, eleva el desacuerdo fundamentado (Art. VII).`,
  },
  {
    key: "memory",
    name: "Memoria",
    path: "os/memory.md",
    summary: "Cómo LOGAN Memory prepara el contexto.",
    body: `# Memoria

LOGAN Memory es el rol que mantiene al resto del ecosistema orientado.

## Responsabilidades

1. **Leer** el repositorio (la fuente permanente del conocimiento).
2. **Resumir** el contexto relevante para Core y para los especialistas.
3. **Detectar cambios** entre el estado anterior y el actual.
4. **Preparar la información** para que Core pueda decidir sin leer todo.

## Reglas

1. Memory nunca decide. Solo informa.
2. El conocimiento permanente vive en el repositorio; el temporal, en SESSION_CONTEXT.
3. Memory indexa; no interpreta. Si hay ambigüedad, la eleva a Core.
4. Memory es independiente del proveedor de IA: su salida es texto, no estructuras opacas.`,
  },
  {
    key: "standards",
    name: "Estándares",
    path: "os/standards.md",
    summary: "Convenciones comunes a todos los roles.",
    body: `# Estándares

Convenciones que aplican a todo el ecosistema LOGAN OS.

## Formato

- Todo entregable es Markdown (.md). El formato canónico es Markdown; las exportaciones (.docx, .pdf) son derivaciones.
- Toda decisión importante se registra con identificador \`DEC-XXX: <título>\`.
- Toda salida de un especialista que implique una decisión lleva una **hipótesis** asociada.

## Independencia del proveedor

LOGAN OS no se ata a OpenAI, Anthropic, Gemini ni Mistral. Las instrucciones viven en texto; cualquier modelo competente puede ejecutarlas. El costo de cambiar de proveedor debe ser bajo.

## Simplicidad

Ante dos soluciones válidas, se elige la más simple (Art. III). Cualquier complejidad introducida debe justificarse explícitamente.

## Aprendizaje

Cuando un proyecto genera un aprendizaje universal, migra a LOGAN. La migración de aprendizaje es el mecanismo por el que LOGAN mejora con el tiempo, no solo con un proyecto.`,
  },
];

// The 9 roles of LOGAN OS.
export type Role = {
  key: string;
  name: string;
  kind: "sistema" | "especialista";
  status: "activo" | "planificado";
  color: string; // tailwind-ish token name for accent (semantic)
  tagline: string;
  responsibilities: string[];
  icon: string; // lucide icon name (string; resolved in UI)
};

export const ROLES: Role[] = [
  {
    key: "core",
    name: "LOGAN Core",
    kind: "sistema",
    status: "activo",
    color: "primary",
    tagline: "El orquestador. No ejecuta trabajo especializado.",
    responsibilities: [
      "Analizar la situación del proyecto",
      "Decidir el próximo paso",
      "Delegar en roles especialistas",
      "Integrar los resultados que recibe",
      "Mantener la coherencia con la Constitución",
    ],
    icon: "Brain",
  },
  {
    key: "memory",
    name: "LOGAN Memory",
    kind: "sistema",
    status: "activo",
    color: "muted",
    tagline: "Lee el repositorio, resume contexto, detecta cambios.",
    responsibilities: [
      "Leer GitHub",
      "Resumir el contexto para Core",
      "Detectar cambios entre sesiones",
      "Preparar la información para decidir",
      "Indexar el conocimiento permanente",
    ],
    icon: "Database",
  },
  {
    key: "marketing",
    name: "Marketing",
    kind: "especialista",
    status: "activo",
    color: "success",
    tagline: "El primer rol especialista real.",
    responsibilities: [
      "Analizar páginas web",
      "Encontrar fortalezas y debilidades",
      "Proponer mejoras",
      "Crear campañas para Meta",
      "Redactar anuncios",
      "Generar prompts para imágenes y videos",
      "Sugerir presupuesto",
      "Estimar resultados",
      "Analizar competidores",
    ],
    icon: "Megaphone",
  },
  {
    key: "dev",
    name: "Dev",
    kind: "especialista",
    status: "activo",
    color: "warning",
    tagline: "Desarrollo de producto.",
    responsibilities: [
      "Diseñar la arquitectura técnica",
      "Implementar funcionalidades",
      "Mantener la calidad técnica",
      "Documentar las decisiones técnicas",
    ],
    icon: "Code",
  },
  {
    key: "design",
    name: "Design",
    kind: "especialista",
    status: "activo",
    color: "destructive",
    tagline: "Diseño de producto y de experiencia.",
    responsibilities: [
      "Diseñar interfaces",
      "Definir sistemas visuales",
      "Prototipar interacciones",
      "Validar usabilidad",
    ],
    icon: "Palette",
  },
  {
    key: "analytics",
    name: "Analytics",
    kind: "especialista",
    status: "activo",
    color: "success",
    tagline: "Verifica las hipótesis. Cierra el bucle de aprendizaje.",
    responsibilities: [
      "Verificar las hipótesis registradas por otros roles",
      "Medir resultados reales",
      "Identificar patrones y anti-patrones",
      "Alimentar los aprendizajes a Core y a LOGAN",
    ],
    icon: "LineChart",
  },
  {
    key: "finance",
    name: "Finance",
    kind: "especialista",
    status: "activo",
    color: "warning",
    tagline: "Decisiones de dinero.",
    responsibilities: [
      "Presupuestos y proyecciones",
      "Decisiones de precios",
      "Análisis de costos",
      "Viabilidad financiera",
    ],
    icon: "Coins",
  },
  {
    key: "legal",
    name: "Legal",
    kind: "especialista",
    status: "planificado",
    color: "muted",
    tagline: "Cumplimiento y riesgo legal.",
    responsibilities: [
      "Términos y condiciones",
      "Privacidad de datos",
      "Contratos",
      "Riesgo regulatorio",
    ],
    icon: "Scale",
  },
  {
    key: "support",
    name: "Support",
    kind: "especialista",
    status: "planificado",
    color: "muted",
    tagline: "Atención al usuario.",
    responsibilities: [
      "Gestionar consultas",
      "Documentar problemas recurrentes",
      "Proponer mejoras de producto desde el frente",
    ],
    icon: "LifeBuoy",
  },
];

// The 8-phase methodology cycle (LOGAN §4.1).
export type Phase = {
  n: number;
  name: string;
  description: string;
  gate?: { name: string; note: string };
};

export const METHODOLOGY_PHASES: Phase[] = [
  {
    n: 1,
    name: "Comprender el problema",
    description:
      "Leer la Biblia y SESSION_CONTEXT. Identificar el objetivo actual. Si la información es insuficiente, activar el Sistema de Descubrimiento. No se avanza sin haber comprendido qué se está construyendo y por qué.",
  },
  {
    n: 2,
    name: "Descubrir información faltante",
    description:
      "Aplicar el Sistema de Descubrimiento para llenar vacíos. Clasificar cada descubrimiento y almacenarlo en el nivel correspondiente. Fase iterativa: se reactiva cuando se detecte información faltante.",
  },
  {
    n: 3,
    name: "Diseñar la arquitectura",
    description:
      "Definir la estructura, las decisiones técnicas y la organización del trabajo. Documentar cada decisión importante antes de actuar sobre ella.",
    gate: { name: "Puerta de diseño", note: "Se verifica que el diseño está documentado y las decisiones están registradas." },
  },
  {
    n: 4,
    name: "Documentar decisiones",
    description:
      "Registrar las decisiones usando el formato del Sistema de Decisiones (DEC-XXX). Asegurar que cada decisión tenga justificación y consecuencias identificadas.",
  },
  {
    n: 5,
    name: "Construir",
    description:
      "Ejecutar el diseño documentado. Si se descubre nueva información o un problema, se regresa a la fase correspondiente antes de continuar.",
    gate: { name: "Puerta de construcción", note: "Se verifica que lo construido coincide con lo diseñado." },
  },
  {
    n: 6,
    name: "Auditar",
    description:
      "Aplicar el Sistema de Calidad y Auditoría al resultado. Verificar coherencia con la Constitución, las decisiones aprobadas y los objetivos.",
    gate: { name: "Puerta de entrega", note: "Se verifica que el entregable cumple todos los criterios de la lista de verificación." },
  },
  {
    n: 7,
    name: "Aprender",
    description:
      "Identificar qué se aprendió. Clasificar cada aprendizaje: si es universal, migrar a LOGAN; si es específico, actualizar la Biblia.",
  },
  {
    n: 8,
    name: "Actualizar documentos",
    description:
      "Actualizar la Biblia, SESSION_CONTEXT o LOGAN según corresponda. Asegurar que los documentos reflejen el estado actual. Regresar a la fase 1.",
  },
];

// The 7-item audit checklist (LOGAN §6.1).
export type AuditCheck = { id: string; label: string; question: string };
export const AUDIT_CHECKLIST: AuditCheck[] = [
  { id: "coherencia-constitucional", label: "Coherencia constitucional", question: "¿Respeta todos los artículos de la Constitución?" },
  { id: "coherencia-decisional", label: "Coherencia decisional", question: "¿Es consistente con las decisiones previamente aprobadas?" },
  { id: "ausencia-contradicciones", label: "Ausencia de contradicciones", question: "¿Hay conflicto interno entre sus secciones?" },
  { id: "simplicidad", label: "Simplicidad", question: "¿Existe una forma más simple de lograr el mismo resultado?" },
  { id: "documentacion", label: "Documentación", question: "¿Está documentado de forma que otra IA pueda entenderlo sin contexto adicional?" },
  { id: "cumplimiento-objetivo", label: "Cumplimiento del objetivo", question: "¿Resuelve lo que se pretendía resolver?" },
  { id: "separacion-correcta", label: "Separación correcta", question: "¿La información está en el documento correcto (LOGAN, Biblia o SESSION_CONTEXT)?" },
];

// The 5 work modes (LOGAN §7.2).
export type WorkMode = { key: string; name: string; when: string; objective: string; color: string };
export const WORK_MODES: WorkMode[] = [
  { key: "exploracion", name: "Exploración", when: "Al inicio o cuando falta información", objective: "Comprender el problema y descubrir lo necesario", color: "muted" },
  { key: "arquitectura", name: "Arquitectura", when: "Cuando se diseñan estructuras o sistemas", objective: "Definir la organización y las decisiones", color: "primary" },
  { key: "construccion", name: "Construcción", when: "Cuando se ejecuta lo documentado", objective: "Producir el entregable", color: "warning" },
  { key: "auditoria", name: "Auditoría", when: "Cuando se verifica calidad", objective: "Confirmar que el resultado cumple los estándares", color: "destructive" },
  { key: "evolucion", name: "Evolución", when: "Cuando se identifican mejoras", objective: "Actualizar documentos y migrar aprendizajes", color: "success" },
];

// The 5 discovery question types (LOGAN §8.2).
export type DiscoveryType = { key: string; name: string; purpose: string; example: string };
export const DISCOVERY_TYPES: DiscoveryType[] = [
  { key: "contexto", name: "Contexto", purpose: "Comprender el problema y su entorno", example: "¿Quiénes son los usuarios principales?" },
  { key: "restriccion", name: "Restricción", purpose: "Identificar límites y condiciones", example: "¿Hay restricciones de presupuesto o tiempo?" },
  { key: "decision", name: "Decisión", purpose: "Resolver alternativas donde la IA no tiene autoridad", example: "¿Prefieres enfoque móvil-first o web-first?" },
  { key: "validacion", name: "Validación", purpose: "Confirmar una hipótesis o interpretación", example: "¿Es correcto que el MVP incluye solo registro y rutinas?" },
  { key: "riesgo", name: "Riesgo", purpose: "Identificar amenazas al proyecto", example: "¿Qué pasaría si el proveedor de IA cambia sus condiciones?" },
];

export const DISCOVERY_CLASSIFICATIONS = [
  { key: "universal", name: "Universal", goesTo: "LOGAN", note: "Si otro proyecto se beneficiaría, es universal." },
  { key: "especifico", name: "Específico", goesTo: "Biblia", note: "Solo aplica al producto actual." },
  { key: "temporal", name: "Temporal", goesTo: "SESSION_CONTEXT", note: "Solo aplica a esta sesión." },
];

// Hypothesis statuses — the learning loop.
export const HYPOTHESIS_STATUSES = [
  { key: "pendiente", name: "Pendiente", note: "Registrada, esperando verificación.", color: "muted" },
  { key: "en_observacion", name: "En observación", note: "En periodo de medición.", color: "warning" },
  { key: "verificada", name: "Verificada", note: "La predicción se cumplió.", color: "success" },
  { key: "refutada", name: "Refutada", note: "La predicción no se cumplió — LOGAN aprende.", color: "destructive" },
];

// LML — Lenguaje de Modelado LOGAN (§11).
export const LML_DOC_REFS = [
  { notation: "[LOGAN]", meaning: "El documento de metodología LOGAN.md" },
  { notation: "[BIBLIA]", meaning: "La Biblia del proyecto activo" },
  { notation: "[SESSION]", meaning: "El SESSION_CONTEXT.md actual" },
];

export const LML_DECISION_EXAMPLES = [
  "DEC-001: Modelo de negocio freemium",
  "DEC-002: Prioridad móvil-first",
];

export const LML_STATE_MODES = ["exploración", "arquitectura", "construcción", "auditoría", "evolución"];

export const LML_TRANSITION_EXAMPLE = "→ auditoría: verificar coherencia del esquema con DEC-001 y DEC-003";

// The glossary (LOGAN §12 + new LOGAN OS terms).
export type GlossaryEntry = { term: string; definition: string };
export const GLOSSARY: GlossaryEntry[] = [
  { term: "LOGAN", definition: "Metodología para el diseño y desarrollo de productos digitales asistidos por IA. Acrónimo de Learning, Organization, Governance, Architecture & Navigation." },
  { term: "LOGAN OS", definition: "Evolución de LOGAN: un sistema operativo de IA que coordina múltiples roles especializados (Core, Memory, Marketing, Dev, Design, Analytics, Finance, Legal, Support) para crear, administrar y hacer crecer empresas y aplicaciones." },
  { term: "LOGAN Core", definition: "El rol orquestador del ecosistema. No ejecuta trabajo especializado: piensa, decide, delega e integra resultados. Mantiene la coherencia con la Constitución." },
  { term: "LOGAN Memory", definition: "El rol que lee el repositorio, resume contexto, detecta cambios y prepara la información para Core. Nunca decide; solo informa." },
  { term: "Rol especialista", definition: "Un rol que ejecuta trabajo especializado dentro de un dominio (Marketing, Dev, Design, Analytics, Finance, Legal, Support). Recibe mandatos de Core y devuelve entregables + hipótesis." },
  { term: "Visión de LOGAN", definition: "Documento breve, por encima de la Constitución, que responde las preguntas filosóficas del sistema (por qué existe, qué no sacrificará, qué es un buen trabajo). Mantiene la coherencia cuando hay muchos roles." },
  { term: "Hipótesis", definition: "El registro de por qué un rol tomó una decisión. Contiene contexto, la creencia (qué se espera que pase) y la predicción medible. Analytics la verifica con el tiempo." },
  { term: "Bucle de aprendizaje", definition: "El mecanismo diferenciador de LOGAN OS: cada decisión deja una hipótesis → Analytics verifica → si se refuta, LOGAN actualiza su estrategia. El sistema aprende de sus propios resultados." },
  { term: "Biblia", definition: "Documento que contiene todo el conocimiento específico de un proyecto: visión, decisiones, especificaciones y estado. Nombre estándar: Biblia_<Proyecto>.md" },
  { term: "SESSION_CONTEXT", definition: "Documento temporal que captura el estado de trabajo de una sesión para permitir la continuidad entre sesiones. Se regenera mediante el PCS." },
  { term: "PCS", definition: "Protocolo de Continuidad de Sesión. Mecanismo para generar un SESSION_CONTEXT actualizado al finalizar una sesión de trabajo." },
  { term: "LML", definition: "Lenguaje de Modelado LOGAN. Notación estructurada ligera para referenciar documentos, decisiones y estados dentro del ecosistema LOGAN." },
  { term: "Constitución", definition: "Conjunto de diez artículos que definen las normas supremas de LOGAN. Prevalece sobre cualquier otro documento en caso de conflicto." },
  { term: "Arquitectura del Conocimiento", definition: "Modelo de tres niveles (Universal, Proyecto, Temporal) que define dónde se almacena cada tipo de información." },
  { term: "Nivel Universal", definition: "Nivel de conocimiento aplicable a cualquier proyecto. Se almacena en LOGAN." },
  { term: "Nivel Proyecto", definition: "Nivel de conocimiento específico de un producto. Se almacena en la Biblia." },
  { term: "Nivel Temporal", definition: "Nivel de conocimiento válido solo para la sesión actual. Se almacena en SESSION_CONTEXT." },
  { term: "Sistema de Decisiones", definition: "Conjunto de reglas y formato para registrar, clasificar y gestionar las decisiones importantes del proyecto (DEC-XXX)." },
  { term: "Puerta de calidad", definition: "Punto de verificación obligatorio entre fases del ciclo metodológico (diseño, construcción, entrega)." },
  { term: "MVP", definition: "Producto Mínimo Viable. La versión más simple del producto que permite validar la propuesta de valor." },
  { term: "Modo de trabajo", definition: "Estado operativo de la sesión (Exploración, Arquitectura, Construcción, Auditoría, Evolución)." },
  { term: "Descubrimiento", definition: "Información nueva identificada durante el proyecto que no estaba previamente documentada." },
  { term: "Entregable", definition: "Cualquier producto tangible generado bajo LOGAN: documentos, código, diseños." },
  { term: "Migración de aprendizaje", definition: "Proceso de trasladar un conocimiento de la Biblia a LOGAN cuando se demuestra que es universalmente aplicable." },
  { term: "Ciclo metodológico", definition: "Las ocho fases iterativas que todo proyecto bajo LOGAN sigue: Comprender, Descubrir, Diseñar, Documentar, Construir, Auditar, Aprender, Actualizar." },
];

// Marketing role capabilities (from the user's conversation).
export type MarketingCapability = {
  key: string;
  label: string;
  description: string;
  producesAssetType: string;
};

export const MARKETING_CAPABILITIES: MarketingCapability[] = [
  { key: "analyze_page", label: "Analizar una página web", description: "Revisar una URL y entender qué ofrece y cómo.", producesAssetType: "page_analysis" },
  { key: "find_strengths", label: "Encontrar fortalezas", description: "Detectar qué funciona y por qué.", producesAssetType: "improvement_proposal" },
  { key: "find_weaknesses", label: "Detectar debilidades", description: "Identificar fricciones y puntos de pérdida.", producesAssetType: "improvement_proposal" },
  { key: "propose_improvements", label: "Proponer mejoras", description: "Sugerir cambios concretos con su hipótesis.", producesAssetType: "improvement_proposal" },
  { key: "create_meta_campaigns", label: "Crear campañas para Meta", description: "Estructurar campaña: objetivo, audiencia, creativos, presupuesto.", producesAssetType: "campaign_brief" },
  { key: "write_ads", label: "Redactar anuncios", description: "Copy primario + variantes para prueba A/B.", producesAssetType: "ad_copy" },
  { key: "image_prompts", label: "Generar prompts para imágenes", description: "Prompts listos para una herramienta de generación de imágenes.", producesAssetType: "image_prompt" },
  { key: "video_prompts", label: "Generar prompts para videos", description: "Prompts listos para una herramienta de generación de video.", producesAssetType: "video_prompt" },
  { key: "suggest_budget", label: "Sugerir presupuesto", description: "Reparto de inversión por canal y fase.", producesAssetType: "budget" },
  { key: "estimate_results", label: "Estimar resultados", description: "Proyección de alcance, clics y conversiones con su hipótesis.", producesAssetType: "budget" },
  { key: "analyze_competitors", label: "Analizar competidores", description: "Mapear oferta, posicionamiento y brechas de la competencia.", producesAssetType: "competitor_analysis" },
];

// Marketing asset type metadata for the workspace.
export const MARKETING_ASSET_TYPES: Record<string, { label: string; color: string }> = {
  page_analysis: { label: "Análisis de página", color: "muted" },
  improvement_proposal: { label: "Propuesta de mejora", color: "warning" },
  campaign_brief: { label: "Brief de campaña", color: "primary" },
  ad_copy: { label: "Copy de anuncio", color: "primary" },
  image_prompt: { label: "Prompt de imagen", color: "success" },
  video_prompt: { label: "Prompt de video", color: "success" },
  budget: { label: "Presupuesto", color: "warning" },
  competitor_analysis: { label: "Análisis de competidor", color: "destructive" },
};

// Sidebar sections.
export type SidebarSection = {
  key: string;
  label: string;
  icon: string;
  group: "MARCO" | "ECOSISTEMA" | "PROYECTO";
  requiresProject: boolean;
};

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  { key: "vision", label: "Visión", icon: "Eye", group: "MARCO", requiresProject: false },
  { key: "constitucion", label: "Constitución", icon: "ScrollText", group: "MARCO", requiresProject: false },
  { key: "os", label: "LOGAN OS", icon: "Cpu", group: "MARCO", requiresProject: false },
  { key: "nucleo", label: "Núcleo (Core)", icon: "Brain", group: "ECOSISTEMA", requiresProject: false },
  { key: "roles", label: "Roles", icon: "Users", group: "ECOSISTEMA", requiresProject: false },
  { key: "memoria", label: "Memoria", icon: "Database", group: "ECOSISTEMA", requiresProject: false },
  { key: "hablar", label: "Hablar con LOGAN", icon: "MessageCircle", group: "PROYECTO", requiresProject: true },
  { key: "hipotesis", label: "Hipótesis", icon: "Lightbulb", group: "PROYECTO", requiresProject: true },
  { key: "marketing", label: "Marketing", icon: "Megaphone", group: "PROYECTO", requiresProject: true },
  { key: "decisiones", label: "Decisiones", icon: "Gavel", group: "PROYECTO", requiresProject: true },
  { key: "descubrimientos", label: "Descubrimientos", icon: "Search", group: "PROYECTO", requiresProject: true },
  { key: "auditoria", label: "Auditoría", icon: "ShieldCheck", group: "PROYECTO", requiresProject: true },
  { key: "biblia", label: "Biblia", icon: "BookText", group: "PROYECTO", requiresProject: true },
  { key: "ciclo", label: "Ciclo metodológico", icon: "Repeat", group: "PROYECTO", requiresProject: true },
  { key: "sesion", label: "Sesión (PCS)", icon: "History", group: "PROYECTO", requiresProject: true },
  { key: "dev", label: "Dev", icon: "Code2", group: "PROYECTO", requiresProject: true },
  { key: "design", label: "Design", icon: "Palette", group: "PROYECTO", requiresProject: true },
  { key: "analytics", label: "Analytics", icon: "BarChart2", group: "PROYECTO", requiresProject: true },
  { key: "finance", label: "Finance", icon: "Coins", group: "PROYECTO", requiresProject: true },
];

// LML reference (kept for a small reference card).
export const LML_REFERENCE = {
  docRefs: LML_DOC_REFS,
  decisionExamples: LML_DECISION_EXAMPLES,
  stateModes: LML_STATE_MODES,
  transitionExample: LML_TRANSITION_EXAMPLE,
};

// ============================================================
// DEV CAPABILITIES — Etapa 4.5
// ============================================================
export type DevCapability = {
  key: string;
  label: string;
  description: string;
  producesAssetType: string;
};

export const DEV_CAPABILITIES: DevCapability[] = [
  { key: "design_architecture",   label: "Diseñar arquitectura",         description: "Definir estructura técnica: APIs, BD, componentes, patrones de diseño.",                          producesAssetType: "architecture_doc"     },
  { key: "implement_feature",     label: "Implementar funcionalidad",    description: "Código completo, funcional y listo para producción.",                                              producesAssetType: "code_implementation"  },
  { key: "refactor_code",         label: "Refactorizar código",          description: "Mejorar estructura, performance o legibilidad sin cambiar el comportamiento externo.",             producesAssetType: "code_refactor"        },
  { key: "write_tests",           label: "Escribir tests",               description: "Tests unitarios y/o de integración para un módulo específico.",                                   producesAssetType: "test_suite"           },
  { key: "review_code",           label: "Revisar código",               description: "Identificar bugs, vulnerabilidades y antipatrones en código existente.",                          producesAssetType: "code_review"          },
  { key: "debug_issue",           label: "Depurar problema",             description: "Diagnóstico y solución de un bug concreto con explicación de la causa raíz.",                     producesAssetType: "bug_fix"              },
  { key: "define_schema",         label: "Definir esquema de BD",        description: "Modelo Prisma, migraciones, relaciones y justificación de decisiones de datos.",                  producesAssetType: "db_schema"            },
  { key: "scaffold_project",      label: "Crear scaffold",               description: "Estructura inicial de proyecto o módulo: carpetas, archivos base, convenciones.",                 producesAssetType: "project_scaffold"     },
  { key: "write_docs",            label: "Documentar técnicamente",      description: "Documentación técnica de un módulo, API o decisión de arquitectura.",                             producesAssetType: "technical_doc"        },
  { key: "optimize_performance",  label: "Optimizar performance",        description: "Identificar cuellos de botella y proponer soluciones con métricas esperadas.",                    producesAssetType: "performance_report"   },
  { key: "security_review",       label: "Revisar seguridad",            description: "Identificar vulnerabilidades (OWASP Top 10, etc.) y proponer mitigaciones concretas.",            producesAssetType: "security_report"      },
];

export const DEV_ASSET_TYPES: Record<string, { label: string; color: string }> = {
  architecture_doc:    { label: "Documento de arquitectura", color: "primary"     },
  code_implementation: { label: "Implementación de código",  color: "success"     },
  code_refactor:       { label: "Refactor de código",        color: "warning"     },
  test_suite:          { label: "Suite de tests",            color: "muted"       },
  code_review:         { label: "Revisión de código",        color: "muted"       },
  bug_fix:             { label: "Corrección de bug",         color: "destructive" },
  db_schema:           { label: "Esquema de BD",             color: "primary"     },
  project_scaffold:    { label: "Scaffold de proyecto",      color: "warning"     },
  technical_doc:       { label: "Documentación técnica",     color: "muted"       },
  performance_report:  { label: "Reporte de performance",    color: "warning"     },
  security_report:     { label: "Reporte de seguridad",      color: "destructive" },
};

// ============================================================
// DESIGN CAPABILITIES — Etapa 4.5
// ============================================================
export type DesignCapability = {
  key: string;
  label: string;
  description: string;
  producesAssetType: string;
};

export const DESIGN_CAPABILITIES: DesignCapability[] = [
  { key: "design_ui",            label: "Diseñar interfaz de usuario",  description: "Especificación completa de UI: layout, componentes, estados, interacciones.",                     producesAssetType: "ui_spec"           },
  { key: "define_design_system", label: "Definir sistema de diseño",    description: "Paleta de colores oklch, tipografía, espaciado, componentes base y tokens de diseño.",            producesAssetType: "design_system"     },
  { key: "prototype_flow",       label: "Prototipar flujo",             description: "Flujo de interacción completo con pantallas, transiciones y estados de error.",                   producesAssetType: "interaction_flow"  },
  { key: "validate_usability",   label: "Validar usabilidad",           description: "Evaluación heurística o análisis de usabilidad con recomendaciones de mejora.",                   producesAssetType: "usability_review"  },
  { key: "generate_visual_assets", label: "Generar assets visuales",   description: "Especificación de íconos, ilustraciones o imágenes de producto con prompts para generación.",      producesAssetType: "visual_asset"      },
  { key: "design_handoff",       label: "Handoff a Dev",                description: "Especificaciones técnicas de diseño: medidas exactas, clases Tailwind, componentes shadcn/ui.",   producesAssetType: "design_handoff"    },
  { key: "design_audit",         label: "Auditar diseño existente",     description: "Revisar consistencia visual, accesibilidad y adherencia al sistema de diseño.",                   producesAssetType: "design_audit"      },
  { key: "image_asset_prompt",   label: "Prompt para imagen de marca",  description: "Prompt detallado para generar imágenes de producto, ilustraciones o creativos de campaña.",       producesAssetType: "image_asset_prompt"},
];

export const DESIGN_ASSET_TYPES: Record<string, { label: string; color: string }> = {
  ui_spec:            { label: "Especificación de UI",     color: "primary"     },
  design_system:      { label: "Sistema de diseño",        color: "primary"     },
  interaction_flow:   { label: "Flujo de interacción",     color: "warning"     },
  usability_review:   { label: "Revisión de usabilidad",   color: "muted"       },
  visual_asset:       { label: "Asset visual",             color: "success"     },
  design_handoff:     { label: "Handoff a Dev",            color: "warning"     },
  design_audit:       { label: "Auditoría de diseño",      color: "destructive" },
  image_asset_prompt: { label: "Prompt de imagen",         color: "success"     },
};

// ============================================================
// ANALYTICS CAPABILITIES — Etapa Analytics
// ============================================================
export type AnalyticsCapability = {
  key: string;
  label: string;
  description: string;
  producesAssetType: string;
};

export const ANALYTICS_CAPABILITIES: AnalyticsCapability[] = [
  { key: "verify_hypothesis",      label: "Verificar hipotesis",         description: "Evaluar si una hipotesis se cumplio, actualizar status, generar reporte de aprendizaje.",           producesAssetType: "verification_report"  },
  { key: "analyze_patterns",       label: "Analizar patrones",           description: "Revisar todas las hipotesis de un proyecto y detectar tendencias de acierto/fallo.",               producesAssetType: "pattern_analysis"     },
  { key: "extract_learnings",      label: "Extraer aprendizajes",        description: "Identificar aprendizajes universales aplicables a otros proyectos LOGAN (Art. VIII).",             producesAssetType: "learning_extraction"  },
  { key: "recommend_adjustments",  label: "Recomendar ajustes",          description: "Proponer correcciones de estrategia basadas en hipotesis refutadas.",                              producesAssetType: "strategy_adjustment"  },
  { key: "generate_learning_report", label: "Reporte de aprendizaje",   description: "Resumen completo del estado de hipotesis del proyecto con insights accionables.",                  producesAssetType: "learning_report"      },
];

export const ANALYTICS_ASSET_TYPES: Record<string, { label: string; color: string }> = {
  verification_report:  { label: "Reporte de verificacion", color: "success"     },
  pattern_analysis:     { label: "Analisis de patrones",    color: "primary"     },
  learning_extraction:  { label: "Extraccion de aprendizaje", color: "warning"   },
  strategy_adjustment:  { label: "Ajuste de estrategia",    color: "destructive" },
  learning_report:      { label: "Reporte de aprendizaje",  color: "muted"       },
};


// ============================================================
// FINANCE CAPABILITIES
// ============================================================
export type FinanceCapability = {
  key: string;
  label: string;
  description: string;
  producesAssetType: string;
};

export const FINANCE_CAPABILITIES: FinanceCapability[] = [
  { key: "project_financials",  label: "Proyección financiera",    description: "Flujo de caja, ingresos y costos proyectados a N meses con supuestos explícitos.",          producesAssetType: "financial_projection" },
  { key: "cost_analysis",       label: "Análisis de costos",       description: "Desglose de costos operativos, infraestructura y costo de adquisición de clientes (CAC).",   producesAssetType: "cost_analysis"        },
  { key: "pricing_model",       label: "Modelo de precios",        description: "Definir tiers, precios, descuentos y lógica de monetización.",                               producesAssetType: "pricing_model"        },
  { key: "viability_analysis",  label: "Análisis de viabilidad",   description: "¿El proyecto es financieramente sostenible? ¿Cuándo llega a breakeven?",                     producesAssetType: "viability_report"     },
  { key: "budget_allocation",   label: "Distribución de presupuesto", description: "Cómo repartir una inversión entre áreas: marketing, dev, infraestructura, ventas.",       producesAssetType: "budget_plan"          },
  { key: "unit_economics",      label: "Métricas unitarias",       description: "LTV, CAC, margen por cliente, payback period.",                                               producesAssetType: "unit_economics"       },
  { key: "investment_analysis", label: "Análisis de inversión",    description: "Evaluar si una inversión (herramienta, canal, contratación) vale la pena y cuándo.",         producesAssetType: "investment_analysis"  },
  { key: "financial_report",    label: "Reporte financiero",       description: "Resumen ejecutivo del estado financiero del proyecto con insights y recomendaciones.",       producesAssetType: "financial_report"     },
];

export const FINANCE_ASSET_TYPES: Record<string, { label: string; color: string }> = {
  financial_projection: { label: "Proyección financiera", color: "warning"     },
  cost_analysis:        { label: "Análisis de costos",    color: "muted"       },
  pricing_model:        { label: "Modelo de precios",     color: "primary"     },
  viability_report:     { label: "Viabilidad",            color: "success"     },
  budget_plan:          { label: "Plan de presupuesto",   color: "warning"     },
  unit_economics:       { label: "Métricas unitarias",    color: "primary"     },
  investment_analysis:  { label: "Análisis de inversión", color: "destructive" },
  financial_report:     { label: "Reporte financiero",    color: "muted"       },
};
