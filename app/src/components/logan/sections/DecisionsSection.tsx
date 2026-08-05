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
import { ROLES } from "@/lib/logan-os-data";
import {
  useCreateDecision,
  useDecisions,
  useDeleteDecision,
  useUpdateDecision,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import {
  Gavel,
  Plus,
  Trash2,
  Save,
  X,
  Minus,
} from "lucide-react";
import type { Decision } from "@/lib/logan-types";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, StatusColor> = {
  aprobada: "success",
  propuesta: "muted",
  descartada: "destructive",
};

function roleLabel(key: string) {
  return ROLES.find((r) => r.key === key)?.name ?? key;
}
function roleIcon(key: string) {
  return ROLES.find((r) => r.key === key)?.icon ?? "Brain";
}

export function DecisionsSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useDecisions(activeId);
  const del = useDeleteDecision(activeId ?? "");
  const [editTarget, setEditTarget] = React.useState<Decision | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  const items = [...(list.data ?? [])].sort((a, b) =>
    a.decId.localeCompare(b.decId, undefined, { numeric: true }),
  );

  return (
    <section className="space-y-6" aria-labelledby="decisiones-title">
      <SectionHeading
        eyebrow="Sistema de Decisiones · §5"
        title="Decisiones"
        icon="Gavel"
        description="Una decisión es importante cuando afecta dirección, arquitectura, UX, negocio o es costosa de revertir. Cada decisión lleva un rol, justificación y consecuencias."
        actions={
          activeId ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nueva decisión
            </Button>
          ) : undefined
        }
      />

      {activeId ? (
        items.length === 0 ? (
          <EmptyState
            icon={<Gavel className="size-5" />}
            title="Sin decisiones registradas"
            description="Una decisión documentada con DEC-XXX: problema, alternativas, decisión, justificación y consecuencias."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Nueva decisión
              </Button>
            }
          />
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {items.map((d) => (
              <AccordionItem
                key={d.id}
                value={d.id}
                className="rounded-lg border bg-card px-4 last:border-b"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 text-left">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary ring-1 ring-primary/20">
                        {d.decId}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <RoleIcon
                              name={roleIcon(d.roleId)}
                              className="size-3"
                            />
                            {roleLabel(d.roleId)}
                          </span>
                          <span>·</span>
                          <span>{shortDate(d.date)}</span>
                        </div>
                        <p
                          className={cn(
                            "mt-0.5 font-serif text-sm text-foreground",
                            d.status === "descartada" && "line-through text-muted-foreground",
                          )}
                        >
                          {d.title}
                        </p>
                      </div>
                    </div>
                    <StatusPill color={STATUS_COLOR[d.status]}>
                      {d.status}
                    </StatusPill>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 border-t pt-3">
                    <DecisionField
                      label="Problema"
                      text={d.problem}
                    />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Alternativas
                      </div>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/85 marker:text-primary">
                        {d.alternatives.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <DecisionField label="Decisión" text={d.decision} />
                    <DecisionField
                      label="Justificación"
                      text={d.justification}
                    />
                    <DecisionField
                      label="Consecuencias"
                      text={d.consequences}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditTarget(d)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          del.mutate(d.id, {
                            onSuccess: () =>
                              toast.success("Decisión eliminada"),
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
        )
      ) : (
        <EmptyState
          icon={<Gavel className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="Las decisiones viven en la Biblia del proyecto. Crea uno para empezar a documentarlas."
        />
      )}

      <DecisionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        nextDecId={suggestNextDecId(items.map((d) => d.decId))}
        mode="create"
      />
      <DecisionDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        initial={editTarget}
        mode="edit"
      />
    </section>
  );
}

function DecisionField({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  if (!text) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}

function suggestNextDecId(existing: string[]): string {
  const nums = existing
    .map((s) => parseInt(s.replace(/^DEC-/, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `DEC-${String(next).padStart(3, "0")}`;
}

function DecisionDialog({
  open,
  onOpenChange,
  initial,
  mode,
  nextDecId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Decision | null;
  mode: "create" | "edit";
  nextDecId?: string;
}) {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const create = useCreateDecision(activeId ?? "");
  const update = useUpdateDecision(activeId ?? "");

  const [decId, setDecId] = React.useState("");
  const [roleId, setRoleId] = React.useState("core");
  const [title, setTitle] = React.useState("");
  const [problem, setProblem] = React.useState("");
  const [alts, setAlts] = React.useState<string[]>(["", ""]);
  const [decision, setDecision] = React.useState("");
  const [justification, setJustification] = React.useState("");
  const [consequences, setConsequences] = React.useState("");
  const [status, setStatus] = React.useState("aprobada");

  React.useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setDecId(initial.decId);
      setRoleId(initial.roleId);
      setTitle(initial.title);
      setProblem(initial.problem);
      setAlts(initial.alternatives.length ? initial.alternatives : ["", ""]);
      setDecision(initial.decision);
      setJustification(initial.justification);
      setConsequences(initial.consequences);
      setStatus(initial.status);
    } else {
      setDecId(nextDecId ?? "DEC-001");
      setRoleId("core");
      setTitle("");
      setProblem("");
      setAlts(["", ""]);
      setDecision("");
      setJustification("");
      setConsequences("");
      setStatus("aprobada");
    }
  }, [open, mode, initial, nextDecId]);

  const validAlts = alts.filter((a) => a.trim()).length >= 2;

  const submit = () => {
    if (!activeId) return;
    if (!title.trim()) {
      toast.error("La decisión necesita un título");
      return;
    }
    if (!validAlts) {
      toast.error("Registra al menos dos alternativas");
      return;
    }
    const body = {
      decId: decId.trim() || nextDecId || "DEC-001",
      roleId,
      title: title.trim(),
      problem: problem.trim(),
      alternatives: alts.map((a) => a.trim()).filter(Boolean),
      decision: decision.trim(),
      justification: justification.trim(),
      consequences: consequences.trim(),
      status,
    };
    if (mode === "edit" && initial) {
      update.mutate(
        { id: initial.id, ...body },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Decisión actualizada");
          },
          onError: (e: Error) => toast.error(e.message),
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Decisión registrada");
        },
        onError: (e: Error) => toast.error(e.message),
      });
    }
  };

  const setAlt = (i: number, v: string) =>
    setAlts((prev) => prev.map((a, idx) => (idx === i ? v : a)));
  const addAlt = () => setAlts((p) => [...p, ""]);
  const removeAlt = (i: number) =>
    setAlts((p) => p.filter((_, idx) => idx !== i));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto logan-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Gavel className="size-4 text-primary" />
            {mode === "edit" ? "Editar decisión" : "Nueva decisión"}
          </DialogTitle>
          <DialogDescription>
            DEC-XXX: problema, alternativas (mín. 2), decisión, justificación
            y consecuencias.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dec-id">Identificador</Label>
              <Input
                id="dec-id"
                value={decId}
                onChange={(e) => setDecId(e.target.value)}
                className="font-mono"
                disabled={mode === "edit"}
              />
            </div>
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dec-title">Título *</Label>
            <Input
              id="dec-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Modelo de negocio freemium"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dec-problem">Problema</Label>
            <Textarea
              id="dec-problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Alternativas (mín. 2) *</Label>
              <Button size="sm" variant="ghost" onClick={addAlt}>
                <Plus className="size-3.5" /> Añadir
              </Button>
            </div>
            <div className="space-y-2">
              {alts.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={a}
                    onChange={(e) => setAlt(i, e.target.value)}
                    placeholder={`Alternativa ${i + 1}`}
                  />
                  {alts.length > 2 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAlt(i)}
                      aria-label="Quitar alternativa"
                    >
                      <Minus className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {!validAlts && (
              <p className="text-xs text-warning">
                Necesitas al menos dos alternativas reales.
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dec-decision">Decisión</Label>
            <Textarea
              id="dec-decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dec-justif">Justificación</Label>
            <Textarea
              id="dec-justif"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dec-cons">Consecuencias</Label>
            <Textarea
              id="dec-cons"
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprobada">aprobada</SelectItem>
                  <SelectItem value="propuesta">propuesta</SelectItem>
                  <SelectItem value="descartada">descartada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={create.isPending || update.isPending}
          >
            <Save className="size-4" />
            {(create.isPending || update.isPending)
              ? "Guardando…"
              : mode === "edit"
                ? "Guardar cambios"
                : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
