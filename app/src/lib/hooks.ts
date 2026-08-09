"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Project,
  Vision,
  Decision,
  BacklogItem,
  SessionContext,
  PhaseProgress,
  Audit,
  Discovery,
  Hypothesis,
  MemoryEntry,
  MarketingAsset,
  DevAsset,
  DesignAsset,
  FinanceAsset,
  LegalAsset,
  SupportAsset,
  HypothesisInput,
} from "@/lib/logan-types";

const qk = {
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  vision: ["vision"] as const,
  decisions: (pid: string) => ["decisions", pid] as const,
  backlog: (pid: string) => ["backlog", pid] as const,
  sessions: (pid: string) => ["sessions", pid] as const,
  phases: (pid: string) => ["phases", pid] as const,
  audits: (pid: string) => ["audits", pid] as const,
  discoveries: (pid: string) => ["discoveries", pid] as const,
  hypotheses: (pid: string) => ["hypotheses", pid] as const,
  memory: (pid: string) => ["memory", pid] as const,
  marketing: (pid: string) => ["marketing", pid] as const,
  dev: (pid: string) => ["dev", pid] as const,
  design: (pid: string) => ["design", pid] as const,
  finance: (pid: string) => ["finance", pid] as const,
  legal: (pid: string) => ["legal", pid] as const,
  support: (pid: string) => ["support", pid] as const,
};

// ---------- Projects ----------
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: qk.projects,
    queryFn: () => api<Project[]>("/api/projects"),
    placeholderData: [],
  });
}

export function useProject(id: string | null) {
  return useQuery<Project | null>({
    queryKey: id ? qk.project(id) : ["project", "none"],
    queryFn: () => (id ? api<Project>(`/api/projects/${id}`) : Promise.resolve(null)),
    enabled: !!id,
    placeholderData: null,
  } as UseQueryOptions<Project | null>);
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; vision?: string; users?: string[] }) =>
      api<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: qk.projects });
      qc.setQueryData(qk.project(p.id), p);
    },
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Pick<Project, "vision" | "users" | "status" | "currentPhase" | "currentMode" | "repo">>) =>
      api<Project>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: (p) => {
      qc.setQueryData(qk.project(id), p);
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.projects }),
  });
}

// ---------- Vision ----------
export function useVision() {
  return useQuery<Vision | null>({
    queryKey: qk.vision,
    queryFn: async () => {
      try {
        const v = await api<Vision | null>("/api/vision");
        return v ?? null;
      } catch {
        return null;
      }
    },
    placeholderData: null,
  } as UseQueryOptions<Vision | null>);
}

export function useUpsertVision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api<Vision>("/api/vision", {
        method: "PUT",
        body: JSON.stringify({ content }),
      }),
    onSuccess: (v) => qc.setQueryData(qk.vision, v),
  });
}

// ---------- Decisions ----------
export function useDecisions(pid: string | null) {
  return useQuery<Decision[]>({
    queryKey: pid ? qk.decisions(pid) : ["decisions", "none"],
    queryFn: () => (pid ? api<Decision[]>(`/api/projects/${pid}/decisions`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<Decision[]>);
}

export function useCreateDecision(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Decision, "id" | "projectId" | "createdAt" | "updatedAt" | "date">) =>
      api<Decision>(`/api/projects/${pid}/decisions`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.decisions(pid) }),
  });
}

export function useUpdateDecision(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<Decision>) =>
      api<Decision>(`/api/decisions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.decisions(pid) }),
  });
}

export function useDeleteDecision(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/decisions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.decisions(pid) }),
  });
}

// ---------- Backlog ----------
export function useBacklog(pid: string | null) {
  return useQuery<BacklogItem[]>({
    queryKey: pid ? qk.backlog(pid) : ["backlog", "none"],
    queryFn: () => (pid ? api<BacklogItem[]>(`/api/projects/${pid}/backlog`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<BacklogItem[]>);
}

export function useCreateBacklogItem(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description: string; priority?: string }) =>
      api<BacklogItem>(`/api/projects/${pid}/backlog`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.backlog(pid) }),
  });
}

export function useUpdateBacklogItem(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<BacklogItem>) =>
      api<BacklogItem>(`/api/backlog/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.backlog(pid) }),
  });
}

