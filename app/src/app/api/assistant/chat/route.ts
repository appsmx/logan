// LOGAN OS — Módulo Asistente IA — POST /api/assistant/chat
//
// Customer-facing WhatsApp bot endpoint (DEC-LOGAN-011).
// Receives { projectId, message, sessionId } and responds in the PRODUCT's
// voice (NOT LOGAN's), using the project's Biblia as context.
//
// CRITICAL differences from /api/core and /api/marketing/execute:
//   - This endpoint does NOT persist anything to the DB. No Hypothesis,
//     no Decision, no Asset, no GitAction, no SessionContext (DEC-LOGAN-004).
//   - The conversation history is in-memory only (src/lib/assistant/session-store.ts)
//     with a 30 min expiry and a 20 message cap per session.
//   - Rate-limit is PER-SESSION (not per-IP like /api/showcase/chat).
//   - The system prompt is built from the project's Biblia (vision, users, etc.)
//     and speaks in the product's voice (e.g. "Soy el asistente de Mariscos
//     El Jona"), never in LOGAN's voice.
//
// Flow:
//   1. Validate body { projectId, message, sessionId }.
//   2. Load the project from the DB (READ ONLY — no writes).
//   3. Check per-session rate limit (20 msgs / 30 min).
//      - If over limit → 429 with RATE_LIMIT_RESPONSE (no LLM call).
//   4. Load session history from the in-memory store.
//   5. Build the system prompt (product voice + Biblia + history).
//   6. Call Z.ai SDK with [systemPrompt, ...history, userMessage].
//   7. On success: append user + assistant turn to session store.
//   8. Return { response, rateLimited: false, remaining }.
//   9. NO DB writes anywhere.
//
// Error handling:
//   - Missing projectId / project not found → 400 { error, hint }.
//   - Missing message / sessionId → 400 { error }.
//   - Message > 2000 chars → 400 { error }.
//   - Invalid sessionId format → 400 { error }.
//   - Rate limit exceeded → 429 { response, rateLimited: true, remaining: 0 }.
//   - Z.ai SDK failure → 503 { error }.
//
// Constraints honored (see templates/asistente-ia/SPECIFICATION.md):
//   - Art. III (simplicidad): single endpoint, one LLM call, no integrations.
//   - Art. V (separación): speaks in product's voice, not LOGAN's.
//   - Art. IX (humano decide): escalates to human when can't help.
//   - DEC-LOGAN-004: NO hypothesis registration. The bot just responds.
//   - DEC-LOGAN-011: template lives in templates/. This is the reference impl.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { db } from "@/lib/db";
import { buildAssistantSystemPrompt, RATE_LIMIT_RESPONSE } from "@/lib/assistant/system-prompt";
import { checkRateLimit } from "@/lib/assistant/rate-limit";
import { appendToSession, getSessionHistory } from "@/lib/assistant/session-store";
import type {
  AssistantChatResponse,
  AssistantProjectContext,
  AssistantRequestBody,
} from "@/lib/assistant/types";

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}

function unavailable() {
  return NextResponse.json(
    { error: "El asistente no está disponible en este momento" },
    { status: 503 },
  );
}

// sessionId must be alphanumeric + ":" + "-" — prevents injection / weird keys.
// Matches the convention "{projectId}:{waId}" used by the webhook handler.
const SESSION_ID_RE = /^[A-Za-z0-9:_-]{1,128}$/;

const MAX_MESSAGE_LEN = 2000;

export async function POST(req: NextRequest) {
  let body: AssistantRequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as AssistantRequestBody;
  } catch {
    return badRequest("Cuerpo de la petición inválido");
  }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();
  const sessionId = (body.sessionId || "").trim();

  if (!projectId) {
    return badRequest("Proyecto no encontrado", "Indica el projectId del producto");
  }
  if (!message) {
    return badRequest("Mensaje vacío", "Escribe el mensaje del cliente");
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return badRequest(`Mensaje demasiado largo (máx ${MAX_MESSAGE_LEN} caracteres)`);
  }
  if (!sessionId) {
    return badRequest("sessionId vacío", "Indica el sessionId (ej. 'projectId:waId')");
  }
  if (!SESSION_ID_RE.test(sessionId)) {
    return badRequest(
      "sessionId inválido",
      "Solo se permiten letras, números, ':', '_' y '-' (máx 128 caracteres)",
    );
  }

  // Load the project (READ ONLY — we never write).
  let project;
  try {
    project = await db.project.findUnique({ where: { id: projectId } });
  } catch (e) {
    console.error("[assistant/chat] DB error cargando proyecto:", (e as Error).message);
    return unavailable();
  }
  if (!project) {
    return badRequest(
      "Proyecto no encontrado",
      "Crea o selecciona un proyecto primero en LOGAN OS",
    );
  }

  // Per-session rate limit (20 msgs / 30 min). Checked BEFORE the LLM call so
  // an over-limit session does not consume tokens.
  const rl = checkRateLimit(sessionId);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        response: RATE_LIMIT_RESPONSE,
        rateLimited: true,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  // Load in-memory conversation history (gives the bot continuity within the
  // session — client's name, what they asked before, etc.).
  const history = getSessionHistory(sessionId);

  // Build the system prompt in the PRODUCT's voice, with the Biblia as context.
  const projectCtx: AssistantProjectContext = {
    id: project.id,
    name: project.name,
    vision: project.vision,
    users: project.users,
    status: project.status,
    repo: project.repo,
  };
  const systemPrompt = buildAssistantSystemPrompt(projectCtx, history);

  // Compose the messages array. The system prompt is sent as the first
  // "assistant" message (matches the convention used by /api/showcase/chat and
  // /api/core). Then we replay the conversation history (alternating user /
  // assistant turns), then the new user message last.
  const messages: Array<{ role: "assistant" | "user"; content: string }> = [
    { role: "assistant", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  // Call Z.ai SDK (server-side only — never imported in client code).
  let responseText: string;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });
    responseText = (completion.choices[0]?.message?.content ?? "").trim();
    if (!responseText) {
      console.error("[assistant/chat] LLM devolvió respuesta vacía");
      return unavailable();
    }
  } catch (e) {
    console.error("[assistant/chat] Z.ai SDK falló:", (e as Error).message);
    return unavailable();
  }

  // Append the user + assistant turn to the in-memory session store so the
  // next message in this session has continuity. NO DB writes.
  appendToSession(sessionId, projectId, message, responseText);

  const result: AssistantChatResponse = {
    response: responseText,
    rateLimited: false,
    remaining: rl.remaining,
  };
  return NextResponse.json(result);
}

// GET — sanity check / metadata for the endpoint.
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/assistant/chat",
    method: "POST",
    description:
      "Módulo Asistente IA — bot conversacional orientado al cliente. Voz del producto, no LOGAN. Sin persistencia.",
    limits: "20 mensajes por sesión (30 min de expiración)",
    body: {
      projectId: "string — id del producto en LOGAN OS",
      message: "string — texto del cliente (máx 2000 chars)",
      sessionId: "string — '{projectId}:{waId}' o cualquier identificador alfanumérico",
    },
    constraints: [
      "Art. III — bot conversacional simple, sin multi-agente.",
      "Art. V — voz del producto, no LOGAN.",
      "Art. IX — escala a humano cuando no puede ayudar.",
      "DEC-LOGAN-004 — NO registra hipótesis ni decisiones.",
      "DEC-LOGAN-011 — módulo plantilla en templates/asistente-ia/.",
    ],
  });
}
