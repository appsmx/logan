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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import {
  useCreateSession,
  useDecisions,
  useProject,
  useSessions,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import {
  History,
  Plus,
  X,
  Copy,
  Download,
  Waypoints,
} from "lucide-react";
import {
  buildSessionContextMarkdown,
  emptyPcsDraft,
  sessionContextToMarkdown,
  type PcsDraft,
} from "@/lib/pcs";
import type { SessionContext } from "@/lib/logan-types";

export function SessionSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const project = useProject(activeId);
  const decisions = useDecisions(activeId);
  const sessions = useSessions(activeId);
  const create = useCreateSession(activeId ?? "");

  const [draft, setDraft] = React.useState<PcsDraft>(() =>
    emptyPcsDraft(null),
  );
  const [preview, setPreview] = React.useState<string | null>(null);
  const [viewing, setViewing] = React.useState<SessionContext | null>(null);

  React.useEffect(() => {
    setDraft(emptyPcsDraft(project.data));
  }, [project.data]);

  const approvedDecisions = (decisions.data ?? [])
    .filter((d) => d.status === "aprobada")
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 8);

  const items = sessions.data ?? [];

  const update = (patch: Partial<PcsDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const generate = () => {
    const md = buildSessionContextMarkdown(
      project.data ?? null,
      draft,
      approvedDecisions,
    );
    setPreview(md);
  };

  const persist = () => {
    if (!activeId) return;
    if (!preview) return;
    create.mutate(
      {
        status: draft.status,
        advance: draft.advance,
        objectiveCompleted: draft.objectiveCompleted,
        decisionsTaken: draft.decisionsTaken,
        documentsUpdated: draft.documentsUpdated,
        pending: draft.pending,
        risks: draft.risks,
        nextObjective: draft.nextObjective,
        observations: draft.observations,
      },
      {
        onSuccess: () => toast.success("SESSION_CONTEXT persistido"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const copy = (text: string) => {
    void navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copiado al portapapeles"))
      .catch(() => toast.error("No se pudo copiar"));
  };

  const download = (text: string) => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SESSION_CONTEXT.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewMd = preview
    ? preview
    : viewing
      ? sessionContextToMarkdown(viewing)
      : "";

  return (
    <section className="space-y-6" aria-labelledby="sesion-title">
      <SectionHeading
        eyebrow="Protocolo de Continuidad de Sesión · §10"
        title="Sesión (PCS)"
        icon="History"
        description="Genera un SESSION_CONTEXT.md actualizado para retomar el trabajo en otra sesión. Se activa con: cerrar sesión, finalizar sesión, generar continuidad, actualizar contexto, PCS."
        actions={
          activeId ? (
            <Button onClick={generate}>
              <Waypoints className="size-4 text-primary" />
              Generar SESSION_CONTEXT
            </Button>
          ) : undefined
        }
      />

      {activeId ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">
                Borrador de sesión
              </CardTitle>
              <CardDescription>
                Completa el estado actual. “Generar” arma el SESSION_CONTEXT.md
                en Markdown para copiar, descargar o persistir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pcs-status">Estado</Label>
                  <Input
                    id="pcs-status"
                    value={draft.status}
                    onChange={(e) => update({ status: e.target.value })}
                  />
                </div>
              </div>

              <Field
                id="pcs-advance"
                label="Avance de la sesión"
                value={draft.advance}
                onChange={(v) => update({ advance: v })}
                rows={3}
                placeholder="¿Qué se hizo en esta sesión?"
              />

              <Field
                id="pcs-obj"
                label="Objetivo completado"
                value={draft.objectiveCompleted}
                onChange={(v) => update({ objectiveCompleted: v })}
                rows={2}
                placeholder="¿Se logró el objetivo planeado?"
              />

              <div className="grid gap-2">
                <Label>Decisiones tomadas</Label>
                <div className="flex flex-wrap gap-1.5">
                  {approvedDecisions.map((d) => {
                    const on = draft.decisionsTaken.includes(d.decId);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          update({
                            decisionsTaken: on
                              ? draft.decisionsTaken.filter(
                                  (x) => x !== d.decId,
                                )
                              : [...draft.decisionsTaken, d.decId],
                          })
                        }
                        className={
                          on
                            ? "rounded-md border bg-primary text-primary-foreground px-2 py-1 text-xs"
                            : "rounded-md border bg-card/40 px-2 py-1 text-xs text-foreground/80 hover:bg-accent"
                        }
                      >
                        <span className="font-mono">{d.decId}</span>{" "}
                        {d.title}
                      </button>
                    );
                  })}
                  {approvedDecisions.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No hay decisiones aprobadas recientes en el proyecto.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Documentos actualizados</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      update({
                        documentsUpdated: [
                          ...draft.documentsUpdated,
                          { doc: "", change: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="size-3.5" /> Añadir
                  </Button>
                </div>
                <div className="space-y-2">
                  {draft.documentsUpdated.map((d, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                      <Input
                        value={d.doc}
                        placeholder="Documento (LOGAN / Biblia / ...)"
                        onChange={(e) =>
                          update({
                            documentsUpdated: draft.documentsUpdated.map(
                              (x, idx) =>
                                idx === i
                                  ? { ...x, doc: e.target.value }
                                  : x,
                            ),
                          })
                        }
                      />
                      <Input
                        value={d.change}
                        placeholder="¿Qué cambió?"
                        onChange={(e) =>
                          update({
                            documentsUpdated: draft.documentsUpdated.map(
                              (x, idx) =>
                                idx === i
                                  ? { ...x, change: e.target.value }
                                  : x,
                            ),
                          })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Quitar"
                        onClick={() =>
                          update({
                            documentsUpdated: draft.documentsUpdated.filter(
                              (_, idx) => idx !== i,
                            ),
                          })
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {draft.documentsUpdated.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Sin documentos actualizados en esta sesión.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id="pcs-pending"
                  label="Pendientes"
                  value={draft.pending}
                  onChange={(v) => update({ pending: v })}
                  rows={3}
                />
                <Field
                  id="pcs-risks"
                  label="Riesgos"
                  value={draft.risks}
                  onChange={(v) => update({ risks: v })}
                  rows={3}
                />
              </div>
              <Field
                id="pcs-next"
                label="Próximo objetivo"
                value={draft.nextObjective}
                onChange={(v) => update({ nextObjective: v })}
                rows={2}
              />
              <Field
                id="pcs-obs"
                label="Observaciones"
                value={draft.observations}
                onChange={(v) => update({ observations: v })}
                rows={3}
              />

              <div className="flex justify-end">
                <Button onClick={generate}>
                  <Waypoints className="size-4 text-primary" />
                  Generar SESSION_CONTEXT
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Sesiones anteriores
            </h3>
            {items.length === 0 ? (
              <EmptyState
                icon={<History className="size-5" />}
                title="Sin sesiones registradas"
                description="Cada SESSION_CONTEXT generado se queda aquí para retomar el trabajo cuando haga falta."
              />
            ) : (
              <ul className="space-y-2">
                {items
                  .slice()
                  .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
                  .map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => setViewing(s)}
                        className="flex w-full flex-col gap-1 rounded-lg border bg-card/40 p-3 text-left transition hover:bg-card hover:border-primary/40"
                      >
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <span>{shortDate(s.createdAt)}</span>
                          <span className="text-border">·</span>
                          <Badge variant="outline" className="text-[10px]">
                            {s.status}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground/85">
                          {s.advance || "—"}
                        </p>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<History className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="El PCS vive dentro de un proyecto. Crea uno para empezar a generar SESSION_CONTEXT.md."
        />
      )}

      <Dialog
        open={!!preview || !!viewing}
        onOpenChange={(v) => {
          if (!v) {
            setPreview(null);
            setViewing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Waypoints className="size-4 text-primary" />
              SESSION_CONTEXT.md
            </DialogTitle>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 font-mono text-xs text-foreground/90 logan-scroll">
            {previewMd}
          </pre>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => copy(previewMd)}
            >
              <Copy className="size-4" />
              Copiar
            </Button>
            <Button
              variant="outline"
              onClick={() => download(previewMd)}
            >
              <Download className="size-4" />
              Descargar .md
            </Button>
            {preview && (
              <Button
                onClick={persist}
                disabled={create.isPending || !activeId}
              >
                {create.isPending ? "Guardando…" : "Persistir sesión"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 2}
        placeholder={placeholder}
      />
    </div>
  );
}
