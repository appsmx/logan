# Plan: Extender el Asistente IA de LOGAN a Facebook Messenger + Instagram DM + WhatsApp

**Proyecto:** Mariscos Quiroa (primer producto LOGAN) → extensión multi-canal social
**Metodología:** LOGAN v1.0 — Art. II (documentación precede al desarrollo), Art. IV (una sola fuente de verdad), Art. V (separación de responsabilidades), Art. III (simplicidad)
**Decisión asociada:** DEC-LOGAN-011 (módulos viven en `templates/`)
**Fecha:** 2026-08-31
**Autor:** PCS bajo metodología LOGAN

---

## 1. Contexto y decisión de arquitectura

### 1.1 Qué se quiere

Que el **mismo bot IA** que ya responde por WhatsApp en mariscosquiroa.com responda también cuando un cliente escriba por:

1. **Facebook Messenger** (página de FB del negocio)
2. **Instagram DM** (cuenta Business de IG del negocio)
3. **WhatsApp** (ya implementado en sesión anterior)

Todo bajo el paraguas de la **metodología LOGAN**: la documentación precede al código, el módulo es reusable, la implementación vive en el repo del producto.

### 1.2 El insight clave (simplicidad — Art. III)

Meta expone los **3 canales vía una sola API unificada** (Graph API + Meta Business Suite). Los webhooks de los 3 canales:

- **Comparten URL de callback** (`https://mariscosquiroa.com/api/meta/webhook`)
- **Comparten header de firma** (`X-Hub-Signature-256` con el mismo `APP_SECRET`)
- **Comparten estructura de payload** (`{ object, entry: [{ changes: [{ field, value }] }] }`)
- **Solo difieren en el valor de `object` y `field`**:
  - WhatsApp → `object: "whatsapp_business_account"`, `field: "messages"`
  - Messenger → `object: "page"`, `field: "messages"`
  - Instagram → `object: "instagram"`, `field: "messages"`

Esto significa que **NO necesitamos 3 bots ni 3 webhooks**. Un solo handler multi-canal puede enrutar todo. Esto reduce complejidad (Art. III), evita duplicación (Art. IV), y permite reusar el mismo sistema de sesión, rate-limit y escalación a humano.

### 1.3 Decisión de arquitectura (DEC-MULTI-001)

**Arquitectura: Un solo webhook handler multi-canal + adaptadores de canal.**

```
[Cliente en FB Messenger]  ─┐
[Cliente en Instagram DM] ─┼──→ Meta Webhook (POST /api/meta/webhook)
[Cliente en WhatsApp]      ─┘            │
                                         ▼
                              [Handler unificado]
                                         │
                          ┌──────────────┼───────────────┐
                          ▼              ▼               ▼
                    [Adaptador WA]  [Adaptador MSG]  [Adaptador IG]
                          │              │               │
                          └──────────────┼───────────────┘
                                         ▼
                            [processCustomerMessage IA]
                                         │
                              [Respuesta del agente IA]
                                         │
                          ┌──────────────┼───────────────┐
                          ▼              ▼               ▼
                    [Envío WA]     [Envío MSG]     [Envío IG]
                                         │
                                         ▼
                          [Cliente recibe respuesta]
```

**Justificación (Art. III):** Una sola pieza de código enruta los 3 canales. Si añadimos TikTok en el futuro, solo agregamos un adaptador más, no un webhook nuevo.

### 1.4 Qué queda igual (DEC-MULTI-002)

- El **agente IA de Mariscos Quiroa** (`processCustomerMessage`) que ya vive en el repo NO cambia. Sigue siendo el cerebro.
- La **persistencia** en Prisma (`WhatsappConversation` + `WhatsappMessage`) se **extiende** a multi-canal con un campo `channel: "whatsapp" | "messenger" | "instagram"`. No se crea una tabla nueva, se evoluciona la existente.
- El **rate-limit** y la **sesión** se mantienen por `clienteId` (no por canal). Si un cliente escribe por WA y luego por IG con el mismo teléfono (vinculado vía Meta), la sesión es la misma.

### 1.5 Qué cambia (DEC-MULTI-003)

