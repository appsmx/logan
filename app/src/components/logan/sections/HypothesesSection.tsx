"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { RoleIcon } from "@/components/logan/RoleIcon";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import {
  useCreateHypothesis,
  useHypotheses,
  useUpdateHypothesis,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import {
  ROLES,
  HYPOTHESIS_STATUSES,
} from "@/lib/logan-os-data";
import {
  Lightbulb,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Quote,
} from "lucide-react";
import type { Hypothesis } from "@/lib/logan-types";
import { cn } from "@/lib/utils";

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

export function HypothesesSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useHypotheses(activeId);
  const create = useCreateHypothesis(activeId ?? "");
  const update = useUpdateHypothesis(activeId ?? "");

  const markObservation = (id: string) => {
    update.mutate(
      { id, status: "en_observacion" },
      {
        onSuccess: () => toast.success("Hipótesis en observación"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const [openNew, setOpenNew] = React.useState(false);
  const [roleId, setRoleId] = React.useState("marketing");
  const [context, setContext] = React.useState("");
  const [hyp, setHyp] = React.useState("");
  const [prediction, setPrediction] = React.useState("");

  const [verifying, setVerifying] = React.useState<Hypothesis | null>(null);
  const verifyMode = verifying?.status === "refutada" ? "refutada" : "verificada";

  const submitNew = () => {
    if (!activeId) return;
    if (!hyp.trim() || !prediction.trim()) {
      toast.error("Indica la hipótesis y la predicción");
      return;
    }
    create.mutate(
      {
        roleId,
        context: context.trim(),
        hypothesis: hyp.trim(),
        prediction: prediction.trim(),
        status: "pendiente",
      },
      {
        onSuccess: () => {
          setOpenNew(false);
          setContext("");
          setHyp("");
          setPrediction("");
          toast.success("Hipótesis registrada");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const items = list.data ?? [];
  const counts = HYPOTHESIS_STATUSES.map((s) => ({
    ...s,
    count: items.filter((h) => h.status === s.key).length,
  }));

  return (
    <section className="space-y-6" aria-labelledby="hipotesis-title">
      <SectionHeading
        eyebrow="Bucle de aprendizaje · El diferenciador"
        title="Hipótesis"
        icon="Lightbulb"
        description="Cada rol deja constancia de por qué decidió. Analytics verifica con el tiempo. Si se refuta, LOGAN aprende."
        actions={
          activeId ? (
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="size-4" />
              Nueva hipótesis
            </Button>
          ) : undefined
        }
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold text-primary">
                El mecanismo que distingue a LOGAN OS.
              </span>{" "}
              Toda decisión importante deja una hipótesis: el rol declara{" "}
              <em>creemos que X pasará porque Y</em>. Con el tiempo, Analytics
              verifica. Si la predicción se cumple, se confirma. Si no, LOGAN
              actualiza su estrategia. El sistema aprende de sus propios
              resultados.
            </p>
          </div>
        </CardContent>
      </Card>

      {activeId ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {counts.map((c) => (
              <Card key={c.key} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.name}
                  </span>
                  <StatusPill color={STATUS_COLOR[c.key]} dot={false}>
                    {c.count}
                  </StatusPill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                  {c.note}
                </p>
              </Card>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<Lightbulb className="size-5" />}
              title="Sin hipótesis registradas"
              description="Crea la primera. Una hipótesis es la constancia de por qué se tomó una decisión."
              action={
                <Button onClick={() => setOpenNew(true)}>
                  <Plus className="size-4" />
                  Nueva hipótesis
                </Button>
              }
            />
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {items.map((h) => (
                <AccordionItem
                  key={h.id}
                  value={h.id}
                  className="rounded-lg border bg-card px-4 last:border-b"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex w-full flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 text-left">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                          <RoleIcon
                            name={roleIcon(h.roleId)}
                            className="size-4"
                          />
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
                              <span className="font-medium text-foreground/70">
                                Predicción:{" "}
                              </span>
                              {h.prediction}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusPill color={STATUS_COLOR[h.status]}>
                          {
                            HYPOTHESIS_STATUSES.find((s) => s.key === h.status)
                              ?.name
                          }
                        </StatusPill>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 border-t pt-3">
                      {h.context && (
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Contexto
                          </div>
                          <p className="mt-1 text-sm text-foreground/85 leading-relaxed">
                            {h.context}
                          </p>
                        </div>
                      )}
                      {(h.status === "verificada" ||
                        h.status === "refutada") && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {h.outcome && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Resultado
                              </div>
                              <p className="mt-1 text-sm text-foreground/85 leading-relaxed">
                                {h.outcome}
                              </p>
                            </div>
                          )}
                          {h.evidence && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Evidencia
                              </div>
                              <p className="mt-1 text-sm text-foreground/85 leading-relaxed">
                                {h.evidence}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {h.verifiedAt && (
                        <div className="text-[11px] text-muted-foreground">
                          Verificada el {shortDate(h.verifiedAt)}
                        </div>
                      )}
                      {(h.status === "pendiente" ||
                        h.status === "en_observacion") && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {h.status === "pendiente" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markObservation(h.id)}
                            >
                              <Eye className="size-3.5" />
                              Marcar en observación
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-success/40 text-success hover:bg-success/10 hover:text-success"
                            onClick={() =>
                              setVerifying({ ...h, status: "verificada" })
                            }
                          >
                            <CheckCircle2 className="size-3.5" />
                            Verificar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setVerifying({ ...h, status: "refutada" })
                            }
                          >
                            <XCircle className="size-3.5" />
                            Refutar
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  <span className="font-semibold">Cierre del bucle.</span>{" "}
                  Cuando una hipótesis se refuta, Analytics registra el
                  aprendizaje. Si es universal, migra a LOGAN (Art. VIII).{" "}
                  <span className="text-muted-foreground">
                    El sistema no comete el mismo error dos veces.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<Lightbulb className="size-5" />}
          title="Sin proyecto activo"
          description="El bucle de aprendizaje vive dentro de un proyecto. Crea o selecciona uno para empezar a registrar hipótesis."
        />
      )}

      {/* New hypothesis dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Lightbulb className="size-4 text-primary" />
              Nueva hipótesis
            </DialogTitle>
            <DialogDescription>
              La constancia de por qué se tomó una decisión. Analytics la
              verificará con el tiempo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Rol que propone</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hyp-context">Contexto</Label>
              <Textarea
                id="hyp-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
                placeholder="¿Qué situación disparó esta hipótesis?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hyp-text">Hipótesis *</Label>
              <Textarea
                id="hyp-text"
                value={hyp}
                onChange={(e) => setHyp(e.target.value)}
                rows={2}
                placeholder="Creemos que X pasará porque Y."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hyp-pred">Predicción medible *</Label>
              <Textarea
                id="hyp-pred"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                rows={2}
                placeholder="¿Qué resultado observable esperamos?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenNew(false)}>
              Cancelar
            </Button>
            <Button onClick={submitNew} disabled={create.isPending}>
              {create.isPending ? "Guardando…" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify / Refute dialog */}
      <VerifyRefuteDialog
        hypothesis={verifying}
        mode={verifyMode}
        onOpenChange={(v) => !v && setVerifying(null)}
      />
    </section>
  );
}

function VerifyRefuteDialog({
  hypothesis,
  mode,
  onOpenChange,
}: {
  hypothesis: Hypothesis | null;
  mode: "verificada" | "refutada";
  onOpenChange: (v: boolean) => void;
}) {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const update = useUpdateHypothesis(activeId ?? "");
  const [outcome, setOutcome] = React.useState("");
  const [evidence, setEvidence] = React.useState("");

  React.useEffect(() => {
    if (hypothesis) {
      setOutcome("");
      setEvidence("");
    }
  }, [hypothesis]);

  if (!hypothesis) return null;

  const submit = () => {
    if (!outcome.trim()) {
      toast.error("Indica qué pasó en realidad");
      return;
    }
    update.mutate(
      {
        id: hypothesis.id,
        status: mode,
        outcome: outcome.trim(),
        evidence: evidence.trim(),
        verifiedAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success(
            mode === "verificada"
              ? "Hipótesis verificada"
              : "Hipótesis refutada — LOGAN aprende",
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const isVerify = mode === "verificada";

  return (
    <Dialog open={!!hypothesis} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2 font-serif",
              isVerify ? "text-success" : "text-destructive",
            )}
          >
            {isVerify ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <XCircle className="size-4" />
            )}
            {isVerify ? "Verificar hipótesis" : "Refutar hipótesis"}
          </DialogTitle>
          <DialogDescription>
            {isVerify
              ? "La predicción se cumplió. Analytics la confirma."
              : "La predicción no se cumplió. LOGAN actualiza su estrategia."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Hipótesis
            </div>
            <p className="mt-1 italic text-foreground">{hypothesis.hypothesis}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vr-outcome">Resultado (qué pasó en realidad)</Label>
            <Textarea
              id="vr-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vr-evidence">Evidencia</Label>
            <Textarea
              id="vr-evidence"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              placeholder="Datos o medidas que respaldan el resultado."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={update.isPending}
            className={cn(
              isVerify
                ? "bg-success text-success-foreground hover:bg-success/90"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {update.isPending
              ? "Guardando…"
              : isVerify
                ? "Verificar"
                : "Refutar y aprender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
