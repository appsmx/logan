// LOGAN Design — shared types for the POST /api/design/execute endpoint.
//
// Design is the third real specialist of LOGAN OS (Etapa 4.5 alongside Dev).
// It receives a capability + a brief + a project, returns a structured JSON
// deliverable (UI spec / design system / prototype / asset) + a hypothesis.
// The hypothesis is the differentiator (DEC-LOGAN-004).

/** The hypothesis embedded in every Design deliverable (mandatory). */
export type DesignHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

/** The defensive parsed shape of the Design LLM response. */
export type DesignResponse = {
  title: string;
  content: string;
  hypothesis: DesignHypothesis;
};

/** The persisted Hypothesis row created for a Design deliverable. */
export type PersistedDesignHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

/** The full payload returned by POST /api/design/execute. */
export type DesignEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedDesignHypothesis;
  designAssetId: string;
  hypothesisId: string;
};

/** Request body shape for POST /api/design/execute. */
export type DesignRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
