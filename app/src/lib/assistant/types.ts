// LOGAN OS — Módulo Asistente IA — types.
//
// This is the customer-facing WhatsApp bot module (DEC-LOGAN-011).
// Different from LOGAN Core / specialists: this bot speaks in the PRODUCT's
// voice (not LOGAN's), talks to the product's clients (not the product owner),
// and does NOT persist anything (no Hypothesis, no Decision, no asset).
//
// Spanish UI text throughout. English code comments.

import type { Project } from "@prisma/client";

/** Subset of the Project fields used by the assistant system-prompt builder. */
export type AssistantProjectContext = Pick<
  Project,
  "id" | "name" | "vision" | "users" | "status" | "repo"
>;

/** A single message in the in-memory session conversation history. */
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ts: number; // epoch ms
};

/** Internal shape of a stored session. */
export type AssistantSession = {
  sessionId: string;
  projectId: string;
  messages: ChatMessage[]; // max 20 (oldest pruned when exceeded)
  createdAt: number;
  updatedAt: number;
};

/** Request body for POST /api/assistant/chat. */
export type AssistantRequestBody = {
  projectId?: string;
  message?: string;
  sessionId?: string;
};

/** Result of a rate-limit check (per-session). */
export type AssistantRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; resetInMs: number };

/** Successful response shape for POST /api/assistant/chat. */
export type AssistantChatResponse = {
  response: string;
  rateLimited: boolean;
  remaining: number;
};
