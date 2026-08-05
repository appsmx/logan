// LOGAN Core — shared types for the POST /api/core endpoint.
//
// Core is the orchestrator of LOGAN OS (Etapa 2). It receives a user message,
// reads its Constitution + LOGAN OS manual + Roles + the project's Biblia +
// an auto-generated Memory Report, decides, returns a structured JSON response,
// which the backend then persists and validates against the Constitution.
//
// Etapa 3 (LOGAN Marketing) extension: Core now emits a new action type
// `marketing_execute` to delegate real marketing work to the Marketing
// specialist endpoint (POST /api/marketing/execute). The backend executes
// those delegations, then runs a SECOND Core LLM call to integrate the
// specialist deliverables into a single LOGAN-voice response.
//
// These types are deliberately portable (Art. III — simplicity) and not tied
// to any LLM SDK or framework.

import type { Project } from "@prisma/client";

/** A single action that Core proposes to persist to the DB. */
export type CoreAction =
  | {
      type: "register_decision";
      roleId: string;
      title: string;
      problem: string;
      alternatives: string[];
      decision: string;
      justification: string;
      consequences: string;
      status?: string; // aprobada | propuesta | descartada (default aprobada)
    }
  | {
      type: "register_hypothesis";
      roleId: string;
      context: string;
      hypothesis: string;
      prediction: string;
    }
  | {
      type: "marketing_proposal"; // LEGACY — Core improvising. Kept for backward compat.
      capability: string; // MARKETING_CAPABILITIES key
      title: string;
      content: string;
      hypothesisContext: string;
      hypothesis: string;
      hypothesisPrediction: string;
    }
  | {
      // Etapa 3 — delegate to the real Marketing specialist endpoint.
      type: "marketing_execute";
      capability: string; // one of MARKETING_CAPABILITIES keys
      brief: string; // restated user request with context
    };

/** Constitutional self-check that Core includes in its response. */
export type ConstitutionalCheck = {
  approved: boolean;
  violated_article: string | null; // roman numeral e.g. "III", or null
  note: string;
};

/** Session update that Core proposes for SESSION_CONTEXT. */
export type SessionUpdate = {
  advance?: string;
  pending?: string;
  nextObjective?: string;
  risks?: string;
};

/** The parsed, defensive shape of Core's structured JSON response. */
export type CoreResponse = {
  response: string;
  actions: CoreAction[];
  constitutional_check: ConstitutionalCheck;
  session_update: SessionUpdate;
};

/** Result of a single action persisted to the DB. */
export type ActionTaken =
  | { type: "register_decision"; decId: string; id: string }
  | { type: "register_hypothesis"; id: string }
  | {
      type: "marketing_proposal";
      hypothesisId: string;
      marketingAssetId: string;
    }
  | {
      // Etapa 3 — Marketing specialist delegation. The Marketing endpoint
      // already persisted the Hypothesis + MarketingAsset; Core just records
      // the IDs for the UI to render the badge.
      type: "marketing_execute";
      capability: string;
      marketingAssetId: string;
      hypothesisId: string;
      title: string;
    };

/** The full payload returned by the POST /api/core endpoint. */
export type CoreEndpointResult = {
  response: string;
  actionsTaken: ActionTaken[];
  constitutionalCheck: {
    approved: boolean;
    violatedArticle: string | null;
    note: string;
  };
  sessionId: string;
};

/** Subset of the Project fields used by the system-prompt builder. */
export type ProjectBibliaContext = Pick<
  Project,
  "id" | "name" | "vision" | "users" | "status" | "currentPhase" | "currentMode"
>;

/**
 * A Marketing specialist deliverable that Core receives back from the
 * Marketing endpoint during the integration step. Used internally by the
 * Core route when running the second "integration" LLM call.
 */
export type MarketingDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  marketingAssetId: string;
  hypothesis: {
    context: string;
    hypothesis: string;
    prediction: string;
  };
};
