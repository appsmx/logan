// LOGAN Showcase — in-memory rate limiter.
// Limits: 5 messages per 10 minutes per IP.
// After 5, the API returns the "contact us" message instead of calling the LLM.
//
// This is in-memory only — not persistent. Serverless cold-starts will reset it,
// which is acceptable for the showcase (we want to limit casual abuse, not stop
// determined attackers — those would need a real token-bucket + Redis).
//
// Art. III (simplicity): one module, one Map, one function. No external deps.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

type Bucket = {
  timestamps: number[]; // epoch ms of each request within the window
};

// Map<ip, Bucket>
const buckets = new Map<string, Bucket>();

// Garbage-collect stale buckets every 5 minutes to keep memory bounded.
let lastGc = Date.now();
function gc(now: number) {
  if (now - lastGc < 5 * 60 * 1000) return;
  lastGc = now;
  for (const [ip, b] of buckets) {
    b.timestamps = b.timestamps.filter((t) => now - t < WINDOW_MS);
    if (b.timestamps.length === 0) buckets.delete(ip);
  }
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; resetInMs: number };

export function checkRateLimit(ip: string, now: number = Date.now()): RateLimitResult {
  gc(now);
  const b = buckets.get(ip) ?? { timestamps: [] };
  // Drop expired timestamps.
  b.timestamps = b.timestamps.filter((t) => now - t < WINDOW_MS);

  if (b.timestamps.length >= MAX_REQUESTS) {
    const oldest = b.timestamps[0];
    const resetInMs = Math.max(0, WINDOW_MS - (now - oldest));
    return { allowed: false, remaining: 0, resetInMs };
  }

  b.timestamps.push(now);
  buckets.set(ip, b);
  const remaining = MAX_REQUESTS - b.timestamps.length;
  return { allowed: true, remaining };
}

// Test helper (not used in prod route, but exported for completeness).
export function resetRateLimit(ip: string) {
  buckets.delete(ip);
}
