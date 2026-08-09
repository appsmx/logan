// LOGAN Support — shared types for the POST /api/support/execute endpoint.

export type SupportHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

export type SupportResponse = {
  title: string;
  content: string;
  hypothesis: SupportHypothesis;
};

export type PersistedSupportHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

export type SupportEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedSupportHypothesis;
  supportAssetId: string;
  hypothesisId: string;
};

export type SupportRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
