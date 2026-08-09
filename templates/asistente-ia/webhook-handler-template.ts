/**
 * Módulo Asistente IA — Webhook Handler Template (WhatsApp Cloud API).
 *
 * ESTE ES CÓDIGO DE REFERENCIA. No está conectado a una app real de Meta.
 * Los productos COPIAN este archivo en su repo y llenan las credenciales.
 *
 * Función:
 *   1. Recibir webhooks de Meta (POST cuando un cliente escribe por WhatsApp).
 *   2. Verificar la firma X-Hub-Signature-256 (HMAC-SHA256 con APP_SECRET).
 *   3. Extraer el texto del mensaje y el WhatsApp ID del cliente.
 *   4. Llamar al endpoint /api/assistant/chat con { projectId, message, sessionId }.
 *   5. Enviar la respuesta de vuelta al cliente vía WhatsApp Cloud API.
 *   6. Manejar rate limits y errores (HTTP 200 ACK a Meta SIEMPRE, para no recibir reintentos).
 *
 * Convención para nombrar rutas:
 *   - GET  /api/whatsapp/webhook  → verificación inicial de Meta (hub.verify_token).
 *   - POST /api/whatsapp/webhook  → recepción de mensajes.
 *
 * Documentación oficial: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 *
 * Limitaciones:
 *   - Solo maneja mensajes de texto (no imágenes, audio, ubicación, etc.).
 *   - No maneja mensajes de estado (delivered, read) — solo menssages entrantes.
 *   - El sessionId se construye como `{projectId}:{clienteWhatsAppId}`.
 *
 * Requisitos del runtime:
 *   - Node.js 18+ (usa Web Crypto / fetch global).
 *   - Variables de entorno (ver .env.example abajo).
 *
 * .env.example (copiar a .env y llenar):
 *   WHATSAPP_TOKEN=EAAG...                    # token de acceso de la app de Meta
 *   PHONE_NUMBER_ID=106...                    # ID del número de teléfono conectado
 *   APP_SECRET=abc123...                      # App Secret de la app (para verificar firma)
 *   WEBHOOK_VERIFY_TOKEN=my_verify_token      # token que configuras en Meta al suscribir el webhook
 *   ASSISTANT_API_BASE=http://localhost:3000   # URL base del LOGAN OS app (o donde vive /api/assistant/chat)
 *   ASSISTANT_PROJECT_ID=cmsll0amf...          # projectId en LOGAN OS para este producto
 *   PRODUCT_WHATSAPP=https://wa.me/521...      #WhatsApp del producto (para escalar)
 *   PRODUCT_EMAIL=hola@producto.mx              # email del producto (para escalar)
 */

import crypto from "node:crypto";

// ─── Configuración ──────────────────────────────────────────────────────────

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID!;
const APP_SECRET = process.env.APP_SECRET!;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN!;
const ASSISTANT_API_BASE = process.env.ASSISTANT_API_BASE ?? "http://localhost:3000";
const ASSISTANT_PROJECT_ID = process.env.ASSISTANT_PROJECT_ID!;
const PRODUCT_WHATSAPP = process.env.PRODUCT_WHATSAPP ?? "";
const PRODUCT_EMAIL = process.env.PRODUCT_EMAIL ?? "";

const GRAPH_API_VERSION = "v18.0";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type WhatsAppWebhookPayload = {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      field: "messages";
      value: {
        messaging_product: "whatsapp";
        metadata?: { phone_number_id: string; display_phone_number: string };
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
        messages?: Array<{
          from: string; // WhatsApp ID del cliente, ej. "5216612345678"
          id: string;
          type: "text" | "image" | "audio" | "video" | "document" | "location" | "button" | "interactive";
          text?: { body: string };
          timestamp: string;
        }>;
        statuses?: Array<unknown>; // mensajes de estado (delivered, read, etc.) — los ignoramos
      };
    }>;
  }>;
};

type AssistantChatResponse = {
  response: string;
  rateLimited: boolean;
  remaining: number;
};

// ─── Handlers ───────────────────────────────────────────────────────────────

