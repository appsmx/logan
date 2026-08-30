# Módulo Asistente IA — Especificación formal v2.0 (Multi-canal)

> **Versión:** 2.0
> **Fecha:** 2026-08-31
> **Decisión asociada:** DEC-LOGAN-011 (módulos viven en `templates/`) + DEC-MULTI-001 (arquitectura webhook unificado)
> **Sustituye:** SPECIFICATION.md v1.0 (que solo cubría WhatsApp Cloud API)
> **Backward compatibility:** los productos que instanciaron v1.0 pueden mantener su webhook `/api/whatsapp/webhook` como alias del nuevo `/api/meta/webhook`. La migración es opt-in por producto.

Esta especificación define formalmente el comportamiento, contrato y límites del Módulo Asistente IA cuando se instancia para responder en **múltiples canales sociales de Meta**: Facebook Messenger, Instagram DM y WhatsApp Cloud API.

---

## 1. Propósito

Proveer un **bot conversacional multi-canal orientado al cliente** para cualquier producto LOGAN OS. El bot:

- Lee la Biblia del producto (visión, usuarios, catálogo, precios, FAQ) como contexto.
- Responde en la **voz del producto** (NO en voz LOGAN).
- Resuelve consultas frecuentes, ayuda con cotizaciones y guía procesos.
- Escala a humano (el dueño del producto) cuando no puede responder.
- NO es un agente: no crea archivos, no registra hipótesis, no toma decisiones (Art. V — separación de responsabilidades).

**Diferencia con v1.0:** en v1.0 el bot vivía en un solo canal (WhatsApp). En v2.0 el **mismo bot** responde en 3 canales sociales de Meta, compartiendo:
- Cerebro (agente IA)
- Sesión conversacional
- Rate-limit
- Reglas de escalación
- Persistencia

---

## 2. Capacidades (sin cambios respecto a v1.0)

Siete capabilities conversacionales. NO producen asset estructurado — cada capability produce una respuesta conversacional.

| Key | Label | Descripción |
|-----|-------|-------------|
| `answer_faq` | Responder FAQ | Responder una pregunta frecuente sobre el producto. |
| `product_info` | Información de producto | Información sobre un producto/servicio específico del catálogo. |
| `pricing_info` | Información de precios | Precios, descuentos, formas de pago. |
| `quote_assistance` | Asistencia de cotización | Ayudar al cliente a iniciar una cotización o solicitud. |
| `process_guidance` | Guía de proceso | Guiar al cliente por un proceso (ej. agendar cita, pedir cotización). |
| `escalate_to_human` | Escalar a humano | Cuando el bot no puede ayudar, escalar al dueño del producto (WhatsApp/email). |
| `general_assistance` | Asistencia general | Respuesta general útil. |

---

## 3. System Prompt (estructura multi-canal)

El system prompt se construye dinámicamente desde la Biblia del proyecto. La estructura v2.0 añade **conciencia de canal**:

