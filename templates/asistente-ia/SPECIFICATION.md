# Módulo Asistente IA — Especificación formal

> **Versión:** 1.0
> **Fecha:** 2026-07-13
> **Decisión asociada:** DEC-LOGAN-011.

Esta especificación define formalmente el comportamiento, contrato y límites del Módulo Asistente IA. Es la autoridad para cualquier producto que lo instancie.

---

## 1. Propósito

Proveer un bot conversacional orientado al cliente para cualquier producto LOGAN OS. El bot:

- Lee la Biblia del producto (visión, usuarios, catálogo, precios, FAQ) como contexto.
- Responde en la **voz del producto** (NO en voz LOGAN).
- Resuelve consultas frecuentes, ayuda con cotizaciones y guía procesos.
- Escala a humano (el dueño del producto) cuando no puede responder.
- NO es un agente: no crea archivos, no registra hipótesis, no toma decisiones.

---

## 2. Capacidades

Siete capabilities conversacionales. A diferencia de los especialistas internos, **no producen un asset estructurado** — cada capability produce una respuesta conversacional.

| Key | Label | Descripción |
|-----|-------|-------------|
| `answer_faq` | Responder FAQ | Responder una pregunta frecuente sobre el producto. |
| `product_info` | Información de producto | Información sobre un producto/servicio específico del catálogo. |
| `pricing_info` | Información de precios | Precios, descuentos, formas de pago. |
| `quote_assistance` | Asistencia de cotización | Ayudar al cliente a iniciar una cotización o solicitud. |
| `process_guidance` | Guía de proceso | Guiar al cliente por un proceso (ej. subir documentos, agendar cita). |
| `escalate_to_human` | Escalar a humano | Cuando el bot no puede ayudar, escalar al dueño del producto (WhatsApp/email). |
| `general_assistance` | Asistencia general | Respuesta general útil. |

Definidas en `src/lib/logan-os-data.ts` como `ASSISTANT_CAPABILITIES` (sigue el patrón de `MARKETING_CAPABILITIES`, `SUPPORT_CAPABILITIES`, etc.).

---

## 3. System Prompt (estructura)

El system prompt se construye dinámicamente desde la Biblia del proyecto. La estructura:

```
1. Identidad del producto
   "Eres el asistente de {{PRODUCT_NAME}}. {{PRODUCT_TAGLINE}}."
   (NO "Eres LOGAN". El bot NO se presenta como LOGAN.)

2. Reglas de voz
   - Hablas en español.
   - Hablas en nombre de {{PRODUCT_NAME}}, no en nombre de LOGAN.
   - Tono: {{PRODUCT_TONE}} (ej. "cálido y profesional" para Mr. Trámite, "cercano y enérgico" para Mariscos Quiroa).
   - NO mencionas LOGAN, ni Core, ni especialistas, ni el sistema operativo. Eres invisible a ojos del cliente.

3. Contexto Biblia (lo que el bot sabe)
   - Visión del producto.
   - Usuarios / audiencia objetivo.
   - Catálogo de productos/servicios.
   - Precios.
   - FAQ.
   - Procesos clave (ej. cómo subir documentos, cómo pedir cotización).
   - Datos de contacto del producto (WhatsApp, email).

4. Reglas operativas
   - Responde en máximo 200 palabras.
   - Sé específico: cita productos del catálogo, no hables en generalidades.
   - Si no sabes algo, dilo y ofrece escalar a humano.
   - SIEMPRE escala a humano cuando:
     a) El cliente lo pide explícitamente ("quiero hablar con alguien", "es urgente").
     b) La pregunta requiere información que no está en la Biblia.
     c) El cliente está frustrado o enojado.
     d) La solicitud es compleja o fuera de alcance.
   - NO inventes precios, productos ni procesos. Si no lo sabes, escala.

5. Escalación a humano
   Cuando escales, ofrece SIEMPRE los datos de contacto del producto:
   - WhatsApp: {{PRODUCT_WHATSAPP}}
   - Email: {{PRODUCT_EMAIL}}
   Y dile al cliente que un humano le responderá en menos de {{PRODUCT_RESPONSE_TIME}}.

6. Formato de respuesta
   - Lenguaje natural, conversacional.
   - Markdown ligero (negritas, listas breves).
   - Sin H1/H2.
   - Termina con una pregunta abierta cuando tenga sentido ("¿Quieres que te dé los precios de mayoreo?").
```

