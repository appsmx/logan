// LOGAN OS — Módulo Asistente IA — per-session rate limiter.
//
// 20 messages per session (per client). After the cap, the API returns a fixed
// "rate limit reached" message and DOES NOT call the LLM (saves tokens + forces
// the client to escalate if they need more).
//
// In-memory only — serverless cold-starts will reset it. Acceptable for a
// WhatsApp bot (sessions are expected to be short — within minutes / hours).
//
// Per Art. III (simplicity): one module, one Map, one function. No external deps.
//
// Different from src/lib/showcase/rate-limit.ts: this is per-SESSION (per
// client WhatsApp ID), not per-IP. Sessions are identified by the caller
// (sessionId = `{projectId}:{waId}` in the webhook handler).

const WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_MESSAGES = 20;

type Bucket = {
  timestamps: number[]; // epoch ms of each message within the window
};

// Map<sessionId, Bucket>
const buckets = new Map<string, Bucket>();

// Garbage-collect stale buckets every 5 minutes to keep memory bounded.
let lastGc = Date.now();
function gc(now: number) {
  if (now - lastGc < 5 * 60 * 1000) return;
  lastGc = now;
  for (const [sid, b] of buckets) {
    b.timestamps = b.timestamps.filter((t) => now - t < WINDOW_MS);
    if (b.timestamps.length === 0) buckets.delete(sid);
  }
}

export type AssistantRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; resetInMs: number };

export function checkRateLimit(
  sessionId: string,
  now: number = Date.now(),
): AssistantRateLimitResult {
  gc(now);
  const b = buckets.get(sessionId) ?? { timestamps: [] };
  // Drop expired timestamps.
  b.timestamps = b.timestamps.filter((t) => now - t < WINDOW_MS);

  if (b.timestamps.length >= MAX_MESSAGES) {
    const oldest = b.timestamps[0];
    const resetInMs = Math.max(0, WINDOW_MS - (now - oldest));
    return { allowed: false, remaining: 0, resetInMs };
  }

  b.timestamps.push(now);
  buckets.set(sessionId, b);
  const remaining = MAX_MESSAGES - b.timestamps.length;
  return { allowed: true, remaining };
}

// Test helper (not used in prod route).
export function resetRateLimit(sessionId: string) {
  buckets.delete(sessionId);
}

export const RATE_LIMIT_WINDOW_MS = WINDOW_MS;
export const RATE_LIMIT_MAX_MESSAGES = MAX_MESSAGES;
