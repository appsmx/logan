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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import {
  DISCOVERY_TYPES,
  DISCOVERY_CLASSIFICATIONS,
} from "@/lib/logan-os-data";
import {
  useCreateDiscovery,
  useDeleteDiscovery,
  useDiscoveries,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import { Search, Save, Trash2 } from "lucide-react";

const TYPE_COLOR: Record<string, StatusColor> = {
  contexto: "muted",
  restriccion: "warning",
  decision: "primary",
  validacion: "success",
  riesgo: "destructive",
};

function typeName(key: string) {
  return DISCOVERY_TYPES.find((t) => t.key === key)?.name ?? key;
}

function classInfo(key: string) {
  return DISCOVERY_CLASSIFICATIONS.find((c) => c.key === key);
}

export function DiscoveriesSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const list = useDiscoveries(activeId);
  const create = useCreateDiscovery(activeId ?? "");
  const del = useDeleteDiscovery(activeId ?? "");

  const [type, setType] = React.useState("contexto");
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [classification, setClassification] = React.useState("especifico");

  const items = list.data ?? [];

  const submit = () => {
    if (!activeId) return;
    if (!question.trim()) {
      toast.error("Indica la pregunta");
      return;
    }
    create.mutate(
      {
        type,
        question: question.trim(),
        answer: answer.trim(),
        classification,
      },
      {
        onSuccess: () => {
          setQuestion("");
          setAnswer("");
          toast.success("Descubrimiento registrado");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="descubrimientos-title">
      <SectionHeading
        eyebrow="Sistema de Descubrimiento · §8"
        title="Descubrimientos"
        icon="Search"
        description="Toda información nueva que no estaba previamente documentada. Se clasifica según si otro proyecto se beneficiaría de saberlo."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Tipos de pregunta
          </CardTitle>
          <CardDescription>
            El tipo define cómo se busca la información y dónde vive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Propósito</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">
                    Ejemplo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {DISCOVERY_TYPES.map((t) => (
                  <tr key={t.key}>
                    <td className="px-3 py-2">
                      <StatusPill color={TYPE_COLOR[t.key]} dot={false}>
                        {t.name}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-2 text-foreground/85">
                      {t.purpose}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {t.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Regla de clasificación
          </CardTitle>
          <CardDescription>
            “¿Si empezara un proyecto nuevo, necesitaría esta información?” Si
            la respuesta es sí → universal → LOGAN. Si solo aplica a este
            producto → específico → Biblia. Si solo a esta sesión → temporal →
            SESSION_CONTEXT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-3">
            {DISCOVERY_CLASSIFICATIONS.map((c) => (
              <li
                key={c.key}
                className="rounded-md border bg-card/40 px-3 py-2.5 text-sm"
              >
                <div className="font-serif text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  → {c.goesTo}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground/80">
                  {c.note}
                </div>
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
                Nuevo descubrimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCOVERY_TYPES.map((t) => (
                        <SelectItem key={t.key} value={t.key}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Clasificación</Label>
                  <Select
                    value={classification}
                    onValueChange={setClassification}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCOVERY_CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.name} → {c.goesTo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="disc-q">Pregunta</Label>
                <Textarea
                  id="disc-q"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="disc-a">Respuesta</Label>
                <Textarea
                  id="disc-a"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={submit} disabled={create.isPending}>
                  <Save className="size-4" />
                  {create.isPending ? "Guardando…" : "Registrar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 font-serif text-lg text-foreground">
              Descubrimientos registrados
            </h3>
            {items.length === 0 ? (
              <EmptyState
                icon={<Search className="size-5" />}
                title="Sin descubrimientos"
                description="Cuando aparezca información nueva que no estaba documentada, regístrala aquí."
              />
            ) : (
              <ul className="space-y-3">
                {items.map((d) => {
                  const ci = classInfo(d.classification);
                  return (
                    <Card key={d.id} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill color={TYPE_COLOR[d.type]}>
                            {typeName(d.type)}
                          </StatusPill>
                          <span className="text-xs text-muted-foreground">
                            {shortDate(d.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                            {ci?.name} → {ci?.goesTo}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              del.mutate(d.id, {
                                onSuccess: () =>
                                  toast.success("Descubrimiento eliminado"),
                                onError: (e: Error) => toast.error(e.message),
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                        <span className="font-semibold text-foreground">
                          {d.question}
                        </span>
                      </p>
                      {d.answer && (
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {d.answer}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Search className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="Los descubrimientos viven en un proyecto. Crea uno para empezar a documentarlos."
        />
      )}
    </section>
  );
}
