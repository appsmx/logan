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
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill } from "@/components/logan/StatusPill";
import { ModeBadge } from "@/components/logan/ModeBadge";
import { ROLES, WORK_MODES } from "@/lib/logan-os-data";
import {
  useProject,
  useUpdateProject,
  useHypotheses,
  useMarketing,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Brain,
  CheckCircle2,
  Circle,
  Megaphone,
  Lightbulb,
  RefreshCcwDot,
  ArrowRight,
  Database,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CORE = ROLES.find((r) => r.key === "core")!;

const FLOW_NODES = [
  { label: "Solicitud", icon: "Sparkles", color: "muted" as const },
  { label: "Memory", icon: "Database", color: "muted" as const },
  { label: "Core", icon: "Brain", color: "primary" as const },
  { label: "Especialista", icon: "Megaphone", color: "success" as const },
  { label: "Analytics", icon: "LineChart", color: "warning" as const },
  { label: "LOGAN", icon: "Cpu", color: "destructive" as const },
];

export function CoreSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const setActiveSection = useLoganStore((s) => s.setActiveSection);
  const project = useProject(activeId);
  const hypotheses = useHypotheses(activeId);
  const marketing = useMarketing(activeId);
  const update = useUpdateProject(activeId ?? "");

  const hp = hypotheses.data ?? [];
  const mk = marketing.data ?? [];
  const obsCount = hp.filter(
    (h) => h.status === "pendiente" || h.status === "en_observacion",
  ).length;
  const refutedCount = hp.filter((h) => h.status === "refutada").length;

  const setMode = (key: string) => {
    if (!activeId) return;
    update.mutate(
      { currentMode: key },
      {
        onSuccess: () => toast.success(`Modo: ${WORK_MODES.find((m) => m.key === key)?.name}`),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="nucleo-title">
      <SectionHeading
        eyebrow="Orquestador"
        title="LOGAN Core"
        icon="Brain"
        description="El rol que piensa, decide, delega e integra. No ejecuta trabajo especializado: analiza la situación, decide el próximo paso, delega en especialistas y mantiene la coherencia con la Constitución."
      />

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="font-serif text-lg">{CORE.tagline}</CardTitle>
          <CardDescription>
            Responsabilidades de Core dentro del ecosistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CORE.responsibilities.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2 rounded-md border bg-card/40 px-3 py-2 text-sm"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-foreground/90">{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          icon={<Brain className="size-4" />}
          title="Foco actual"
          value={
            project.data ? (
              <div className="space-y-1.5">
                <div className="font-serif text-sm text-foreground">
                  {project.data.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusPill color="muted" dot={false}>
                    Fase {project.data.currentPhase}
                  </StatusPill>
                  <ModeBadge mode={project.data.currentMode} />
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Sin proyecto seleccionado
              </span>
            )
          }
        />
        <MiniStat
          icon={<Megaphone className="size-4" />}
          title="Delegaciones activas"
          value={
            <div>
              <span className="font-serif text-2xl text-foreground">
                {mk.length}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">
                entregables de marketing
              </span>
            </div>
          }
        />
        <MiniStat
          icon={<Lightbulb className="size-4" />}
          title="Hipótesis en observación"
          value={
            <div>
              <span className="font-serif text-2xl text-foreground">
                {obsCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">
                pendiente / en observación
              </span>
            </div>
          }
        />
        <MiniStat
          icon={<RefreshCcwDot className="size-4" />}
          title="Integraciones pendientes"
          value={
            <div>
              <span className="font-serif text-2xl text-foreground">
                {refutedCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">
                refutadas · actualizar estrategia
              </span>
            </div>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Flujo del ecosistema
          </CardTitle>
          <CardDescription>
            De la solicitud concreta al aprendizaje permanente. Cada nodo es
            un rol o un sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between">
            {FLOW_NODES.map((n, i) => (
              <React.Fragment key={n.label}>
                <div
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg border bg-card/40 px-3 py-2.5",
                    "min-w-[8rem]",
                  )}
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                    <FlowIcon name={n.icon} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Paso {i + 1}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {n.label}
                    </div>
                  </div>
                </div>
                {i < FLOW_NODES.length - 1 && (
                  <div className="flex items-center justify-center text-primary/60">
                    <ArrowRight className="size-4 sm:rotate-0 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Solicitud → Memory (lee el repositorio) → Core (decide) →
            Especialista (ejecuta + deja hipótesis) → Analytics (verifica) →
            LOGAN (aprende).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Modo de trabajo</CardTitle>
          <CardDescription>
            El estado operativo de la sesión actual. Cambia el badge global en
            el header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.data ? (
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m) => {
                const active = project.data?.currentMode === m.key;
                return (
                  <Button
                    key={m.key}
                    variant={active ? "default" : "outline"}
                    onClick={() => setMode(m.key)}
                    className={cn(
                      "h-auto items-start gap-1.5 py-2 px-3 flex-col",
                      !active && "hover:bg-accent",
                    )}
                    disabled={update.isPending}
                  >
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="text-[10px] opacity-80 leading-tight">
                      {m.when}
                    </span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Brain className="size-5" />}
              title="Sin proyecto activo"
              description="Selecciona o crea un proyecto para fijar su modo de trabajo."
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function MiniStat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="text-primary/80">{icon}</span>
        {title}
      </div>
      <div className="mt-3">{value}</div>
    </Card>
  );
}

function FlowIcon({ name }: { name: string }) {
  switch (name) {
    case "Sparkles":
      return <Lightbulb className="size-4" />;
    case "Database":
      return <Database className="size-4" />;
    case "Brain":
      return <Brain className="size-4" />;
    case "Megaphone":
      return <Megaphone className="size-4" />;
    case "LineChart":
      return <Search className="size-4" />;
    case "Cpu":
      return <Brain className="size-4" />;
    default:
      return <Circle className="size-4" />;
  }
}