| Componente | Antes (solo WA) | Ahora (multi-canal) |
|---|---|---|
| Ruta del webhook | `/api/whatsapp/webhook` | `/api/meta/webhook` (nuevo) + el anterior queda como alias por compatibilidad |
| Tabla Prisma | `WhatsappConversation`, `WhatsappMessage` | Renombrar a `MetaConversation`, `MetaMessage` + campo `channel` (migración con backward-compat) |
| Lib de envío | `src/lib/whatsapp.ts` | `src/lib/meta-channels.ts` con 3 funciones: `sendWhatsApp`, `sendMessenger`, `sendInstagram` |
| Lib de bridge | `src/lib/whatsapp-bridge.ts` | `src/lib/meta-bridge.ts` con 3 adaptadores de entrada + 1 dispatcher |
| System prompt | Especializado en WhatsApp | Multi-canal (menciona al cliente por canal: "vi tu mensaje por Instagram") |
| Variables env | `WHATSAPP_*` (6 vars) | `META_APP_SECRET`, `META_VERIFY_TOKEN` (compartidos) + `WHATSAPP_*`, `MESSENGER_PAGE_*`, `INSTAGRAM_IG_*` (específicos por canal) |

---

## 2. Estructura del repositorio (Art. IV — una sola fuente de verdad)

### 2.1 Dónde vive cada cosa

| Documento / código | Repo | Por qué |
|---|---|---|
| **SPEC multi-canal v2.0** (contrato formal del módulo) | `appsmx/logan` → `templates/asistente-ia/SPECIFICATION.md` (actualizado) | Es la fuente de verdad universal. Cualquier producto LOGAN que instancie el módulo lee este SPEC. Art. IV. |
| **Webhook handler template** (código de referencia TS) | `appsmx/logan` → `templates/asistente-ia/webhook-handler-template.ts` (actualizado a multi-canal) | Plantilla reusable. Los productos la COPIAN y adaptan. DEC-LOGAN-011. |
| **Integration guide multi-canal** | `appsmx/logan` → `templates/asistente-ia/integration-guide.md` (actualizada) | Paso a paso para cualquier producto LOGAN. |
| **Implementación concreta de Mariscos Quiroa** | `appsmx/mariscosquiroa` → `src/app/api/meta/webhook/route.ts` + `src/lib/meta-channels.ts` + `src/lib/meta-bridge.ts` | La implementación vive en el repo del producto (Art. V — separación de responsabilidades). |
| **Schema Prisma multi-canal** | `appsmx/mariscosquiroa` → `prisma/schema.prisma` (migración) | La BD es del producto, no de LOGAN. |
| **Variables de entorno** | `appsmx/mariscosquiroa` → `.env.example` + Vercel | El producto gestiona sus propias credenciales. |

### 2.2 Principio de separación LOGAN (Art. V)

- **`appsmx/logan`** (metodología + templates) = define el **qué** y el **cómo se debe hacer**.
- **`appsmx/mariscosquiroa`** (producto) = **ejecuta** la implementación concreta con su propia identidad, Biblia y credenciales.
- **`appsmx/logan-app`** (LOGAN OS app) = si en el futuro quieres centralizar el agente IA, se puede mover ahí. Por ahora, cada producto tiene su propio `processCustomerMessage`.

---

## 3. Modelo de datos (Prisma) multi-canal

### 3.1 Renombrado + extensión de tablas existentes

```prisma
// antes: WhatsappConversation
model MetaConversation {
  id              String   @id @default(cuid())
  channel         Channel  // ← NUEVO: whatsapp | messenger | instagram
  customerPlatformId String  // ← antes: customerPhone. Ahora "wa_id" (WA), "psid" (Messenger), "igsid" (IG)
  customerName    String?
  customerPhone   String?  // ← solo si se logra extraer (WA siempre; IG/MG opcional)
  customerLocale  String   @default("es")
  status          ConversationStatus @default(ACTIVE)
  lastChannelUsed Channel  // ← para saber por dónde responder si hay multi-canal
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  messages        MetaMessage[]

  @@unique([channel, customerPlatformId])  // ← único por canal
}

// antes: WhatsappMessage
model MetaMessage {
  id              String   @id @default(cuid())
  conversationId  String
  conversation    MetaConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  direction       MessageDirection  // INBOUND | OUTBOUND
  source          MessageSource     // AI | HUMAN | SYSTEM
  channel         Channel           // ← NUEVO (redundancia intencional para queries rápidas por canal)
  platformMessageId String  @unique  // ← antes: waMessageId. Ahora genérico.
  status          MessageStatus?    // sent | delivered | read | failed
  body            String           // texto del mensaje
  attachments      Json?            // ← NUEVO: array de {type: "image"|"audio"|"location", url, ...}
  createdAt       DateTime @default(now())

  @@index([conversationId, createdAt])
}

enum Channel {
  whatsapp
  messenger
  instagram
}
```

