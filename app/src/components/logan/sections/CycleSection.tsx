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
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import { METHODOLOGY_PHASES } from "@/lib/logan-os-data";
import { usePhases, useUpdatePhase } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import { Repeat, DoorOpen, Flag } from "lucide-react";

const STATUS_COLOR: Record<string, StatusColor> = {
  pendiente: "muted",
  en_progreso: "warning",
  completada: "success",
};

export function CycleSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const phases = usePhases(activeId);
  const setActiveSection = useLoganStore((s) => s.setActiveSection);

  if (!activeId) {
    return (
      <section className="space-y-6" aria-labelledby="ciclo-title">
        <SectionHeading
          eyebrow="Ciclo metodológico · §4.1"
          title="Ciclo metodológico"
          icon="Repeat"
          description="Las ocho fases iterativas que todo proyecto bajo LOGAN sigue: Comprender, Descubrir, Diseñar, Documentar, Construir, Auditar, Aprender, Actualizar."
        />
        <EmptyState
          icon={<Repeat className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="El ciclo vive dentro de un proyecto. Crea uno para empezar a recorrerlo."
        />
      </section>
    );
  }

  const rows = phases.data ?? [];

  return (
    <section className="space-y-6" aria-labelledby="ciclo-title">
      <SectionHeading
        eyebrow="Ciclo metodológico · §4.1"
        title="Ciclo metodológico"
        icon="Repeat"
        description="Comprender → Descubrir → Diseñar → Documentar → Construir → Auditar → Aprender → Actualizar. Las puertas de calidad detienen el avance."
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Flag className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold text-primary">
                Prioridad del MVP.
              </span>{" "}
              La primera iteración debe producir un MVP. La velocidad para
              validar (Art. 4.2) y las puertas de calidad (Art. 6) son
              compatibles: nunca se sacrifica la Constitución por velocidad.
            </p>
          </div>
        </CardContent>
      </Card>

      <ol className="space-y-3">
        {METHODOLOGY_PHASES.map((phase, i) => {
          const row = rows.find((r) => r.phase === phase.n);
          const prevRow = rows.find((r) => r.phase === phase.n - 1);
          return (
            <React.Fragment key={phase.n}>
              <PhaseCard
                phase={phase}
                row={row}
                projectId={activeId}
              />
              {phase.gate && (
                <div className="rounded-lg border-2 border-dashed border-warning/40 bg-warning/5 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <DoorOpen className="mt-0.5 size-5 shrink-0 text-warning" />
                      <div>
                        <div className="font-serif text-sm text-foreground">
                          {phase.gate!.name}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {phase.gate!.note}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveSection("auditoria")}
                    >
                      Ir a Auditoría
                    </Button>
                  </div>
                </div>
              )}
              {prevRow && phase.n === 4 && (
                <div className="text-center text-xs text-muted-foreground">
                  ── fase 3 completada: {shortDate(prevRow.completedAt)} ──
                </div>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </section>
  );
}

function PhaseCard({
  phase,
  row,
  projectId,
}: {
  phase: {
    n: number;
    name: string;
    description: string;
  };
  row?:
    | {
        id: string;
        status: string;
        notes: string;
        completedAt: string | null;
      };
  projectId: string;
}) {
  const update = useUpdatePhase(projectId);
  const [notes, setNotes] = React.useState(row?.notes ?? "");

  React.useEffect(() => {
    setNotes(row?.notes ?? "");
  }, [row?.notes]);

  const status = row?.status ?? "pendiente";

  const setStatus = (s: string) => {
    if (!row) return;
    update.mutate(
      {
        id: row.id,
        status: s,
        completedAt:
          s === "completada" ? new Date().toISOString() : null,
      },
      {
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const saveNotes = () => {
    if (!row) return;
    update.mutate(
      { id: row.id, notes },
      {
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Card className={status === "completada" ? "border-success/30" : ""}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch">
        <div
          aria-hidden
          className="flex shrink-0 items-center justify-center bg-card text-primary border-b sm:border-b-0 sm:border-r border-border px-4 sm:px-5 sm:py-4 sm:w-20"
        >
          <span className="font-serif text-4xl sm:text-5xl leading-none text-primary">
            {phase.n}
          </span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-lg text-foreground">
                {phase.name}
              </h3>
              <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                {phase.description}
              </p>
            </div>
            <StatusPill color={STATUS_COLOR[status]}>
              {status}
            </StatusPill>
          </div>

          {row && (
            <div className="space-y-2 border-t pt-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                rows={2}
                placeholder="Notas de esta fase (se autoguardan al perder el foco)."
                className="text-sm"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  {row.completedAt
                    ? `Completada el ${shortDate(row.completedAt)}`
                    : "Sin completar"}
                </div>
                <div className="flex gap-1.5">
                  {status !== "en_progreso" && status !== "completada" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus("en_progreso")}
                    >
                      En progreso
                    </Button>
                  )}
                  {status !== "completada" && (
                    <Button
                      size="sm"
                      onClick={() => setStatus("completada")}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      Marcar completada
                    </Button>
                  )}
                  {status === "completada" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus("pendiente")}
                    >
                      Reabrir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
