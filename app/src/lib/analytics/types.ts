// LOGAN Analytics — shared types for the analytics endpoints.
//
// Analytics is the role that closes the learning loop (DEC-LOGAN-004).
// Unlike other specialists, Analytics doesn't generate new deliverables —
// it verifies existing Hypothesis rows and extracts learnings.
//
// Two endpoints:
//   POST /api/analytics/verify   — verify a single hypothesis
//   POST /api/analytics/patterns — analyze patterns across all hypotheses

/** Verdict for a hypothesis verification. */
export type AnalyticsVerdict = "verificada" | "refutada";

/** The learning extracted from a verification. */
export type AnalyticsLearning = {
  isUniversal: boolean;       // true → should migrate to LOGAN.md (Art. VIII)
  summary: string;            // what was learned
  recommendation: string;     // concrete next action for the responsible role
};

/** The hypothesis Analytics generates about its own verification. */
export type AnalyticsHypothesis = {
  context: string;
  hypothesis: string;
  prediction: string;
};

/** The parsed LLM response for a verification. */
export type AnalyticsVerificationResponse = {
  verdict: AnalyticsVerdict;
  title: string;
  content: string;            // full markdown report
  learning: AnalyticsLearning;
  hypothesis: AnalyticsHypothesis;
};

/** The full payload returned by POST /api/analytics/verify. */
export type AnalyticsVerifyResult = {
  hypothesisId: string;
  verdict: AnalyticsVerdict;
  title: string;
  content: string;
  learning: AnalyticsLearning;
  analyticsHypothesisId: string; // the new hypothesis Analytics itself generated
};

/** Request body for POST /api/analytics/verify. */
export type AnalyticsVerifyBody = {
  projectId?: string;
  hypothesisId?: string;
  outcome?: string;     // what actually happened
  evidence?: string;    // data / metrics supporting the outcome
  brief?: string;       // optional extra context for the LLM
};

/** A summary of a single hypothesis for pattern analysis. */
export type HypothesisSummary = {
  id: string;
  roleId: string;
  hypothesis: string;
  prediction: string;
  status: string;
  outcome: string;
  createdAt: string;
  verifiedAt: string | null;
};

/** The parsed LLM response for a pattern analysis. */
export type AnalyticsPatternsResponse = {
  title: string;
  content: string;            // full markdown report with patterns + insights
  topLearnings: string[];     // 3-5 bullet points of key learnings
  universalCandidates: string[]; // learnings that might migrate to LOGAN.md
  hypothesis: AnalyticsHypothesis;
};

/** The full payload returned by POST /api/analytics/patterns. */
export type AnalyticsPatternsResult = {
  projectId: string;
  title: string;
  content: string;
  topLearnings: string[];
  universalCandidates: string[];
  analyticsHypothesisId: string;
  hypothesesAnalyzed: number;
};

/** Request body for POST /api/analytics/patterns. */
export type AnalyticsPatternsBody = {
  projectId?: string;
  roleFilter?: string;   // optional: filter by roleId (e.g. "marketing")
  statusFilter?: string; // optional: filter by status (e.g. "refutada")
};