### 3.2 Migración (backward compatibility)

Se hace un `prisma migrate` con:
1. `ALTER TABLE WhatsappConversation ADD COLUMN channel TEXT DEFAULT 'whatsapp'`
2. `ALTER TABLE WhatsappConversation ADD COLUMN customerPlatformId TEXT`
3. `UPDATE WhatsappConversation SET channel='whatsapp', customerPlatformId=customerPhone`
4. `ALTER TABLE WhatsappMessage ADD COLUMN channel TEXT DEFAULT 'whatsapp'`
5. Renombrar tablas a `MetaConversation`, `MetaMessage` (Prisma lo hace automático con `renameTable`)
6. En el código legacy que ya referencia `WhatsappConversation`, hacer rename. No quedan referencias huérfanas.

---

## 4. Contrato del webhook unificado (resumen — ver SPEC v2.0 para detalle formal)

### 4.1 URL única

```
GET  https://mariscosquiroa.com/api/meta/webhook   ← verificación Meta
POST https://mariscosquiroa.com/api/meta/webhook   ← recepción de mensajes (los 3 canales)
```

Se configuran las **3 suscripciones** en Meta App → Webhook:
- **Page (Messenger)** → callback `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`
- **Instagram** → callback `messages`, `messaging_postbacks`
- **WhatsApp Business Account** → callback `messages`, `message_status`

Las 3 suscripciones apuntan a la misma URL.

### 4.2 Detección de canal en el handler

```ts
const obj = payload.object;
// obj === "whatsapp_business_account"  → WhatsApp
// obj === "page"                       → Facebook Messenger
// obj === "instagram"                 → Instagram DM
```

Cada canal tiene su propio **adaptador** que normaliza el payload a un objeto común:

```ts
type NormalizedMessage = {
  channel: "whatsapp" | "messenger" | "instagram";
  customerPlatformId: string;  // wa_id, psid, o igsid
  customerName?: string;
  text: string;
  attachments?: Array<{type: "image"|"audio"|"location"|"file", url?: string}>;
  platformMessageId: string;
  timestamp: number;
  raw: unknown;  // payload original por si necesitamos debug
};
```

El dispatcher:

```ts
async function dispatch(message: NormalizedMessage) {
  // 1. Idempotencia por platformMessageId
  if (await isProcessed(message.platformMessageId)) return;

  // 2. Upsert conversación (clave: [channel, customerPlatformId])
  const conv = await upsertConversation(message);

  // 3. Cargar historial (últimos 20 mensajes de esta conversación)
  const history = await loadHistory(conv.id, 20);

  // 4. Invocar al agente IA existente (processCustomerMessage)
  const response = await processCustomerMessage({
    text: message.text,
    history,
    locale: conv.customerLocale,
    channel: message.channel,  // ← le pasa al agente para que sepa por dónde llegó
  });

  // 5. Enviar la respuesta por el canal de origen
  await sendByChannel(message.channel, message.customerPlatformId, response);

  // 6. Persistir ambos mensajes
  await persistMessages(conv.id, message, response, "AI");
}
```

---

## 5. Variables de entorno (.env.example multi-canal)