```
1. Identidad del producto
   "Eres el asistente de {{PRODUCT_NAME}}. {{PRODUCT_TAGLINE}}."

2. Reglas de voz (conciencia de canal)
   - Hablas en español.
   - Hablas en nombre de {{PRODUCT_NAME}}, no en nombre de LOGAN.
   - Tono: {{PRODUCT_TONE}} (ej. "cercano y enérgico" para Mariscos Quiroa).
   - NO mencionas LOGAN, ni Core, ni especialistas. Eres invisible al cliente.
   - **Conoces por dónde escribió el cliente** (variable {{CHANNEL}}):
     * WhatsApp: tono comercial directo, ideal para cotizaciones y mayoreo.
     * Messenger (Facebook): tono conversacional cercano, ideal para consultas generales.
     * Instagram DM: tono juvenil y casual, ideal para productos y descubrimiento.
   - Puedes referirte al canal naturalmente: "vi tu mensaje por Instagram", "por aquí de WhatsApp te lo resuelvo".

3. Contexto Biblia (lo que el bot sabe)
   - Visión del producto.
   - Usuarios / audiencia objetivo.
   - Catálogo de productos/servicios.
   - Precios.
   - FAQ.
   - Procesos clave.
   - Datos de contacto del producto (WhatsApp, email, Instagram, Facebook).

4. Reglas operativas
   - Responde en máximo 200 palabras (150 en Instagram DM por la jerga juvenil).
   - Sé específico: cita productos del catálogo, no hables en generalidades.
   - Si no sabes algo, dilo y ofrece escalar a humano.
   - SIEMPRE escala a humano cuando:
     a) El cliente lo pide explícitamente.
     b) La pregunta requiere información fuera de la Biblia.
     c) El cliente está frustrado o enojado.
     d) La solicitud es compleja o fuera de alcance.
   - NO inventes precios, productos ni procesos. Si no lo sabes, escala.
   - Puedes recibir attachments (imagen, audio, ubicación). Si no puedes procesarlos, pide al cliente que describa en texto o escala.

5. Escalación a humano
   Cuando escales, ofrece SIEMPRE los datos de contacto del producto:
   - WhatsApp: {{PRODUCT_WHATSAPP}}
   - Email: {{PRODUCT_EMAIL}}
   - Instagram: {{PRODUCT_INSTAGRAM}}
   - Facebook: {{PRODUCT_FACEBOOK}}
   Y dile al cliente que un humano le responderá en menos de {{PRODUCT_RESPONSE_TIME}}.
   Si el cliente ya está en uno de esos canales, dile que siga ahí y un humano le escribirá en el mismo canal.

6. Formato de respuesta
   - Lenguaje natural, conversacional.
   - Markdown ligero (negritas, listas breves).
   - Sin H1/H2.
   - En Instagram, evita listas largas — responde en prosa corta.
   - Termina con una pregunta abierta cuando tenga sentido.
```

La plantilla completa con placeholders está en `system-prompt-template.md` (actualizado a v2.0).

---

## 4. Contrato del Webhook Multi-canal (cambio mayor respecto a v1.0)

### 4.1 URL única

```
GET  https://<producto>.mx/api/meta/webhook   ← verificación Meta (3 productos)
POST https://<producto>.mx/api/meta/webhook   ← recepción de mensajes (3 canales)
```

Los 3 productos de Meta (Page, Instagram, WhatsApp Business Account) se suscriben a la misma URL.

### 4.2 Verificación del webhook (GET, al configurar)

Meta hace un GET idéntico para los 3 productos:

```
GET /api/meta/webhook?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=<challenge>
```

El handler responde con `hub.challenge` (status 200) si `hub.verify_token` coincide con `META_VERIFY_TOKEN`.

```ts
// Pseudocódigo
const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
  return new Response(challenge, { status: 200 });
}
return new Response("Forbidden", { status: 403 });
```

### 4.3 Recepción de mensajes (POST) — detección de canal por `object`

Headers:
- `X-Hub-Signature-256`: `sha256=<HMAC>` con `META_APP_SECRET`. OBLIGATORIO verificar antes de procesar.
- `Content-Type: application/json`

Body — la forma canónica varía por canal:

#### 4.3.1 WhatsApp Cloud API
```json
{
  "object": "whatsapp_business_account",
  "entry": [{ "id": "...", "changes": [{
    "field": "messages",
    "value": {
      "messaging_product": "whatsapp",
      "metadata": { "phone_number_id": "...", "display_phone_number": "..." },
      "contacts": [{ "wa_id": "5216612345678", "profile": { "name": "Juan" } }],
      "messages": [{ "from": "5216612345678", "id": "wamid.HBgL...", "type": "text", "text": { "body": "¿Tienen camarón?" }, "timestamp": "1700000000" }]
    }
  }]}]
}
```

