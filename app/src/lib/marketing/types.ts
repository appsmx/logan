// LOGAN Marketing — shared types for the POST /api/marketing/execute endpoint.
//
// The Marketing specialist is the first real specialist of LOGAN OS (Etapa 3).
// It receives a capability + a brief + a project, returns a structured JSON
// deliverable + a hypothesis. The hypothesis is the differentiator
// (DEC-LOGAN-004) — without it, no learning.
//
// These types are portable (Art. III) and not tied to any LLM SDK.

/** The hypothesis embedded in every Marketing deliverable (mandatory). */
export type MarketingHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

/** The defensive parsed shape of the Marketing LLM response. */
export type MarketingResponse = {
  title: string;
  content: string;
  hypothesis: MarketingHypothesis;
};

/** The persisted Hypothesis row created for a Marketing deliverable. */
export type PersistedHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

/** The full payload returned by POST /api/marketing/execute. */
export type MarketingEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedHypothesis;
  marketingAssetId: string;
  hypothesisId: string;
};

/** Request body shape for POST /api/marketing/execute. */
export type MarketingRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