```bash
# ─── Meta (compartido por 3 canales) ──────────────────
META_APP_SECRET=...                    # App Secret de la app de Meta Business
META_VERIFY_TOKEN=logan_mq_verify_2026 # token que definas en Meta al suscribir el webhook
META_API_VERSION=v21.0                 # versión de Graph API

# ─── Canal: WhatsApp Business ─────────────────────────
WHATSAPP_ACCESS_TOKEN=EAAG...           # token permanente (System User)
WHATSAPP_PHONE_NUMBER_ID=...            # Phone Number ID
WHATSAPP_BUSINESS_ACCOUNT_ID=...        # WABA ID

# ─── Canal: Facebook Messenger ────────────────────────
MESSENGER_PAGE_ACCESS_TOKEN=EAAG...     # Page Access Token (con permiso pages_messaging)
MESSENGER_PAGE_ID=...                   # ID de la página de FB

# ─── Canal: Instagram DM ──────────────────────────────
INSTAGRAM_ACCESS_TOKEN=EAAG...          # mismo token del Page (IG Business conectado a la página)
INSTAGRAM_ACCOUNT_ID=...                # ID de la cuenta Business de IG

# ─── Mariscos Quiroa (negocio) ────────────────────────
PRODUCT_WHATSAPP=https://wa.me/526636999689  # teléfono del negocio para escalar
PRODUCT_EMAIL=...
PRODUCT_INSTAGRAM=https://instagram.com/mariscosquiroa
PRODUCT_FACEBOOK=https://facebook.com/mariscosquiroa
```

Total: 12 vars (3 compartidas + 9 específicas). Antes eran 6.

---

## 6. Permisos requeridos en Meta App

| Permiso (scope) | WhatsApp | Messenger | Instagram |
|---|---|---|---|
| `whatsapp_business_messaging` | ✅ | — | — |
| `pages_messaging` | — | ✅ | — |
| `instagram_basic` | — | — | ✅ |
| `instagram_manage_messages` | — | — | ✅ |
| `pages_show_list` | — | ✅ | ✅ |
| `pages_read_engagement` | — | ✅ | ✅ |
| `pages_manage_metadata` | — | ✅ | — |

Estos se solicitan en **App Review** (Meta for Developers → App Review). Para modo Sandbox (test) no requieren revisión, solo administrador.

---

## 7. Limitaciones y consideraciones

### 7.1 Limitaciones de Meta

- **24-hour window (Messenger + Instagram):** el bot solo puede enviar mensajes proactivamente dentro de las 24 horas posteriores al último mensaje del cliente. Fuera de esa ventana, solo se permiten "Message Tags" específicas (human, confirmed_event, etc.). WhatsApp Cloud API usa plantillas pre-aprobadas para ventanas de 24h.
- **Tiempo de respuesta del webhook:** Meta espera un `200 OK` en menos de 20 segundos. El handler debe ACK inmediato y procesar en background (como ya hace el webhook de WhatsApp actual con `Promise.allSettled`).
- **Tipos de mensaje:** texto, imagen, audio, video, archivo, ubicación. Para la fase 1, el agente IA solo procesa texto. Los attachments de otros tipos se persisten pero se responde "Aún no puedo procesar imágenes/audio por este canal, ¿me lo describes en texto o te comunico con un humano?".
- **Sesión cruzada:** Meta vincula identidades de usuario **solo si el negocio lo solicita vía API específica** (Personas ID Matching). Por defecto, un mismo cliente que escriba por WA y por IG aparece como 2 conversaciones distintas. Esto es esperable y aceptable en fase 1.

### 7.2 Costos

- **WhatsApp Cloud API:** $0.00 (gratis hasta 1000 conversaciones/mes en modo Cloud API). Conversaciones iniciadas por cliente son gratis.
- **Messenger + Instagram:** $0.00 (sin costo, dentro de la ventana de 24h).
- **Vercel:** Hobby ($0) con timeout 10s — puede ser insuficiente en pico de carga. Si el bot tarda >10s, considerar Vercel Pro ($20/mes) según DEC-LOGAN-013.
- **IA (Z.ai SDK):** ya pagado por Mariscos Quiroa.

### 7.3 Seguridad

- Verificación de firma `X-Hub-Signature-256` HMAC-SHA256 con `META_APP_SECRET` (compartido por 3 canales).
- Idempotencia por `platformMessageId` (evita duplicar conversaciones cuando Meta reintenta).
- Rate-limit por `customerPlatformId` (20 mensajes/sesión, 30 min expiración).
- Tokens en Vercel Environment Variables (Production + Preview + Development).

---

## 8. Fases de implementación

