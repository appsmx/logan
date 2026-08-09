// LOGAN Showcase — POST /api/showcase/chat
//
// Limited, public, no-persistence conversational demo of LOGAN.
// Pure text in → text out. NO project context, NO git tools, NO hypothesis
// registration, NO DB writes. Rate-limited: 5 msgs / 10 min / IP.
//
// Constraints honored:
//   - Art. III (simplicidad): single endpoint, single LLM call, no integrations.
//   - Art. IX (honestidad): system prompt tells LOGAN to be honest about being a demo.
//   - DEC-LOGAN-016 (illustrative-not-self-service): NO real work allowed in showcase mode.

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

import { buildShowcaseSystemPrompt } from "@/lib/showcase/system-prompt";
import { checkRateLimit } from "@/lib/showcase/rate-limit";

const WHATSAPP_URL = "https://wa.me/5215512345678?text=Hola%20LOGAN%2C%20quiero%20una%20demostraci%C3%B3n%20completa";
const EMAIL_URL = "mailto:hola@logancorp.mx?subject=Demostraci%C3%B3n%20LOGAN";

type RequestBody = { message?: string };

const RATE_LIMIT_RESPONSE =
  "Has alcanzado el límite de la demostración pública (5 mensajes por 10 minutos). " +
  "Para una demostración completa y personalizada de LOGAN — donde coordino a mis 9 roles sobre tu negocio real — contáctanos:\n\n" +
  `• WhatsApp: ${WHATSAPP_URL}\n` +
  `• Correo: ${EMAIL_URL}`;

function getClientIp(req: NextRequest): string {
  // Caddy sets X-Forwarded-For. Fall back to a stable marker so we don't
  // accidentally rate-limit everyone together.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json().catch(() => ({}))) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Mensaje demasiado largo (máx 2000 caracteres)" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { response: RATE_LIMIT_RESPONSE, rateLimited: true, remaining: 0 },
      { status: 429 },
    );
  }

  const systemPrompt = buildShowcaseSystemPrompt();

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: message },
      ],
      thinking: { type: "disabled" },
    });
    const response = (completion.choices[0]?.message?.content ?? "").trim();
    if (!response) {
      return NextResponse.json(
        { error: "LOGAN no respondió. Intenta de nuevo." },
        { status: 503 },
      );
    }
    return NextResponse.json({
      response,
      rateLimited: false,
      remaining: rl.remaining,
    });
  } catch (e) {
    console.error("[showcase/chat] Z.ai error:", (e as Error).message);
    return NextResponse.json(
      { error: "LOGAN no está disponible en este momento. Intenta más tarde." },
      { status: 503 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/showcase/chat",
    method: "POST",
    description: "Demostración limitada de LOGAN. Sin persistencia. Rate-limited.",
    limits: "5 mensajes / 10 minutos / IP",
  });
}
