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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill } from "@/components/logan/StatusPill";
import { AUDIT_CHECKLIST, METHODOLOGY_PHASES } from "@/lib/logan-os-data";
import {
  useAudits,
  useCreateAudit,
  useDeleteAudit,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import { ShieldCheck, Save, Trash2, DoorOpen } from "lucide-react";

const GATES = METHODOLOGY_PHASES.filter((p) => p.gate).map((p) => ({
  phase: p.n,
  name: p.gate!.name,
  note: p.gate!.note,
}));

export function AuditSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useAudits(activeId);
  const create = useCreateAudit(activeId ?? "");
  const del = useDeleteAudit(activeId ?? "");
  const setActiveSection = useLoganStore((s) => s.setActiveSection);

  const [deliverableName, setDeliverableName] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, boolean>>({});
  const [notes, setNotes] = React.useState("");

  const items = list.data ?? [];

  const allChecked = AUDIT_CHECKLIST.every((c) => checks[c.id]);

  const submit = () => {
    if (!activeId) return;
    if (!deliverableName.trim()) {
      toast.error("Indica el nombre del entregable");
      return;
    }
    create.mutate(
      {
        deliverableName: deliverableName.trim(),
        checks,
        passed: allChecked,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setDeliverableName("");
          setChecks({});
          setNotes("");
          toast.success(
            allChecked
              ? "Auditoría aprobada"
              : "Auditoría registrada con reprobaciones",
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="auditoria-title">
      <SectionHeading
        eyebrow="Calidad y auditoría · §6"
        title="Auditoría"
        icon="ShieldCheck"
        description="Lista de verificación de 7 ítems. Las puertas de calidad frenan el avance entre fases si no se cumplen."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <DoorOpen className="size-4 text-primary" />
            Puertas de calidad
          </CardTitle>
          <CardDescription>
            Tres puntos de verificación obligatorios entre fases del ciclo
            metodológico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {GATES.map((g) => (
              <li
                key={g.phase}
                className="rounded-md border bg-warning/5 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <StatusPill color="warning" dot={false}>
                    Fase {g.phase}
                  </StatusPill>
                  <span className="font-serif text-sm text-foreground">
                    {g.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {g.note}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {activeId ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                Nueva auditoría
              </CardTitle>
              <CardDescription>
                Marca todos los ítems que apliquen. Si todos están marcados, la
                auditoría pasa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="aud-name">Entregable</Label>
                <Input
                  id="aud-name"
                  value={deliverableName}
                  onChange={(e) => setDeliverableName(e.target.value)}
                  placeholder="Ej. Landing page v1 · Esquema de base de datos"
                />
              </div>
              <ul className="space-y-2">
                {AUDIT_CHECKLIST.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 rounded-md border bg-card/40 px-3 py-2.5"
                  >
                    <Checkbox
                      id={`chk-${c.id}`}
                      checked={!!checks[c.id]}
                      onCheckedChange={(v) =>
                        setChecks((prev) => ({ ...prev, [c.id]: !!v }))
                      }
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <label
                        htmlFor={`chk-${c.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        {c.label}
                      </label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {c.question}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2">
                <Label htmlFor="aud-notes">Notas</Label>
                <Textarea
                  id="aud-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observaciones de la auditoría."
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <StatusPill color={allChecked ? "success" : "warning"}>
                  {allChecked ? "Lista para aprobar" : "Faltan ítems"}
                </StatusPill>
                <Button onClick={submit} disabled={create.isPending}>
                  <Save className="size-4" />
                  {create.isPending ? "Guardando…" : "Guardar auditoría"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Auditorías pasadas
            </h3>
            {items.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="size-5" />}
                title="Sin auditorías registradas"
                description="Las auditorías se quedan aquí para que el sistema recuerde qué se verificó."
              />
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {items.map((a) => {
                  const passedCount = Object.entries(
                    a.checks ?? {},
                  ).filter(([, v]) => v).length;
                  return (
                    <AccordionItem
                      key={a.id}
                      value={a.id}
                      className="rounded-lg border bg-card px-4 last:border-b"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex w-full flex-wrap items-center justify-between gap-2 pr-2">
                          <div className="min-w-0 text-left">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {shortDate(a.createdAt)}
                            </div>
                            <p className="mt-0.5 font-serif text-sm text-foreground">
                              {a.deliverableName}
                            </p>
                          </div>
                          <StatusPill
                            color={a.passed ? "success" : "destructive"}
                          >
                            {a.passed
                              ? "aprobada"
                              : `con reprobaciones (${passedCount}/${AUDIT_CHECKLIST.length})`}
                          </StatusPill>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 border-t pt-3">
                          <ul className="grid gap-1.5 sm:grid-cols-2">
                            {AUDIT_CHECKLIST.map((c) => (
                              <li
                                key={c.id}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span
                                  className={
                                  a.checks?.[c.id] ? "text-success" : "text-muted-foreground/50"
                                }
                                >
                                  {a.checks?.[c.id] ? "✓" : "—"}
                                </span>
                                <span className="text-foreground/85">
                                  {c.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {a.notes && (
                            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground/85">
                              {a.notes}
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
                                    toast.success("Auditoría eliminada"),
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
                  );
                })}
              </Accordion>
            )}
          </div>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <DoorOpen className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm text-foreground/90">
                    ¿Una puerta de calidad no pasó? Revisa el ciclo
                    metodológico antes de continuar.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setActiveSection("ciclo")}
                  >
                    Ir al ciclo metodológico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<ShieldCheck className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="Las auditorías viven dentro de un proyecto. Crea uno para empezar a auditar entregables."
        />
      )}
    </section>
  );
}
