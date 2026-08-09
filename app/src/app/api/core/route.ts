// LOGAN Core — POST /api/core
//
// Task 30 (latency optimization): the full Core turn flow now lives in
// `src/lib/core/run-turn.ts` so it can be shared with the SSE streaming
// endpoint at `/api/core/stream`. This route is the non-streaming JSON variant.
//
// Flow (in run-turn.ts, with Task 30 optimizations applied):
//   1-6. Validate → Load project → Memory Report → System prompt → LLM call → Parse.
//   7.  PARALLEL: draft constitutional validation + executeActions + 9 delegations.
//   8.  If any deliverables: integration LLM call.
//   9.  Synchronous constitutional check from draft validator.
//  10.  Persist SessionContext.
//  11.  Fire-and-forget background final validator (non-blocking, Art. IX still runs).
//  12.  Return.

import { NextRequest, NextResponse } from "next/server";

import { runCoreTurn, CoreTurnError } from "@/lib/core/run-turn";

type CoreRequestBody = { projectId?: string; message?: string };

function badRequest(error: string, hint?: string) {
  return NextResponse.json({ error, ...(hint ? { hint } : {}) }, { status: 400 });
}
function unavailable() {
  return NextResponse.json({ error: "LOGAN Core no disponible en este momento" }, { status: 503 });
}

export async function POST(req: NextRequest) {
  let body: CoreRequestBody;
  try { body = (await req.json().catch(() => ({}))) as CoreRequestBody; }
  catch { return badRequest("Cuerpo de la petición inválido"); }

  const projectId = (body.projectId || "").trim();
  const message = (body.message || "").trim();
  if (!projectId) return badRequest("Proyecto no encontrado", "Crea o selecciona un proyecto primero");
  if (!message) return badRequest("Mensaje vacío");

  try {
    const result = await runCoreTurn(projectId, message);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof CoreTurnError) {
      if (e.code === "bad_request") return badRequest(e.message, e.hint);
      return unavailable();
    }
    console.error("[core] Unexpected:", (e as Error).message);
    return unavailable();
  }
}
