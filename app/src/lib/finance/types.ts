// LOGAN Finance — shared types for the POST /api/finance/execute endpoint.

export type FinanceHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

export type FinanceResponse = {
  title: string;
  content: string;
  hypothesis: FinanceHypothesis;
};

export type PersistedFinanceHypothesis = {
  id: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string;
};

export type FinanceEndpointResult = {
  title: string;
  content: string;
  hypothesis: PersistedFinanceHypothesis;
  financeAssetId: string;
  hypothesisId: string;
};

export type FinanceRequestBody = {
  projectId?: string;
  capability?: string;
  brief?: string;
  contextualAssets?: string[];
};