export function useDeleteBacklogItem(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/backlog/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.backlog(pid) }),
  });
}

// ---------- Sessions ----------
export function useSessions(pid: string | null) {
  return useQuery<SessionContext[]>({
    queryKey: pid ? qk.sessions(pid) : ["sessions", "none"],
    queryFn: () => (pid ? api<SessionContext[]>(`/api/projects/${pid}/sessions`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<SessionContext[]>);
}

export function useCreateSession(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SessionContext>) =>
      api<SessionContext>(`/api/projects/${pid}/sessions`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions(pid) }),
  });
}

// ---------- Phases ----------
export function usePhases(pid: string | null) {
  return useQuery<PhaseProgress[]>({
    queryKey: pid ? qk.phases(pid) : ["phases", "none"],
    queryFn: () => (pid ? api<PhaseProgress[]>(`/api/projects/${pid}/phases`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<PhaseProgress[]>);
}

export function useUpdatePhase(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & Partial<Pick<PhaseProgress, "status" | "notes" | "completedAt">>) =>
      api<PhaseProgress>(`/api/phase-progress/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.phases(pid) }),
  });
}

// ---------- Audits ----------
export function useAudits(pid: string | null) {
  return useQuery<Audit[]>({
    queryKey: pid ? qk.audits(pid) : ["audits", "none"],
    queryFn: () => (pid ? api<Audit[]>(`/api/projects/${pid}/audits`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<Audit[]>);
}

export function useCreateAudit(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { deliverableName: string; checks: Record<string, boolean>; passed: boolean; notes?: string }) =>
      api<Audit>(`/api/projects/${pid}/audits`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.audits(pid) }),
  });
}

export function useDeleteAudit(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/audits/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.audits(pid) }),
  });
}

// ---------- Discoveries ----------
export function useDiscoveries(pid: string | null) {
  return useQuery<Discovery[]>({
    queryKey: pid ? qk.discoveries(pid) : ["discoveries", "none"],
    queryFn: () => (pid ? api<Discovery[]>(`/api/projects/${pid}/discoveries`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<Discovery[]>);
}

export function useCreateDiscovery(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; question: string; answer: string; classification: string }) =>
      api<Discovery>(`/api/projects/${pid}/discoveries`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.discoveries(pid) }),
  });
}

export function useDeleteDiscovery(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/discoveries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.discoveries(pid) }),
  });
}

// ---------- Hypotheses ----------
export function useHypotheses(pid: string | null) {
  return useQuery<Hypothesis[]>({
    queryKey: pid ? qk.hypotheses(pid) : ["hypotheses", "none"],
    queryFn: () => (pid ? api<Hypothesis[]>(`/api/projects/${pid}/hypotheses`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<Hypothesis[]>);
}

export function useCreateHypothesis(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HypothesisInput & { status?: string }) =>
      api<Hypothesis>(`/api/projects/${pid}/hypotheses`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.hypotheses(pid) }),
  });
}

export function useUpdateHypothesis(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & Partial<Pick<Hypothesis, "status" | "outcome" | "evidence" | "verifiedAt">>) =>
      api<Hypothesis>(`/api/hypotheses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
      qc.invalidateQueries({ queryKey: qk.marketing(pid) });
    },
  });
}

// ---------- Memory ----------
export function useMemory(pid: string | null) {
  return useQuery<MemoryEntry[]>({
    queryKey: pid ? qk.memory(pid) : ["memory", "none"],
    queryFn: () => (pid ? api<MemoryEntry[]>(`/api/projects/${pid}/memory`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<MemoryEntry[]>);
}

export function useCreateMemory(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { source: string; summary: string; changesDetected: string }) =>
      api<MemoryEntry>(`/api/projects/${pid}/memory`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.memory(pid) }),
  });
}

