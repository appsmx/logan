// LOGAN OS — TypeScript types for API responses (mirrors Prisma models).

export type Project = {
  id: string;
  name: string;
  vision: string;
  users: string[]; // parsed from JSON
  status: string; // En construcción | En revisión | Oficial
  currentPhase: number;
  currentMode: string; // exploracion | arquitectura | construccion | auditoria | evolucion
  createdAt: string;
  updatedAt: string;
  _count?: {
    decisions: number;
    hypotheses: number;
    backlogItems: number;
    phaseProgress: number;
  };
};

export type Vision = {
  id: string;
  key: string;
  content: string;
  updatedAt: string;
};

export type Decision = {
  id: string;
  projectId: string;
  roleId: string;
  decId: string;
  title: string;
  problem: string;
  alternatives: string[]; // parsed
  decision: string;
  justification: string;
  consequences: string;
  status: string; // aprobada | propuesta | descartada
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type BacklogItem = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string; // pendiente | en_progreso | completada
  priority: string; // baja | media | alta
  createdAt: string;
  updatedAt: string;
};

export type SessionContext = {
  id: string;
  projectId: string;
  status: string;
  advance: string;
  objectiveCompleted: string;
  decisionsTaken: string[]; // parsed
  documentsUpdated: { doc: string; change: string }[]; // parsed
  pending: string;
  risks: string;
  nextObjective: string;
  observations: string;
  createdAt: string;
};

export type PhaseProgress = {
  id: string;
  projectId: string;
  phase: number;
  status: string; // pendiente | en_progreso | completada
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Audit = {
  id: string;
  projectId: string;
  deliverableName: string;
  checks: Record<string, boolean>; // parsed
  passed: boolean;
  notes: string;
  createdAt: string;
};

export type Discovery = {
  id: string;
  projectId: string;
  type: string; // contexto | restriccion | decision | validacion | riesgo
  question: string;
  answer: string;
  classification: string; // universal | especifico | temporal
  createdAt: string;
};

export type Hypothesis = {
  id: string;
  projectId: string;
  roleId: string;
  context: string;
  hypothesis: string;
  prediction: string;
  status: string; // pendiente | en_observacion | verificada | refutada
  outcome: string;
  evidence: string;
  createdAt: string;
  verifiedAt: string | null;
};

export type MemoryEntry = {
  id: string;
  projectId: string;
  source: string;
  summary: string;
  changesDetected: string;
  createdAt: string;
};

export type MarketingAsset = {
  id: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  hypothesisId: string | null;
  createdAt: string;
  hypothesis?: Hypothesis | null;
};

export type HypothesisInput = {
  roleId: string;
  context: string;
  hypothesis: string;
  prediction: string;
};