/**
 * GET /api/whatsapp/webhook
 * Verificación inicial de Meta. Responde con hub.challenge si el verify_token coincide.
 *
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN && challenge) {
    console.log("[whatsapp] Webhook verificado OK.");
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  console.warn("[whatsapp] Verificación fallida:", { mode, token });
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST /api/whatsapp/webhook
 * Recibe mensajes de clientes y responde vía WhatsApp Cloud API.
 *
 * CRÍTICO: siempre responder 200 a Meta (incluso si falla el procesamiento),
 * para que no siga reintentando el mismo mensaje.
 */
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();

  // 1) Verificar firma HMAC-SHA256 con APP_SECRET.
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature || !verifySignature(rawBody, signature)) {
    console.warn("[whatsapp] Firma inválida — rechazando.");
    return new Response("Unauthorized", { status: 401 });
  }

  // 2) Parsear payload.
  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch (e) {
    console.warn("[whatsapp] JSON inválido:", (e as Error).message);
    return new Response("Bad Request", { status: 200 }); // 200 para que Meta no reintente
  }

  // 3) Iterar sobre los mensajes entrantes.
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      for (const msg of messages) {
        if (msg.type !== "text" || !msg.text?.body) {
          // Solo soportamos texto por ahora.
          console.log(`[whatsapp] Mensaje tipo '${msg.type}' no soportado, ignorando.`);
          continue;
        }
        const clientText = msg.text.body.trim();
        const clientWaId = msg.from;
        const sessionId = `${ASSISTANT_PROJECT_ID}:${clientWaId}`;

        // 4) Llamar al endpoint /api/assistant/chat.
        let assistantResponse: string;
        try {
          assistantResponse = await callAssistantChat(sessionId, clientText);
        } catch (e) {
          console.error("[whatsapp] Error llamando al asistente:", (e as Error).message);
          assistantResponse =
            "Disculpa, tuve un problema técnico en este momento. 🙏 " +
            `Por favor escríbenos directamente por WhatsApp: ${PRODUCT_WHATSAPP} ` +
            `o correo: ${PRODUCT_EMAIL}. Te responderemos en menos de 24 horas.`;
        }

        // 5) Enviar la respuesta al cliente vía WhatsApp Cloud API.
        try {
          await sendWhatsAppMessage(clientWaId, assistantResponse);
        } catch (e) {
          console.error("[whatsapp] Error enviando respuesta a Meta:", (e as Error).message);
        }
      }
    }
  }

  // 6) ACK a Meta (siempre 200).
  return new Response("OK", { status: 200 });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verifica la firma X-Hub-Signature-256 del webhook.
 * Meta envía "sha256=<hmac>" calculado con APP_SECRET sobre el body crudo.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  if (!APP_SECRET) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
  // Constant-time comparison para evitar timing attacks.
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Llama al endpoint /api/assistant/chat del LOGAN OS app (o del despliegue del producto).
 * Devuelve el texto de respuesta del asistente.
 */
async function callAssistantChat(sessionId: string, message: string): Promise<string> {
  const url = `${ASSISTANT_API_BASE}/api/assistant/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: ASSISTANT_PROJECT_ID, message, sessionId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Assistant API ${res.status}: ${text}`);
  }

  const data = (await res.json()) as AssistantChatResponse;
  return data.response;
}

/**
 * Envía un mensaje de texto al cliente vía WhatsApp Cloud API.
 * Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
  // WhatsApp Cloud API tiene un límite de 4096 caracteres por mensaje de texto.
  const truncatedBody = body.length > 4000 ? body.slice(0, 4000) + "…" : body;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: truncatedBody },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`WhatsApp send ${res.status}: ${errText}`);
  }
  // Log mínimo para auditoría (sin token).
  console.log(`[whatsapp] Mensaje enviado a ${to} (${body.length} chars).`);
}

// ─── Notas de despliegue ───────────────────────────────────────────────────
//
// 1. Configurar variables de entorno (.env en el repo del producto).
// 2. Desplegar el webhook handler en una URL pública HTTPS (Vercel, railway, etc.).
// 3. En Meta for Developers:
//    a) Crear una app → añadir WhatsApp Cloud API.
//    b) Configurar el webhook URL: https://<producto>.mx/api/whatsapp/webhook
//    c) Verify token: el valor de WEBHOOK_VERIFY_TOKEN.
//    d) Suscribirse al campo "messages".
// 4. Probar enviando un WhatsApp desde un teléfono real al número conectado.
//
// ─── Limitaciones del template (intencional, Art. III) ─────────────────────
//
// - Solo mensajes de texto. Para imágenes/audio/video/etc. extender el handler.
// - No maneja mensajes interactivos (botones, listas). Para futuras iteraciones.
// - No maneja opt-in / opt-out explícito. Implementar si el producto lo requiere.
// - Rate limit delegado al endpoint /api/assistant/chat. Si el cliente excede 20
//   mensajes por sesión (30 min), el asistente le sugiere escalar.
// - Sesión en memoria: se pierde al reiniciar el proceso. Aceptable para WhatsApp
//   (los clientes esperan sesiones cortas). Para persistencia real, usar Redis.
