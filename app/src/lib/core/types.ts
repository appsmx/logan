// LOGAN Core — shared types for the POST /api/core endpoint.
//
// Etapa 2: single-LLM orchestrator.
// Etapa 3: marketing_execute delegation added.
// Etapa 4.5: dev_execute + design_execute delegation added.
//
// These types are deliberately portable (Art. III — simplicity).

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
      capability: string;
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
      brief: string;
    }
  | {
      // Etapa 4.5 — delegate to the real Dev specialist endpoint.
      type: "dev_execute";
      capability: string; // one of DEV_CAPABILITIES keys
      brief: string;
    }
  | {
      // Etapa 4.5 — delegate to the real Design specialist endpoint.
      type: "design_execute";
      capability: string; // one of DESIGN_CAPABILITIES keys
      brief: string;
    };

/** Constitutional self-check that Core includes in its response. */
export type ConstitutionalCheck = {
  approved: boolean;
  violated_article: string | null;
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
  | { type: "marketing_proposal"; hypothesisId: string; marketingAssetId: string }
  | {
      type: "marketing_execute";
      capability: string;
      marketingAssetId: string;
      hypothesisId: string;
      title: string;
    }
  | {
      // Etapa 4.5
      type: "dev_execute";
      capability: string;
      devAssetId: string;
      hypothesisId: string;
      title: string;
    }
  | {
      // Etapa 4.5
      type: "design_execute";
      capability: string;
      designAssetId: string;
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

/** A Marketing specialist deliverable for the integration LLM call. */
export type MarketingDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  marketingAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

/** A Dev specialist deliverable for the integration LLM call. */
export type DevDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  devAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

/** A Design specialist deliverable for the integration LLM call. */
export type DesignDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  designAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};
