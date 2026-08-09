// LOGAN Core — shared types for the POST /api/core endpoint.
//
// Etapa 2: single-LLM orchestrator.
// Etapa 3: marketing_execute delegation added.
// Etapa 4.5: dev_execute + design_execute delegation added.
// Analytics: analytics_verify + analytics_patterns delegation added.

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
      status?: string;
    }
  | {
      type: "register_hypothesis";
      roleId: string;
      context: string;
      hypothesis: string;
      prediction: string;
    }
  | {
      type: "marketing_proposal"; // LEGACY
      capability: string;
      title: string;
      content: string;
      hypothesisContext: string;
      hypothesis: string;
      hypothesisPrediction: string;
    }
  | {
      type: "marketing_execute";
      capability: string;
      brief: string;
    }
  | {
      type: "dev_execute";
      capability: string;
      brief: string;
    }
  | {
      type: "design_execute";
      capability: string;
      brief: string;
    }
  | {
      // Analytics — verify a single hypothesis by ID.
      // Core passes the hypothesisId it wants to verify plus what it knows
      // about the outcome/evidence from the user's message.
      type: "analytics_verify";
      hypothesisId: string;
      outcome: string;   // what actually happened
      evidence: string;  // data / metrics supporting the outcome
      brief?: string;    // extra context for the LLM
    }
  | {
      // Analytics — analyze all hypothesis patterns for the project.
      type: "analytics_patterns";
      roleFilter?: string;   // optional: "marketing" | "dev" | "design" | "core"
      statusFilter?: string; // optional: "pendiente" | "refutada" | "verificada"
      brief?: string;
    }
  | {
      // Finance — delegate financial analysis to the Finance specialist.
      type: "finance_execute";
      capability: string; // one of FINANCE_CAPABILITIES keys
      brief: string;
    }
  | {
      // Legal — delegate legal analysis to the Legal specialist.
      type: "legal_execute";
      capability: string; // one of LEGAL_CAPABILITIES keys
      brief: string;
    }
  | {
      // Support — delegate customer support analysis to the Support specialist.
      type: "support_execute";
      capability: string; // one of SUPPORT_CAPABILITIES keys
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
  | { type: "marketing_execute"; capability: string; marketingAssetId: string; hypothesisId: string; title: string }
  | { type: "dev_execute"; capability: string; devAssetId: string; hypothesisId: string; title: string }
  | { type: "design_execute"; capability: string; designAssetId: string; hypothesisId: string; title: string }
  | {
      type: "analytics_verify";
      hypothesisId: string;
      verdict: string;          // "verificada" | "refutada"
      analyticsHypothesisId: string;
      title: string;
    }
  | {
      type: "analytics_patterns";
      analyticsHypothesisId: string;
      hypothesesAnalyzed: number;
      title: string;
    }
  | {
      type: "finance_execute";
      capability: string;
      financeAssetId: string;
      hypothesisId: string;
      title: string;
    }
  | {
      type: "legal_execute";
      capability: string;
      legalAssetId: string;
      hypothesisId: string;
      title: string;
    }
  | {
      type: "support_execute";
      capability: string;
      supportAssetId: string;
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

export type MarketingDeliverable = {
  capability: string; capabilityLabel: string; title: string; content: string;
  hypothesisId: string; marketingAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

export type DevDeliverable = {
  capability: string; capabilityLabel: string; title: string; content: string;
  hypothesisId: string; devAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

export type DesignDeliverable = {
  capability: string; capabilityLabel: string; title: string; content: string;
  hypothesisId: string; designAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

/** An Analytics deliverable (verify or patterns) for the integration LLM call. */
export type AnalyticsDeliverable = {
  kind: "verify" | "patterns";
  title: string;
  content: string;           // the markdown report from Analytics
  verdict?: string;          // "verificada" | "refutada" (only for verify)
  hypothesisId?: string;     // the hypothesis that was verified (only for verify)
  analyticsHypothesisId: string;
  hypothesesAnalyzed?: number; // only for patterns
  topLearnings?: string[];
};


/** A Finance specialist deliverable for the integration LLM call. */
export type FinanceDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  financeAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

/** A Legal specialist deliverable for the integration LLM call. */
export type LegalDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  legalAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};

/** A Support specialist deliverable for the integration LLM call. */
export type SupportDeliverable = {
  capability: string;
  capabilityLabel: string;
  title: string;
  content: string;
  hypothesisId: string;
  supportAssetId: string;
  hypothesis: { context: string; hypothesis: string; prediction: string };
};
