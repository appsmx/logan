// LOGAN Core — POST /api/core/stream (Task 30: SSE streaming endpoint).
//
// Same Core turn logic as /api/core, but emits Server-Sent Events (SSE) progress
// updates so the user sees "Pensando…" → "Consultando a Marketing…" → "Integrando…"
// instead of a blank spinner. This doesn't reduce actual latency (the specialist
// LLM calls are the bottleneck) but significantly improves perceived UX.
//
// The shared flow lives in `src/lib/core/run-turn.ts`. This endpoint just wraps
// it with an SSE encoder that converts the onProgress callback into SSE events,
// then sends the final result as a `result` event.
//
// Event format:
//   event: progress
//   data: {"stage":"thinking","message":"Pensando…"}
//
//   event: progress
//   data: {"stage":"delegating","message":"Consultando a Marketing, Finance…","delegations":["Marketing","Finance"]}
//
//   event: progress
//   data: {"stage":"integrating","message":"Integrando respuesta…"}
//
//   event: result
//   data: {"response":"…","actionsTaken":[…],"constitutionalCheck":{…},"sessionId":"…"}
//
//   event: error
//   data: {"error":"…","hint":"…"}
//
// The existing /api/core endpoint is unchanged (backwards compat). The frontend
// can optionally use /api/core/stream for a richer UX.

import { NextRequest } from "next/server";

import { runCoreTurn, CoreTurnError, type CoreTurnProgress } from "@/lib/core/run-turn";

type CoreRequestBody = { projectId?: string; message?: string };

function sseEncode(event: string, data: unknown): string {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  // SSE spec: lines starting with "event:" and "data:", separated by \n, terminated by \n\n.
  return `event: ${event}\ndata: ${payload}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: CoreRequestBody;
  try { body = (await req.json().catch(() => ({}))) as CoreRequestBody; }
  catch {
    return new Response(sseEncode("error", { error: "Cuerpo de la petición inválido" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();

  if (!projectId || !message) {
    const error = !projectId ? "Proyecto no encontrado" : "Mensaje vacío";
    const hint = !projectId ? "Crea o selecciona un proyecto primero" : undefined;
    return new Response(sseEncode("error", { error, ...(hint ? { hint } : {}) }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try { controller.enqueue(encoder.encode(sseEncode(event, data))); }
        catch { /* controller may be closed */ }
      };

      const onProgress = (event: CoreTurnProgress) => {
        send("progress", event);
      };

      try {
        const result = await runCoreTurn(projectId, message, onProgress);
        send("result", result);
      } catch (e) {
        if (e instanceof CoreTurnError) {
          send("error", { error: e.message, ...(e.hint ? { hint: e.hint } : {}) });
        } else {
          console.error("[core/stream] Unexpected:", (e as Error).message);
          send("error", { error: "LOGAN Core no disponible en este momento" });
        }
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering so events flush immediately
    },
  });
}