#### 4.3.2 Facebook Messenger
```json
{
  "object": "page",
  "entry": [{ "id": "<page_id>", "time": 1700000000000, "messaging": [{
    "sender": { "id": "<psid>" },
    "recipient": { "id": "<page_id>" },
    "timestamp": 1700000000000,
    "message": {
      "mid": "m_...",
      "text": "¿Tienen camarón?"
    }
  }]}]
}
```

#### 4.3.3 Instagram DM
```json
{
  "object": "instagram",
  "entry": [{ "id": "<ig_account_id>", "time": 1700000000000, "messaging": [{
    "sender": { "id": "<igsid>" },
    "recipient": { "id": "<ig_account_id>" },
    "timestamp": 1700000000000,
    "message": {
      "mid": "<ig_mid>",
      "text": "¿Tienen camarón?"
    }
  }]}]
}
```

### 4.4 Normalización a objeto común

El handler debe normalizar los 3 formatos a:

```ts
type NormalizedMessage = {
  channel: "whatsapp" | "messenger" | "instagram";
  customerPlatformId: string;  // wa_id (WA), psid (Messenger), igsid (IG)
  customerName?: string;
  text: string;
  attachments?: Array<{
    type: "image" | "audio" | "video" | "location" | "file";
    url?: string;
    payload?: unknown;
  }>;
  platformMessageId: string;  // wamid (WA), mid (MSG/IG)
  timestamp: number;
  raw: unknown;  // payload original para debug
};
```

### 4.5 Dispatcher (procesamiento unificado)

```ts
async function dispatch(message: NormalizedMessage): Promise<void> {
  // 1. Idempotencia: si ya procesamos este platformMessageId, salir.
  if (await isProcessed(message.platformMessageId)) return;

  // 2. Upsert conversación (clave única: [channel, customerPlatformId])
  const conversation = await upsertConversation({
    channel: message.channel,
    customerPlatformId: message.customerPlatformId,
    customerName: message.customerName,
    lastChannelUsed: message.channel,
  });

  // 3. Cargar historial (últimos 20 mensajes de esta conversación)
  const history = await loadHistory(conversation.id, 20);

  // 4. Invocar al agente IA del producto
  const response = await processCustomerMessage({
    text: message.text,
    history,
    locale: conversation.customerLocale,
    channel: message.channel,  // ← conciencia de canal
    attachments: message.attachments,
  });

  // 5. Enviar la respuesta por el canal de origen
  await sendByChannel(message.channel, message.customerPlatformId, response);

  // 6. Persistir ambos mensajes
  await persistMessages({
    conversationId: conversation.id,
    inbound: message,
    outbound: { text: response, source: "AI" },
  });
}
```

### 4.6 Envío de respuesta por canal (3 funciones)

```ts
// WhatsApp Cloud API
await fetch(`https://graph.facebook.com/${META_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ messaging_product: "whatsapp", to: customerPlatformId, type: "text", text: { body: response } }),
});