La plantilla completa con placeholders está en `system-prompt-template.md`.

---

## 4. Contrato del Webhook (WhatsApp Cloud API)

Meta envía un POST a `<producto>/api/whatsapp/webhook` cada vez que un cliente escribe por WhatsApp.

### 4.1 Verificación del webhook (GET, al configurar)

Meta hace un GET con `hub.mode=subscribe`, `hub.verify_token`, `hub.challenge`. El handler debe responder con `hub.challenge` si `hub.verify_token` coincide con `WEBHOOK_VERIFY_TOKEN`.

### 4.2 Recepción de mensajes (POST)

Headers:
- `X-Hub-Signature-256`: HMAC-SHA256 del body con `APP_SECRET`. El handler DEBE verificarlo antes de procesar.

Body (resumido — el handler debe extraer estos campos):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "5216612345678",     // ← número del cliente (WhatsApp ID)
                "id": "wamid.HBgL...",
                "type": "text",
                "text": {
                  "body": "¿Tienen camarón grande?"  // ← texto del cliente
                },
                "timestamp": "1700000000"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### 4.3 Envío de respuesta (POST a Meta)

```
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {WHATSAPP_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "5216612345678",
  "type": "text",
  "text": {
    "body": "¡Hola! Sí, tenemos camarón Grande (U15) a $380/kg en mayoreo..."
  }
}
```

### 4.4 Sesión

- El `sessionId` se construye como `{projectId}:{clienteWhatsAppId}` (ej. `mariscosquiroa:5216612345678`).
- Esto permite que cada cliente tenga su propia sesión con su propio historial.

### 4.5 Rate limiting

- 20 mensajes por sesión (cliente) antes de sugerir escalar.
- Sesión expira tras 30 minutos de inactividad.
- Después del límite, el bot responde: "Has alcanzado el límite de mensajes por ahora. Para una atención personalizada, escríbenos a {WHATSAPP}."

---

## 5. Modelo de persistencia

**El Asistente IA NO persiste nada en la base de datos.**

- No crea `Hypothesis` (DEC-LOGAN-004 — esas son para agentes internos).
- No crea `Decision`.
- No crea assets (`MarketingAsset`, `DevAsset`, etc.).
- No crea `GitAction`.
- No crea `SessionContext` (ese es del PCS, no del bot).

La única persistencia es la **sesión conversacional en memoria** (`src/lib/assistant/session-store.ts`):
- `Map<sessionId, { messages: ChatMessage[], updatedAt: number }>`
- Máximo 20 mensajes por sesión (se poda los más viejos).
- Expira tras 30 min de inactividad.
- Se pierde al reiniciar el proceso (aceptable para un bot de WhatsApp — los clientes esperan sesiones cortas).

---

## 6. Rate limits

| Límite | Valor | Justificación |
|--------|-------|---------------|
| Mensajes por sesión | 20 | Suficiente para una conversación útil; evita abuso. |
| Expiración de sesión | 30 min | Coincide con la ventana de contexto típica de WhatsApp. |
| Longitud de mensaje | 2000 chars | Evita prompts gigantes que cuestan tokens. |
| Longitud de respuesta | 200 palabras | Conversacional, no monográfico. |

Rate limiter en memoria (`src/lib/assistant/rate-limit.ts`), per-session. Cuando se excede, NO se llama al LLM — se devuelve un mensaje fijo de "límite alcanzado".

---

## 7. Seguridad

### 7.1 Verificación de firma del webhook

**OBLIGATORIO.** El webhook handler debe verificar `X-Hub-Signature-256` antes de procesar cualquier mensaje. Sin esto, cualquiera podría falsificar mensajes.

```ts
import crypto from "crypto";
const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
if (signature !== expected) return 401;
```

### 7.2 No exponer credenciales

- `WHATSAPP_TOKEN`, `APP_SECRET`, `PHONE_NUMBER_ID`, `WEBHOOK_VERIFY_TOKEN` → variables de entorno. NUNCA en código.
- El handler nunca loguea el token.

### 7.3 Filtrado de entrada

- Mensaje del cliente: máx 2000 chars (rechazar si excede).
- SessionId: solo alfanumérico + `:` + `-` (prevenir inyección).

