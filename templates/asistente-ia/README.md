# Módulo Asistente IA — plantilla reutilizable

> **Estado:** Especificación + código de referencia (DEC-LOGAN-011).
> **Versión:** 1.0
> **Fecha:** 2026-07-13
> **Decisión asociada:** DEC-LOGAN-011 (los módulos viven en `templates/`).

---

## ¿Qué es?

El **Módulo Asistente IA** es una plantilla reutilizable que cualquier producto LOGAN OS puede instanciar para tener un **bot conversacional orientado al cliente**. No es LOGAN Core. No es un especialista interno. Es la cara que el producto le muestra a SUS clientes vía WhatsApp (y, opcionalmente, web chat).

La diferencia conceptual clave (Art. V — separación de responsabilidades):

| Rol | Habla con | Voz | Persiste | Toma decisiones |
|-----|----------|-----|----------|-----------------|
| **LOGAN Core** | El dueño del producto (tú) | Voz LOGAN | Hipótesis, Decisiones, GitActions, SessionContext | Sí (propone, el humano aprueba) |
| **Especialistas** (Marketing, Dev, etc.) | El dueño del producto (vía Core) | Voz LOGAN | Hipótesis + asset del rol | Propuestas (hipótesis verificables) |
| **Asistente IA** | Los **clientes** del producto | Voz del **producto** | Nada (solo sesión en memoria) | No. Escala a humano cuando no puede. |

El Asistente IA **no es un agente**: no crea archivos, no registra hipótesis, no abre PRs, no toma decisiones de producto. Es un bot conversacional que responde preguntas, ayuda con cotizaciones y escala a humano (Art. IX).

---

## ¿Qué contiene esta plantilla?

```
templates/asistente-ia/
├── README.md                    ← este archivo (qué es, cómo instanciarlo)
├── SPECIFICATION.md             ← especificación formal (capabilities, contrato webhook, persistencia, rate limits, seguridad)
├── system-prompt-template.md    ← plantilla del system prompt con placeholders {{PRODUCT_NAME}}, {{BIBLIA_CONTEXT}}, etc.
├── webhook-handler-template.ts  ← código de referencia TS para recibir webhooks de WhatsApp Cloud API
├── integration-guide.md         ← paso a paso: cómo instanciar este módulo en un producto (Mr. Trámite, Mariscos El Jona, futuros)
└── example-biblia-context.md    ← ejemplo del contexto Biblia que se le pasa al bot
```

---

## ¿Cómo se instancia en un producto?

Resumen del flujo (el detalle completo está en `integration-guide.md`):

1. **Crear el proyecto en LOGAN OS** (ya hecho para Mr. Trámite y Mariscos El Jona).
2. **Completar la Biblia del proyecto** (visión, usuarios, catálogo, precios, FAQ). El Asistente IA lee esto como contexto.
3. **Crear una app en Meta for Developers** → obtener `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `WEBHOOK_VERIFY_TOKEN`, `APP_SECRET`.
4. **Desplegar el webhook handler** (copiar `webhook-handler-template.ts` en el repo del producto, llenar credenciales). El handler:
   - Recibe POST de Meta cuando un cliente escribe por WhatsApp.
   - Llama a `POST /api/assistant/chat` con `{ projectId, message, sessionId }`.
   - Reenvía la respuesta al cliente vía WhatsApp Cloud API.
5. **Configurar el webhook en Meta** (`https://<producto>.mx/api/whatsapp/webhook`) con verify token.
6. **Listo.** El cliente escribe por WhatsApp → el bot responde en la voz del producto.

---

## Implementación de referencia (LOGAN OS app)

Para probar el patrón sin necesidad de una app de Meta, LOGAN OS incluye una **implementación funcional de referencia**:

- `src/app/api/assistant/chat/route.ts` — endpoint `POST /api/assistant/chat`.
- `src/lib/assistant/system-prompt.ts` — construye el system prompt desde la Biblia del proyecto.
- `src/lib/assistant/types.ts` — tipos.
- `src/lib/assistant/rate-limit.ts` — rate limiter por sesión.
- `src/lib/assistant/session-store.ts` — store en memoria (30 min de expiración, máx 20 mensajes).

Este endpoint se puede probar con `curl` (ver `SPECIFICATION.md` → "Verificación"). NO requiere credenciales de Meta — solo el projectId de un producto existente en LOGAN OS.

---

## Capacidades del Asistente IA

Siete capabilities conversacionales (definidas en `src/lib/logan-os-data.ts` como `ASSISTANT_CAPABILITIES`):

| Key | Descripción |
|-----|-------------|
| `answer_faq` | Responder una pregunta frecuente del producto |
| `product_info` | Información sobre un producto/servicio específico |
| `pricing_info` | Información de precios |
| `quote_assistance` | Ayudar al cliente a iniciar una cotización/solicitud |
| `process_guidance` | Guiar al cliente por un proceso (ej. subir documentos) |
| `escalate_to_human` | Escalar al dueño del producto (WhatsApp/email) cuando el bot no puede |
| `general_assistance` | Respuesta general útil |

A diferencia de los especialistas internos (Marketing/Dev/etc.), el Asistente IA **no produce un asset estructurado**. Cada capability produce una respuesta conversacional en lenguaje natural.

---

## Principios LOGAN que respeta

- **Art. III (simplicidad)**: es un bot conversacional. Sin orquestación compleja, sin multi-agente. Lee la Biblia + responde.
- **Art. V (separación)**: el Asistente IA habla en voz del producto, no en voz LOGAN. No asume responsabilidades de Core ni de especialistas.
- **Art. IX (humano decide)**: escala a humano cuando no puede responder. Nunca toma decisiones de producto.
- **DEC-LOGAN-004**: el Asistente IA NO registra hipótesis. Las hipótesis son para agentes internos que toman decisiones. El bot solo responde.
- **DEC-LOGAN-011**: esta plantilla vive en `templates/` como especificación + referencia, no como código de producción acoplado a un producto.

---

## Productos que pueden instanciarlo

- **Mr. Trámite** (`mrtramite`) — bot para clientes que quieren iniciar un trámite, preguntar precios, subir documentos.
- **Mariscos El Jona** (`mariscoseljona`) — bot para restaurantes y comercios que quieren cotizar mayoreo de mariscos.
- **Hércules Bro** (próximamente) — bot de atención al cliente.
- Cualquier producto LOGAN futuro.

---

## Ver rápido

Si solo quieres probar el patrón sin montar Meta:

```bash
# 1. Conseguir el projectId de Mariscos El Jona
curl -s http://localhost:3000/api/projects | python3 -c "import sys,json; d=json.load(sys.stdin); print([p['id'] for p in d if p['name']=='Mariscos El Jona'][0])"

# 2. Hablarle al asistente del producto
curl -X POST http://localhost:3000/api/assistant/chat \
  -H 'Content-Type: application/json' \
  -d '{"projectId":"<id>","message":"¿Qué productos tienen?","sessionId":"test-1"}'
```

La respuesta vendrá **en español, en la voz de Mariscos El Jona** (no en la voz de LOGAN), mencionando productos del contexto Biblia.