// Facebook Messenger
await fetch(`https://graph.facebook.com/${META_API_VERSION}/${MESSENGER_PAGE_ID}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${MESSENGER_PAGE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ recipient: { id: customerPlatformId }, messaging_type: "RESPONSE", message: { text: response } }),
});

// Instagram DM
await fetch(`https://graph.facebook.com/${META_API_VERSION}/${INSTAGRAM_ACCOUNT_ID}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ recipient: { id: customerPlatformId }, message: { text: response } }),
});
```

### 4.7 ACK inmediato (obligatorio)

Meta requiere un `200 OK` en menos de **20 segundos**. El webhook debe:

1. Verificar firma.
2. Parsear body.
3. Identificar canal.
4. Devolver `200 OK` inmediatamente.
5. Procesar el mensaje en background (`Promise.allSettled([dispatch(normalized)])`).

Si el procesamiento en background falla, Meta no reintentará (ya recibió 200). Para no perder mensajes, el handler debe loguear el error y opcionalmente enviar un mensaje de fallback al cliente ("Tuvimos un problema procesando tu mensaje, ¿podrías repetirlo?").

### 4.8 Sesión

- `sessionId` se construye como `{projectId}:{channel}:{customerPlatformId}` (ej. `mariscosquiroa:whatsapp:5216612345678`).
- Cada cliente+canal tiene su propia sesión con su propio historial.
- **No se cruzan sesiones entre canales por defecto** (mismo cliente en WA y en IG son 2 sesiones distintas).
- En fase 2 (futuro): vinculación cruzada vía Meta ID Matching API.

### 4.9 Rate limiting

- 20 mensajes por sesión (cliente+canal) antes de sugerir escalar.
- Sesión expira tras 30 minutos de inactividad.
- Después del límite: "Has alcanzado el límite de mensajes por ahora. Para una atención personalizada, escríbenos a {WHATSAPP}."

---

## 5. Modelo de persistencia multi-canal

### 5.1 Prisma schema v2.0

```prisma
model MetaConversation {
  id                 String   @id @default(cuid())
  channel            Channel  // whatsapp | messenger | instagram
  customerPlatformId String   // wa_id, psid, o igsid
  customerName       String?
  customerPhone      String?  // solo WA por defecto; IG/MSG requieren permisos extra
  customerLocale     String   @default("es")
  status             ConversationStatus @default(ACTIVE)
  lastChannelUsed    Channel
  lastInboundAt      DateTime?
  lastOutboundAt     DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  messages           MetaMessage[]

  @@unique([channel, customerPlatformId])
  @@index([status, updatedAt])
}

model MetaMessage {
  id                String   @id @default(cuid())
  conversationId    String
  conversation      MetaConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  direction         MessageDirection  // INBOUND | OUTBOUND
  source            MessageSource     // AI | HUMAN | SYSTEM
  channel           Channel            // redundancia intencional para queries rápidas
  platformMessageId String   @unique  // wamid, mid (Messenger), mid (IG)
  status            MessageStatus?    // sent | delivered | read | failed
  body              String
  attachments       Json?              // array de {type, url, payload}
  createdAt         DateTime @default(now())

  @@index([conversationId, createdAt])
  @@index([platformMessageId])
}

enum Channel {
  whatsapp
  messenger
  instagram
}

enum ConversationStatus {
  ACTIVE
  ESCALATED_HUMAN
  CLOSED
  BLOCKED
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageSource {
  AI
  HUMAN
  SYSTEM
}

enum MessageStatus {
  sent
  delivered
  read
  failed
}
```

### 5.2 No persistence de hipótesis ni decisiones

**El Asistente IA NO persiste nada en tablas de LOGAN OS** (Hypothesis, Decision, GitAction, SessionContext). Solo persiste conversaciones y mensajes (que son operacionales, no estratégicos). Esto es coherente con DEC-LOGAN-004.

---

## 6. Rate limits

| Límite | Valor | Justificación |
|--------|-------|---------------|
| Mensajes por sesión | 20 | Suficiente para una conversación útil; evita abuso. |
| Expiración de sesión | 30 min | Coincide con la ventana de contexto típica. |
| Longitud de mensaje entrante | 2000 chars | Evita prompts gigantes que cuestan tokens. |
| Longitud de respuesta | 200 palabras (150 en IG) | Conversacional, no monográfico. |
| ACK timeout | 20 s | Meta exige 200 OK en este tiempo. |
| Webhook signature verification | SIEMPRE | Sin firma válida, 401 inmediato. |

Rate limiter en memoria (`src/lib/meta/rate-limit.ts`), per-session. Cuando se excede, NO se llama al LLM — se devuelve mensaje fijo.

---

## 7. Seguridad

### 7.1 Verificación de firma del webhook

**OBLIGATORIO.** El webhook handler debe verificar `X-Hub-Signature-256` antes de procesar cualquier mensaje. Sin esto, cualquiera podría falsificar mensajes.

```ts
import crypto from "node:crypto";

const rawBody = await req.text();
const signature = req.headers.get("x-hub-signature-256");
if (!signature) return new Response("Missing signature", { status: 401 });

const expected = "sha256=" + crypto
  .createHmac("sha256", process.env.META_APP_SECRET!)
  .update(rawBody)
  .digest("hex");

// usar timingSafeEqual para evitar timing attacks
const a = Buffer.from(signature);
const b = Buffer.from(expected);
if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
  return new Response("Invalid signature", { status: 401 });
}
```

### 7.2 Tokens en variables de entorno

- `META_APP_SECRET`, `META_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `MESSENGER_PAGE_ACCESS_TOKEN`, `INSTAGRAM_ACCESS_TOKEN` → variables de entorno. NUNCA en código.
- El handler nunca loguea tokens.