### 7.4 No persistence = no leak

El bot no escribe a la BD → no puede filtrar datos de otros clientes. Cada sesión es aislada en memoria.

---

## 8. Endpoint de referencia (LOGAN OS app)

`POST /api/assistant/chat`

**Request:**
```json
{
  "projectId": "cmsll0amf000sndyiwmi0bf7n",
  "message": "¿Qué productos tienen?",
  "sessionId": "mariscosquiroa:5216612345678"
}
```

**Response 200:**
```json
{
  "response": "¡Hola! 😊 En Mariscos Quiroa manejamos 8 productos frescos...",
  "rateLimited": false,
  "remaining": 19
}
```

**Response 429 (rate-limited):**
```json
{
  "response": "Has alcanzado el límite de 20 mensajes en esta sesión...",
  "rateLimited": true,
  "remaining": 0
}
```

**Errores:**
- 400 — `{ error: "Proyecto no encontrado" }` / `{ error: "Mensaje vacío" }` / `{ error: "sessionId vacío" }`
- 503 — `{ error: "El asistente no está disponible en este momento" }` (Z.ai falló)

---

## 9. Diferencia con LOGAN Core y los especialistas

| Aspecto | LOGAN Core | Especialistas | Asistente IA |
|---------|-----------|---------------|--------------|
| Audiencia | Dueño del producto | Dueño (vía Core) | Clientes del producto |
| Voz | LOGAN | LOGAN | Del producto |
| Persiste | Hipótesis, Decisiones, GitActions, SessionContext | Hipótesis + asset del rol | Nada (memoria solo) |
| Toma decisiones | Propone | Propone con hipótesis | No. Escala a humano. |
| Formato de respuesta | Texto + JSON estructurado (acciones) | JSON con `title`/`content`/`hypothesis` | Texto conversacional |
| Rate limit | Por usuario LOGAN | Por usuario LOGAN | Por sesión (cliente) |
| Hipótesis | Sí (cuando decide) | Sí (siempre — DEC-LOGAN-004) | NO |
| Acceso a git | Sí | No | No |

---

## 10. Verificación

Para verificar que el endpoint de referencia funciona:

```bash
# 1. Conseguir projectId
PID=$(curl -s http://localhost:3000/api/projects | python3 -c "import sys,json; d=json.load(sys.stdin); print([p['id'] for p in d if p['name']=='Mariscos Quiroa'][0])")

# 2. Llamar al endpoint
curl -X POST http://localhost:3000/api/assistant/chat \
  -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PID\",\"message\":\"¿Qué productos tienen?\",\"sessionId\":\"test-1\"}" | python3 -m json.tool

# 3. Verificar continuidad de sesión
curl -X POST http://localhost:3000/api/assistant/chat -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PID\",\"message\":\"Hola, me llamo Juan\",\"sessionId\":\"test-2\"}"
curl -X POST http://localhost:3000/api/assistant/chat -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PID\",\"message\":\"¿Cómo me llamo?\",\"sessionId\":\"test-2\"}"

# 4. Verificar rate limit (lanzar 21 veces con mismo sessionId)

# 5. Verificar escalación
curl -X POST http://localhost:3000/api/assistant/chat -H 'Content-Type: application/json' \
  -d "{\"projectId\":\"$PID\",\"message\":\"Necesito hablar con un humano, es urgente\",\"sessionId\":\"test-escalate\"}"

# 6. Verificar no-persistencia (los counts de Hypothesis/Decision no deben aumentar)
python3 -c "import sqlite3; c=sqlite3.connect('/home/z/my-project/db/custom.db'); print('Hyp:', c.execute('SELECT COUNT(*) FROM Hypothesis').fetchone()[0]); print('Dec:', c.execute('SELECT COUNT(*) FROM Decision').fetchone()[0])"
```

Criterios de aceptación:
- ✅ Respuesta 200 en español, en la voz del producto (no LOGAN).
- ✅ Menciona productos/detalles del contexto Biblia.
- ✅ Segundo mensaje recuerda el nombre "Juan" (sesión funciona).
- ✅ Tras 20 mensajes, devuelve 429 con mensaje fijo.
- ✅ Mensaje "urgente" → el bot ofrece escalar a humano (WhatsApp/email).
- ✅ Hypothesis/Decision counts no aumentan.
