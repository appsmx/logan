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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import { RoleIcon } from "@/components/logan/RoleIcon";
import {
  ROLES,
  MARKETING_CAPABILITIES,
  MARKETING_ASSET_TYPES,
  HYPOTHESIS_STATUSES,
} from "@/lib/logan-os-data";
import {
  useCreateMarketing,
  useDeleteMarketing,
  useMarketing,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import {
  Megaphone,
  Plus,
  Trash2,
  Lightbulb,
  Link as LinkIcon,
} from "lucide-react";

const MARKETING_ROLE = ROLES.find((r) => r.key === "marketing")!;

const STATUS_COLOR: Record<string, StatusColor> = {
  pendiente: "muted",
  en_observacion: "warning",
  verificada: "success",
  refutada: "destructive",
};

function hypStatusName(s: string) {
  return HYPOTHESIS_STATUSES.find((x) => x.key === s)?.name ?? s;
}

export function MarketingSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useMarketing(activeId);
  const del = useDeleteMarketing(activeId ?? "");
  const [createOpen, setCreateOpen] = React.useState<string | null>(null);

  const items = list.data ?? [];

  return (
    <section className="space-y-6" aria-labelledby="marketing-title">
      <SectionHeading
        eyebrow="Rol especialista · Activo"
        title="Marketing"
        icon="Megaphone"
        description="El primer rol especialista real. Cada entregable lleva una hipótesis asociada: el diferenciador del sistema."
      />

      <Card className="border-t-2 border-t-success/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-serif text-lg">
            <span className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success ring-1 ring-success/30">
              <RoleIcon name={MARKETING_ROLE.icon} className="size-5" />
            </span>
            {MARKETING_ROLE.name}
          </CardTitle>
          <CardDescription>{MARKETING_ROLE.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-3">
            {MARKETING_ROLE.responsibilities.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2 rounded-md border bg-card/40 px-3 py-2 text-sm"
              >
                <Megaphone className="mt-0.5 size-3.5 shrink-0 text-success/70" />
                <span className="text-foreground/90">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {activeId ? (
        <>
          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Capacidades
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MARKETING_CAPABILITIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCreateOpen(c.key)}
                  className="group flex flex-col gap-1.5 rounded-lg border bg-card p-4 text-left transition-all hover:shadow-sm hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {c.label}
                    </span>
                    <Plus className="size-3.5 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.description}
                  </p>
                  <span className="mt-2 inline-flex w-fit items-center rounded-md bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {MARKETING_ASSET_TYPES[c.producesAssetType]?.label ??
                      c.producesAssetType}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Entregables de Marketing
            </h3>
            {items.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="size-5" />}
                title="Sin entregables todavía"
                description="Toca una capacidad para crear el primer entregable. Cada uno irá atado a una hipótesis."
              />
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {items.map((a) => (
                  <AccordionItem
                    key={a.id}
                    value={a.id}
                    className="rounded-lg border bg-card px-4 last:border-b"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 text-left">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span>
                              {MARKETING_ASSET_TYPES[a.type]?.label ?? a.type}
                            </span>
                            <span>·</span>
                            <span>{shortDate(a.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 font-serif text-sm text-foreground">
                            {a.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {a.content}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {a.hypothesis && (
                            <StatusPill
                              color={STATUS_COLOR[a.hypothesis.status]}
                            >
                              <LinkIcon className="size-3" />
                              {hypStatusName(a.hypothesis.status)}
                            </StatusPill>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 border-t pt-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Contenido
                          </div>
                          <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm text-foreground/90 logan-scroll">
                            {a.content}
                          </pre>
                        </div>
                        {a.hypothesis && (
                          <div className="rounded-md border bg-primary/5 p-3">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary">
                              <Lightbulb className="size-3" />
                              Hipótesis asociada
                            </div>
                            <p className="mt-1 text-sm italic text-foreground">
                              {a.hypothesis.hypothesis}
                            </p>
                            {a.hypothesis.prediction && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                <span className="font-medium">Predicción: </span>
                                {a.hypothesis.prediction}
                              </p>
                            )}
                            {(a.hypothesis.status === "verificada" ||
                              a.hypothesis.status === "refutada") && (
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {a.hypothesis.outcome && (
                                  <div className="text-xs">
                                    <span className="font-medium text-foreground/70">
                                      Resultado:{" "}
                                    </span>
                                    <span className="text-foreground/85">
                                      {a.hypothesis.outcome}
                                    </span>
                                  </div>
                                )}
                                {a.hypothesis.evidence && (
                                  <div className="text-xs">
                                    <span className="font-medium text-foreground/70">
                                      Evidencia:{" "}
                                    </span>
                                    <span className="text-foreground/85">
                                      {a.hypothesis.evidence}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              del.mutate(a.id, {
                                onSuccess: () =>
                                  toast.success("Entregable eliminado"),
                                onError: (e: Error) => toast.error(e.message),
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Megaphone className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="Marketing vive dentro de un proyecto. Crea uno para empezar a entregar campañas, copys, prompts y análisis."
        />
      )}

      <CreateMarketingDialog
        capabilityKey={createOpen}
        onOpenChange={(v) => !v && setCreateOpen(null)}
      />
    </section>
  );
}

function CreateMarketingDialog({
  capabilityKey,
  onOpenChange,
}: {
  capabilityKey: string | null;
  onOpenChange: (v: boolean) => void;
}) {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const create = useCreateMarketing(activeId ?? "");

  const cap = MARKETING_CAPABILITIES.find((c) => c.key === capabilityKey);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [hyp, setHyp] = React.useState("");
  const [prediction, setPrediction] = React.useState("");
  const [context, setContext] = React.useState("");

  React.useEffect(() => {
    if (capabilityKey) {
      setTitle(cap?.label ?? "");
      setContent("");
      setHyp("");
      setPrediction("");
      setContext("");
    }
  }, [capabilityKey, cap]);

  if (!capabilityKey || !cap) return null;

  const submit = () => {
    if (!activeId) return;
    if (!title.trim() || !content.trim()) {
      toast.error("El título y el contenido son obligatorios");
      return;
    }
    if (!hyp.trim() || !prediction.trim()) {
      toast.error("Cada entregable debe llevar una hipótesis y una predicción");
      return;
    }
    create.mutate(
      {
        type: cap.producesAssetType,
        title: title.trim(),
        content: content.trim(),
        hypothesis: {
          roleId: "marketing",
          context: context.trim() || `Marketing: ${cap.label}`,
          hypothesis: hyp.trim(),
          prediction: prediction.trim(),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Entregable creado");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Dialog open={!!capabilityKey} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto logan-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Megaphone className="size-4 text-success" />
            {cap.label}
          </DialogTitle>
          <DialogDescription>{cap.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="mk-title">Título</Label>
            <Input
              id="mk-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Campaña Q1: audiencia madres primerizas"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mk-content">Contenido</Label>
            <Textarea
              id="mk-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="El entregable en sí: brief de campaña, copy del anuncio, prompt, presupuesto, análisis…"
            />
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Lightbulb className="size-3.5" />
              Hipótesis del entregable
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Todo entregable de Marketing va atado a una hipótesis verificable.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="mk-ctx" className="text-xs">
                Contexto
              </Label>
              <Textarea
                id="mk-ctx"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
                placeholder="¿Qué situación disparó esta decisión de marketing?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mk-hyp" className="text-xs">
                Hipótesis *
              </Label>
              <Textarea
                id="mk-hyp"
                value={hyp}
                onChange={(e) => setHyp(e.target.value)}
                rows={2}
                placeholder="Creemos que este entregable logrará X porque Y."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mk-pred" className="text-xs">
                Predicción medible *
              </Label>
              <Textarea
                id="mk-pred"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                rows={2}
                placeholder="Resultado observable esperado (CTR, CPM, alcance, conversión)."
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Creando…" : "Crear entregable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