### 7.3 Filtrado de entrada

- Mensaje del cliente: máx 2000 chars (rechazar si excede).
- SessionId: solo alfanumérico + `:` + `-` (prevenir inyección).
- PlatformMessageId: solo alfanumérico + `.` + `_` + `-`.

### 7.4 CORS y rate limit de webhook

El webhook solo acepta POST de rangos IP de Meta (documentados en https://developers.facebook.com/docs/graph-api/webhooks/getting-started#step6). En fase 2 se puede agregar allowlist IP. En fase 1, la verificación de firma es suficiente.

---

## 8. Endpoint de referencia (LOGAN OS app)

Si el producto usa LOGAN OS app como backend del agente IA:

```
POST /api/assistant/chat
```

**Request v2.0:**
```json
{
  "projectId": "cmsll0amf...",
  "message": "¿Qué productos tienen?",
  "sessionId": "mariscosquiroa:whatsapp:5216612345678",
  "channel": "whatsapp"
}
```

**Response 200:**
```json
{
  "response": "¡Hola! 😊 En Mariscos Quiroa manejamos 8 productos frescos...",
  "rateLimited": false,
  "remaining": 19,
  "channel": "whatsapp"
}
```

**Errores:**
- 400 — `{ error: "Proyecto no encontrado" }` / `{ error: "Mensaje vacío" }` / `{ error: "sessionId vacío" }`
- 503 — `{ error: "El asistente no está disponible en este momento" }`

---

## 9. Diferencia con LOGAN Core y los especialistas (sin cambios respecto a v1.0)

| Aspecto | LOGAN Core | Especialistas | Asistente IA v2.0 |
|---------|-----------|---------------|------------------|
| Audiencia | Dueño del producto | Dueño (vía Core) | Clientes del producto |
| Voz | LOGAN | LOGAN | Del producto |
| Persiste | Hipótesis, Decisiones, GitActions, SessionContext | Hipótesis + asset del rol | Conversaciones + mensajes (operacional) |
| Toma decisiones | Propone | Propone con hipótesis | No. Escala a humano. |
| Formato de respuesta | Texto + JSON estructurado | JSON con `title`/`content`/`hypothesis` | Texto conversacional |
| Rate limit | Por usuario LOGAN | Por usuario LOGAN | Por sesión (cliente+canal) |
| Hipótesis | Sí (cuando decide) | Sí (siempre — DEC-LOGAN-004) | NO |
| Acceso a git | Sí | No | No |
| **Canales** | LOGAN OS app | LOGAN OS app | **WhatsApp + Messenger + Instagram + Web Chat** |

---

## 10. Verificación

```bash
# 1. Verificar webhook verificación (GET)
curl -i "https://mariscosquiroa.com/api/meta/webhook?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=test123"
# → debe responder "test123" con 200

# 2. Verificar firma inválida (POST con firma falsa)
curl -i -X POST https://mariscosquiroa.com/api/meta/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=invalid" \
  -d '{"object":"whatsapp_business_account","entry":[]}'
# → debe responder 401

# 3. Verificar detección de canal (enviar payload de cada tipo)
# (los payloads completos están en §4.3.1, 4.3.2, 4.3.3)

# 4. Verificar persistencia multi-canal
python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
print('WA:', c.execute('SELECT COUNT(*) FROM MetaConversation WHERE channel=\"whatsapp\"').fetchone()[0])
print('MSG:', c.execute('SELECT COUNT(*) FROM MetaConversation WHERE channel=\"messenger\"').fetchone()[0])
print('IG:', c.execute('SELECT COUNT(*) FROM MetaConversation WHERE channel=\"instagram\"').fetchone()[0])
"

# 5. Verificar rate limit (lanzar 21 veces con mismo sessionId)
# 6. Verificar escalación
curl -X POST https://mariscosquiroa.com/api/meta/webhook ... -d '... "text":"quiero hablar con alguien"'
# → bot responde con datos de contacto del producto
```

Criterios de aceptación:
- ✅ Webhook responde `200 + challenge` en GET.
- ✅ Firma inválida → 401 inmediato.
- ✅ Firma válida + payload WA → dispatcher procesa, responde por WhatsApp.
- ✅ Firma válida + payload Messenger → dispatcher procesa, responde por Messenger.
- ✅ Firma válida + payload Instagram → dispatcher procesa, responde por Instagram.
- ✅ Persistencia: 3 filas en `MetaConversation` (una por canal) para 3 clientes distintos.
- ✅ Idempotencia: reenviar el mismo payload 2 veces no duplica conversación.
- ✅ Rate limit: tras 20 mensajes, respuesta fija de "límite alcanzado".
- ✅ Escalación: mensaje "urgente" → bot ofrece datos de contacto.

---

## 11. Migración desde v1.0

Para productos que ya instanciaron v1.0 (solo WhatsApp):

### Paso 1 — Migración Prisma
```bash
# backup
cp db/custom.db db/custom.db.bak.$(date +%Y%m%d)

# crear migración
npx prisma migrate dev --name multicanal_v2 --create-only
# editar la migración para usar renameTable + addColumn (no drop)
npx prisma migrate dev
npx prisma generate
```

### Paso 2 — Renombrar webhook (con alias)
- Crear nueva ruta `src/app/api/meta/webhook/route.ts` con el handler multi-canal.
- Mantener `src/app/api/whatsapp/webhook/route.ts` como redirección interna a la nueva ruta (para no romper la configuración existente en Meta).

### Paso 3 — Reconfigurar Meta App
- En Meta for Developers → tu app → Webhooks:
  - **No** borrar la suscripción a WhatsApp (ya está funcional).
  - Agregar suscripción a **Page** (Messenger) → misma URL → suscribir `messages`, `messaging_postbacks`.
  - Agregar suscripción a **Instagram** → misma URL → suscribir `messages`, `messaging_postbacks`.
- En Meta for Developers → App Review:
  - Solicitar permisos `pages_messaging`, `instagram_manage_messages` (pueden tardar 5-10 días hábiles).

### Paso 4 — Variables de entorno
- Agregar a `.env` y Vercel: `META_APP_SECRET`, `META_VERIFY_TOKEN`, `MESSENGER_PAGE_ACCESS_TOKEN`, `MESSENGER_PAGE_ID`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`.
- Mantener `WHATSAPP_*` existentes.

### Paso 5 — Tests end-to-end
- Probar WA con número de prueba (debe seguir funcionando sin cambios).
- Probar Messenger con usuario administrador de la página (modo Sandbox).
- Probar IG con cuenta Business de IG (modo Sandbox).

### Paso 6 — Pasar a Live
- App Review aprobado → toggle "Live" en Meta App.
- Probar con cliente real (1 beta tester por canal).

---

*Spec v2.0 bajo metodología LOGAN.*
*Art. III (simplicidad): un solo webhook unificado para 3 canales.*
*Art. IV (una sola fuente de verdad): este SPEC es la autoridad para cualquier producto LOGAN.*
*Art. V (separación de responsabilidades): LOGAN define el contrato, el producto lo ejecuta.*