### Fase 1 — Documentación + SPEC (esta sesión) ✅
- ✅ Plan (este documento)
- ✅ SPEC multi-canal v2.0 (`SPEC_ASISTENTE_IA_V2.md`)
- ✅ Guía de setup Meta Business Suite (`SETUP_META_MULTICANAL.md`)
- ✅ Diagrama de arquitectura (`ARQUITECTURA_MULTILOGAN.md`)
- ⏳ Actualizar `templates/asistente-ia/` en repo `logan` con v2.0

### Fase 2 — Implementación en mariscosquiroa (siguiente sesión, tras tu aprobación)
1. Migración Prisma multi-canal (`renameTable`, `addColumn`)
2. Lib `src/lib/meta-channels.ts` (3 funciones de envío)
3. Lib `src/lib/meta-bridge.ts` (3 adaptadores de entrada + dispatcher)
4. Route `src/app/api/meta/webhook/route.ts` (GET verify + POST multi-canal)
5. Mantener `/api/whatsapp/webhook` como alias (compatibilidad con configuración existente en Meta)
6. Actualizar `.env.example` con las 12 vars
7. Tests de firma, idempotencia, enrutado por canal
8. Commit + push a `appsmx/mariscosquiroa` `main` (auto-deploy a Vercel)

### Fase 3 — Setup en Meta Business Suite (tú, con guía)
1. Crear/verificar página de FB de Mariscos Quiroa
2. Crear/verificar cuenta Business de Instagram (conectada a la página FB)
3. Confirmar WhatsApp Business ya configurado (sesión anterior)
4. En la app existente de Meta, agregar productos: Messenger, Instagram
5. Solicitar permisos en App Review
6. Configurar webhook único `https://mariscosquiroa.com/api/meta/webhook` con las 3 suscripciones
7. Configurar 12 vars en Vercel
8. Pasar a modo Live

### Fase 4 — Hardening + analytics (post-lanzamiento)
1. Dashboard admin multi-canal: conversaciones por canal, tiempo de respuesta, tasa de escalamiento
2. Métricas por canal (KPIs en `/admin`)
3. Soporte para attachments (imagen, audio) en el agente IA
4. Mensajes template pre-aprobados para ventanas de 24h fuera de tiempo
5. Vinculación cruzada de identidades (mismo cliente en WA + IG)

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Meta App Review tarda más de 1 semana | Media | Alto | Empezar el día 1; paralelamente trabajar en fase 2 |
| Vercel Hobby timeout 10s no suficiente | Media | Medio | Si el bot responde >10s, subir a Vercel Pro; o usar streaming responses |
| Cliente escribe por 2 canales → sesión duplicada | Alta | Bajo | Aceptable en fase 1; en fase 2 vincular identidades |
| Bot responde mal en IG (jerga juvenil) | Media | Medio | Ajustar system prompt con tono por canal (cercano en IG, formal en WA mayoreo) |
| Meta cambia API | Baja | Alto | Pin `META_API_VERSION=v21.0` (no usar `latest`); monitorear changelog Meta |
| Ataque de falsificación de webhook | Baja | Alto | Verificación estricta de `X-Hub-Signature-256` (ya en SPEC) |
| Costos de IA se disparan por tráfico | Media | Medio | Rate-limit por sesión (20 msgs) + cap diario opcional en Z.ai |

---

## 10. Próximos pasos inmediatos

1. **Tú revisas este plan + SPEC + guía de setup.** Ajustas lo que creas necesario.
2. Si apruebas la arquitectura, en la siguiente sesión ejecutamos Fase 2 (implementación en mariscosquiroa).
3. En paralelo (puede ser tú solo o con mi guía), empiezas Fase 3 (setup en Meta Business Suite). Mínimo 5 días hábiles para App Review.
4. Cuando Fase 2 + Fase 3 estén listas, hacemos pruebas end-to-end y pasamos a Live.

---

*Generado bajo metodología LOGAN v1.0*
*Art. II (documentación precede al desarrollo) — este plan es requisito antes de escribir cualquier código.*
*Art. III (simplicidad) — una sola pieza de código enruta los 3 canales.*
*Art. IV (una sola fuente de verdad) — el SPEC vive en `appsmx/logan`, la implementación en `appsmx/mariscosquiroa`.*
*Art. V (separación de responsabilidades) — LOGAN define, el producto ejecuta.*
