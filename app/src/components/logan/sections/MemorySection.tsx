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
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { useCreateMemory, useDeleteMemory, useMemory } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import { Database, Plus, Save, Trash2 } from "lucide-react";

const MEMORY_ROLE = [
  "Leer el repositorio (la fuente permanente del conocimiento).",
  "Resumir el contexto relevante para Core y para los especialistas.",
  "Detectar cambios entre el estado anterior y el actual.",
  "Preparar la información para que Core pueda decidir sin leer todo.",
];

export function MemorySection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const memory = useMemory(activeId);
  const create = useCreateMemory(activeId ?? "");
  const del = useDeleteMemory(activeId ?? "");

  const [source, setSource] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [changes, setChanges] = React.useState("");

  const submit = () => {
    if (!activeId) return;
    if (!source.trim() || !summary.trim()) {
      toast.error("Indica la fuente y un resumen");
      return;
    }
    create.mutate(
      {
        source: source.trim(),
        summary: summary.trim(),
        changesDetected: changes.trim(),
      },
      {
        onSuccess: () => {
          setSource("");
          setSummary("");
          setChanges("");
          toast.success("Entrada de memoria registrada");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const items = memory.data ?? [];

  return (
    <section className="space-y-6" aria-labelledby="memoria-title">
      <SectionHeading
        eyebrow="Rol de sistema"
        title="LOGAN Memory"
        icon="Database"
        description="Lee el repositorio, resume contexto, detecta cambios y prepara la información para Core. Nunca decide; solo informa."
      />

      <Card className="border-t-2 border-t-primary/40">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Responsabilidades de Memory
          </CardTitle>
          <CardDescription>
            Memory indexa; no interpreta. Si hay ambigüedad, la eleva a Core.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {MEMORY_ROLE.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2 rounded-md border bg-card/40 px-3 py-2 text-sm"
              >
                <Database className="mt-0.5 size-4 shrink-0 text-primary/70" />
                <span className="text-foreground/90">{r}</span>
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
                Nueva entrada de memoria
              </CardTitle>
              <CardDescription>
                Registra un contexto resumido, idealmente detectando cambios
                respecto al estado anterior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="mem-source">Fuente</Label>
                <Input
                  id="mem-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Ej. GitHub: appsmx/logan · docs/LOGAN.md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mem-summary">Resumen</Label>
                <Textarea
                  id="mem-summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="¿Qué dice esta fuente? Resume el contexto relevante para decidir."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mem-changes">Cambios detectados</Label>
                <Textarea
                  id="mem-changes"
                  value={changes}
                  onChange={(e) => setChanges(e.target.value)}
                  rows={2}
                  placeholder="¿Qué cambió desde la última lectura?"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={submit} disabled={create.isPending}>
                  <Save className="size-4" />
                  {create.isPending ? "Guardando…" : "Registrar entrada"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Entradas registradas
            </h3>
            {items.length === 0 ? (
              <EmptyState
                icon={<Database className="size-5" />}
                title="Sin entradas todavía"
                description="Memory todavía no ha registrado contexto para este proyecto."
              />
            ) : (
              <ul className="space-y-3">
                {items.map((m) => (
                  <Card key={m.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {m.source}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {shortDate(m.createdAt)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          del.mutate(m.id, {
                            onSuccess: () => toast.success("Entrada eliminada"),
                            onError: (e: Error) => toast.error(e.message),
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                      {m.summary}
                    </p>
                    {m.changesDetected && (
                      <p className="mt-2 rounded-md border border-dashed bg-warning/5 px-3 py-2 text-xs text-foreground/80">
                        <span className="font-semibold text-warning">
                          Cambios:{" "}
                        </span>
                        {m.changesDetected}
                      </p>
                    )}
                  </Card>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Plus className="size-5" />}
          title="Memory necesita un proyecto"
          description="Selecciona o crea un proyecto para registrar contexto y detectar cambios en su repositorio."
        />
      )}
    </section>
  );
}
