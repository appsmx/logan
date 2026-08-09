"use client";

import * as React from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { RoleIcon } from "@/components/logan/RoleIcon";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import {
  ROLES, HYPOTHESIS_STATUSES, ANALYTICS_CAPABILITIES,
} from "@/lib/logan-os-data";
import { useHypotheses, useUpdateHypothesis } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import {
  BarChart2, CheckCircle2, XCircle, Eye, RefreshCw,
  Quote, Lightbulb, BookOpen, Sparkles,
} from "lucide-react";
import type { Hypothesis } from "@/lib/logan-types";
import { cn } from "@/lib/utils";

const ANALYTICS_ROLE = ROLES.find((r) => r.key === "analytics")!;

const STATUS_COLOR: Record<string, StatusColor> = {
  pendiente: "muted",
  en_observacion: "warning",
  verificada: "success",
  refutada: "destructive",
};

function roleLabel(key: string) {
  return ROLES.find((r) => r.key === key)?.name ?? key;
}
function roleIcon(key: string) {
  return ROLES.find((r) => r.key === key)?.icon ?? "Brain";
}

type StatusFilter = "all" | "pendiente" | "en_observacion" | "verificada" | "refutada";

export function AnalyticsSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useHypotheses(activeId);
  const update = useUpdateHypothesis(activeId ?? "");

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [verifying, setVerifying] = React.useState<{ hyp: Hypothesis; mode: "verificada" | "refutada" } | null>(null);

  const allItems = list.data ?? [];

  const filtered = allItems.filter((h) => {
    if (statusFilter !== "all" && h.status !== statusFilter) return false;
    if (roleFilter !== "all" && h.roleId !== roleFilter) return false;
    return true;
  });

  const counts = {
    total: allItems.length,
    pendiente: allItems.filter((h) => h.status === "pendiente").length,
    en_observacion: allItems.filter((h) => h.status === "en_observacion").length,
    verificada: allItems.filter((h) => h.status === "verificada").length,
    refutada: allItems.filter((h) => h.status === "refutada").length,
  };

  const uniqueRoles = [...new Set(allItems.map((h) => h.roleId))];

  const markObservation = (id: string) => {
    update.mutate(
      { id, status: "en_observacion" },
      {
        onSuccess: () => toast.success("Hipótesis en observación"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="analytics-title">
      <SectionHeading
        eyebrow="Rol especialista · Activo"
        title="Analytics"
        icon="BarChart2"
        description="Cierra el bucle de aprendizaje. Verifica las hipótesis de todos los roles: Marketing, Dev, Design, Core. Si se refuta, LOGAN aprende."
      />

      <Card className="border-t-2 border-t-success/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-serif text-lg">
            <span className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success ring-1 ring-success/25">
              <RoleIcon name={ANALYTICS_ROLE?.icon ?? "BarChart2"} className="size-5" />
            </span>
            {ANALYTICS_ROLE?.name ?? "Analytics"}
          </CardTitle>
          <CardDescription>{ANALYTICS_ROLE?.tagline ?? "Verifica las hipótesis. Cierra el bucle de aprendizaje."}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(ANALYTICS_ROLE?.responsibilities ?? ANALYTICS_CAPABILITIES.map((c) => c.label)).map((r) => (
              <li key={r} className="flex items-start gap-2 rounded-md border bg-card/40 px-3 py-2 text-sm">
                <BarChart2 className="mt-0.5 size-3.5 shrink-0 text-success/70" />
                <span className="text-foreground/90">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {activeId ? (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Total", count: counts.total, color: "muted" as StatusColor },
              { label: "Pendiente", count: counts.pendiente, color: "muted" as StatusColor },
              { label: "Observando", count: counts.en_observacion, color: "warning" as StatusColor },
              { label: "Verificadas", count: counts.verificada, color: "success" as StatusColor },
              { label: "Refutadas", count: counts.refutada, color: "destructive" as StatusColor },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</span>
                  <StatusPill color={s.color} dot={false}>{s.count}</StatusPill>
                </div>
              </Card>
            ))}
          </div>

          {/* Learning cycle info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/90">
                  <span className="font-semibold text-primary">El bucle completo.</span>{" "}
                  Especialista genera hipótesis → Acción real del mundo → Analytics verifica →
                  Aprendizaje extraído. Si <code className="rounded bg-muted px-1 text-xs">isUniversal</code>,
                  el aprendizaje migra a <code className="rounded bg-muted px-1 text-xs">LOGAN.md</code> (Art. VIII).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          {allItems.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground shrink-0">Estado</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {HYPOTHESIS_STATUSES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {uniqueRoles.length > 1 && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">Rol</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      {uniqueRoles.map((r) => (
                        <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Hypothesis list */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BarChart2 className="size-5" />}
              title={allItems.length === 0 ? "Sin hipótesis todavía" : "Sin resultados con este filtro"}
              description={allItems.length === 0
                ? "Cuando Marketing, Dev o Design generen entregables, sus hipótesis aparecerán aquí para que Analytics las verifique."
                : "Prueba cambiando el filtro de estado o rol."}
            />
          ) : (
            <div>
              <h3 className="mb-3 font-serif text-lg text-foreground">
                Hipótesis para verificar
                {filtered.length !== allItems.length && (
                  <span className="ml-2 text-sm font-sans text-muted-foreground">({filtered.length} de {allItems.length})</span>
                )}
              </h3>
              <Accordion type="multiple" className="space-y-3">
                {filtered.map((h) => (
                  <AccordionItem key={h.id} value={h.id} className="rounded-lg border bg-card px-4 last:border-b">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 text-left">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                            <RoleIcon name={roleIcon(h.roleId)} className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                              <span>{roleLabel(h.roleId)}</span>
                              <span>·</span>
                              <span>{shortDate(h.createdAt)}</span>
                            </div>
                            <p className="mt-0.5 font-serif text-sm text-foreground italic">
                              <Quote className="inline size-3 mr-1 text-primary/60" />
                              {h.hypothesis}
                            </p>
                            {h.prediction && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/70">Predicción: </span>{h.prediction}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusPill color={STATUS_COLOR[h.status]}>
                          {HYPOTHESIS_STATUSES.find((s) => s.key === h.status)?.name}
                        </StatusPill>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 border-t pt-3">
                        {h.context && (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Contexto</div>
                            <p className="mt-1 text-sm text-foreground/85 leading-relaxed">{h.context}</p>
                          </div>
                        )}
                        {(h.status === "verificada" || h.status === "refutada") && (
                          <div className={cn(
                            "rounded-md border p-3",
                            h.status === "verificada" ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20",
                          )}>
                            <div className={cn(
                              "flex items-center gap-1.5 text-[10px] uppercase tracking-widest",
                              h.status === "verificada" ? "text-success" : "text-destructive",
                            )}>
                              {h.status === "verificada"
                                ? <><CheckCircle2 className="size-3" />Verificada</>
                                : <><XCircle className="size-3" />Refutada — aprendizaje registrado</>}
                            </div>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {h.outcome && (
                                <div className="text-xs">
                                  <span className="font-medium text-foreground/70">Resultado: </span>
                                  <span className="text-foreground/85">{h.outcome}</span>
                                </div>
                              )}
                              {h.evidence && (
                                <div className="text-xs">
                                  <span className="font-medium text-foreground/70">Evidencia: </span>
                                  <span className="text-foreground/85">{h.evidence}</span>
                                </div>
                              )}
                            </div>
                            {h.verifiedAt && (
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                Verificada el {shortDate(h.verifiedAt)}
                              </div>
                            )}
                          </div>
                        )}
                        {(h.status === "pendiente" || h.status === "en_observacion") && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {h.status === "pendiente" && (
                              <Button size="sm" variant="outline" onClick={() => markObservation(h.id)}>
                                <Eye className="size-3.5" />Marcar en observación
                              </Button>
                            )}
                            <Button size="sm" variant="outline"
                              className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                              onClick={() => setVerifying({ hyp: h, mode: "verificada" })}>
                              <CheckCircle2 className="size-3.5" />Verificar
                            </Button>
                            <Button size="sm" variant="outline"
                              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setVerifying({ hyp: h, mode: "refutada" })}>
                              <XCircle className="size-3.5" />Refutar
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Bottom learning note */}
          {counts.refutada > 0 && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {counts.refutada} {counts.refutada === 1 ? "hipótesis refutada" : "hipótesis refutadas"} — el sistema aprendió.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cada refutación es una corrección de rumbo. Los aprendizajes universales migran a LOGAN.md (Art. VIII).
                      Usa <code className="rounded bg-muted px-1">POST /api/analytics/patterns</code> para un análisis completo de tendencias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="Analytics vive dentro de un proyecto. Cuando los especialistas generen hipótesis, Analytics las verifica aquí."
        />
      )}

      <VerifyRefuteDialog
        data={verifying}
        onOpenChange={(v) => !v && setVerifying(null)}
      />
    </section>
  );
}

function VerifyRefuteDialog({
  data, onOpenChange,
}: {
  data: { hyp: Hypothesis; mode: "verificada" | "refutada" } | null;
  onOpenChange: (v: boolean) => void;
}) {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const update = useUpdateHypothesis(activeId ?? "");
  const [outcome, setOutcome] = React.useState("");
  const [evidence, setEvidence] = React.useState("");

  React.useEffect(() => {
    if (data) { setOutcome(""); setEvidence(""); }
  }, [data]);

  if (!data) return null;
  const { hyp, mode } = data;
  const isVerify = mode === "verificada";

  const submit = () => {
    if (!outcome.trim()) { toast.error("Indica qué pasó en realidad"); return; }
    update.mutate(
      { id: hyp.id, status: mode, outcome: outcome.trim(), evidence: evidence.trim(), verifiedAt: new Date().toISOString() },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success(isVerify ? "Hipótesis verificada" : "Hipótesis refutada — LOGAN aprende");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Dialog open={!!data} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2 font-serif", isVerify ? "text-success" : "text-destructive")}>
            {isVerify ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {isVerify ? "Verificar hipótesis" : "Refutar hipótesis"}
          </DialogTitle>
          <DialogDescription>
            {isVerify ? "La predicción se cumplió. Analytics la confirma." : "La predicción no se cumplió. LOGAN actualiza su estrategia."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hipótesis a cerrar</div>
            <p className="mt-1 italic text-foreground">{hyp.hypothesis}</p>
            {hyp.prediction && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">Predicción: </span>{hyp.prediction}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="an-outcome">Resultado (qué pasó en realidad) *</Label>
            <Textarea id="an-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={3} autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="an-evidence">Evidencia</Label>
            <Textarea id="an-evidence" value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={2}
              placeholder="Datos o medidas que respaldan el resultado." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={update.isPending}
            className={cn(isVerify
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
            {update.isPending ? "Guardando…" : isVerify ? "Verificar" : "Refutar y aprender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
