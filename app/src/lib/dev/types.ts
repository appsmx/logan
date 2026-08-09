// LOGAN Dev — shared types for the POST /api/dev/execute endpoint.
//
// Dev is the second real specialist of LOGAN OS (Etapa 4.5).
// It receives a capability + a brief + a project, returns a structured JSON
// deliverable (code / architecture doc / review) + a hypothesis.
// The hypothesis is the differentiator (DEC-LOGAN-004).

/** The hypothesis embedded in every Dev deliverable (mandatory). */
export type DevHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

/** The defensive parsed shape of the Dev LLM response. */
export type DevResponse = {
  title: string;
  content: string;
  hypothesis: DevHypothesis;
};

/** The persisted Hypothesis row created for a Dev deliverable. */
export type PersistedDevHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

/** The full payload returned by POST /api/dev/execute. */
export type DevEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedDevHypothesis;
  devAssetId: string;
  hypothesisId: string;
};

/** Request body shape for POST /api/dev/execute. */
export type DevRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