export function useDeleteMemory(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/memory/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.memory(pid) }),
  });
}

// ---------- Marketing ----------
export function useMarketing(pid: string | null) {
  return useQuery<MarketingAsset[]>({
    queryKey: pid ? qk.marketing(pid) : ["marketing", "none"],
    queryFn: () => (pid ? api<MarketingAsset[]>(`/api/projects/${pid}/marketing`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<MarketingAsset[]>);
}

export function useCreateMarketing(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      type: string;
      title: string;
      content: string;
      hypothesis?: HypothesisInput;
    }) =>
      api<MarketingAsset>(`/api/projects/${pid}/marketing`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.marketing(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteMarketing(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/marketing/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.marketing(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

// ---------- Dev ----------
export function useDev(pid: string | null) {
  return useQuery<DevAsset[]>({
    queryKey: pid ? qk.dev(pid) : ["dev", "none"],
    queryFn: () => (pid ? api<DevAsset[]>(`/api/projects/${pid}/dev`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<DevAsset[]>);
}

export function useCreateDev(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; title: string; content: string; hypothesis?: HypothesisInput }) =>
      api<DevAsset>(`/api/projects/${pid}/dev`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dev(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteDev(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/dev/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dev(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

// ---------- Design ----------
export function useDesign(pid: string | null) {
  return useQuery<DesignAsset[]>({
    queryKey: pid ? qk.design(pid) : ["design", "none"],
    queryFn: () => (pid ? api<DesignAsset[]>(`/api/projects/${pid}/design`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<DesignAsset[]>);
}

export function useCreateDesign(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; title: string; content: string; hypothesis?: HypothesisInput }) =>
      api<DesignAsset>(`/api/projects/${pid}/design`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.design(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteDesign(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/design/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.design(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

// ---------- Finance ----------
export function useFinance(pid: string | null) {
  return useQuery<FinanceAsset[]>({
    queryKey: pid ? qk.finance(pid) : ["finance", "none"],
    queryFn: () => (pid ? api<FinanceAsset[]>(`/api/projects/${pid}/finance`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<FinanceAsset[]>);
}

export function useCreateFinance(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; title: string; content: string; hypothesis?: HypothesisInput }) =>
      api<FinanceAsset>(`/api/projects/${pid}/finance`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.finance(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteFinance(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/finance/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.finance(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

// ---------- Legal ----------
export function useLegal(pid: string | null) {
  return useQuery<LegalAsset[]>({
    queryKey: pid ? qk.legal(pid) : ["legal", "none"],
    queryFn: () => (pid ? api<LegalAsset[]>(`/api/projects/${pid}/legal`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<LegalAsset[]>);
}

export function useCreateLegal(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; title: string; content: string; hypothesis?: HypothesisInput }) =>
      api<LegalAsset>(`/api/projects/${pid}/legal`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.legal(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteLegal(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/legal/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.legal(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

// ---------- Support ----------
export function useSupport(pid: string | null) {
  return useQuery<SupportAsset[]>({
    queryKey: pid ? qk.support(pid) : ["support", "none"],
    queryFn: () => (pid ? api<SupportAsset[]>(`/api/projects/${pid}/support`) : Promise.resolve([])),
    enabled: !!pid,
    placeholderData: [],
  } as UseQueryOptions<SupportAsset[]>);
}

export function useCreateSupport(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; title: string; content: string; hypothesis?: HypothesisInput }) =>
      api<SupportAsset>(`/api/projects/${pid}/support`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.support(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}

export function useDeleteSupport(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/support/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.support(pid) });
      qc.invalidateQueries({ queryKey: qk.hypotheses(pid) });
    },
  });
}
