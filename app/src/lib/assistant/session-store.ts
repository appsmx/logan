// LOGAN OS — Módulo Asistente IA — in-memory session store.
//
// Stores conversation history per sessionId (max 20 messages, expires after 30
// minutes of inactivity). Used to give the bot context within a session so it
// can remember what the client said (their name, what they asked, etc.).
//
// In-memory only — NOT persisted to the DB. Acceptable for a WhatsApp bot:
// sessions are short (minutes), and persistence would violate the constraint
// that the assistant doesn't write to the DB (DEC-LOGAN-004 / DEC-LOGAN-011).
//
// Per Art. III (simplicity): one module, one Map, simple helpers. No external deps.

import type { AssistantSession, ChatMessage } from "./types";

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_MESSAGES = 20; // max messages per session (older pruned)

// Map<sessionId, AssistantSession>
const sessions = new Map<string, AssistantSession>();

// Garbage-collect stale sessions every 5 minutes to keep memory bounded.
let lastGc = Date.now();
function gc(now: number) {
  if (now - lastGc < 5 * 60 * 1000) return;
  lastGc = now;
  for (const [sid, s] of sessions) {
    if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(sid);
  }
}

/**
 * Get the conversation history for a session (or empty array if expired/new).
 * Also prunes the session if it expired.
 */
export function getSessionHistory(
  sessionId: string,
  now: number = Date.now(),
): ChatMessage[] {
  gc(now);
  const s = sessions.get(sessionId);
  if (!s) return [];
  if (now - s.updatedAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return [];
  }
  return s.messages;
}

/**
 * Append a user + assistant turn to the session history.
 * Prunes the oldest messages when the session exceeds MAX_MESSAGES.
 */
export function appendToSession(
  sessionId: string,
  projectId: string,
  userMessage: string,
  assistantMessage: string,
  now: number = Date.now(),
): void {
  gc(now);
  let s = sessions.get(sessionId);
  if (!s || now - s.updatedAt > SESSION_TTL_MS) {
    s = {
      sessionId,
      projectId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    sessions.set(sessionId, s);
  }
  s.messages.push(
    { role: "user", content: userMessage, ts: now },
    { role: "assistant", content: assistantMessage, ts: now },
  );
  // Prune oldest when over capacity (keep the most recent MAX_MESSAGES).
  if (s.messages.length > MAX_MESSAGES) {
    s.messages = s.messages.slice(s.messages.length - MAX_MESSAGES);
  }
  s.updatedAt = now;
}

/** Test helper — clear a session. */
export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}

/** Test helper — clear ALL sessions (used by verification scripts). */
export function clearAllSessions() {
  sessions.clear();
}

export const SESSION_TTL_MS_EXPORT = SESSION_TTL_MS;
export const SESSION_MAX_MESSAGES_EXPORT = MAX_MESSAGES;
