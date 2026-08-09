// LOGAN Legal — shared types for the POST /api/legal/execute endpoint.

export type LegalHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

export type LegalResponse = {
  title: string;
  content: string;
  hypothesis: LegalHypothesis;
};

export type PersistedLegalHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

export type LegalEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedLegalHypothesis;
  legalAssetId: string;
  hypothesisId: string;
};

export type LegalRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
