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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_VISION_MARKDOWN,
  AUTHORITY_HIERARCHY,
} from "@/lib/logan-os-data";
import { MarkdownView } from "@/components/logan/MarkdownView";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { useUpsertVision, useVision } from "@/lib/hooks";
import { toast } from "sonner";
import { Pencil, Eye, Layers, Save, X } from "lucide-react";

export function VisionSection() {
  const vision = useVision();
  const upsert = useUpsertVision();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (vision.data) setDraft(vision.data.content);
    else setDraft(DEFAULT_VISION_MARKDOWN);
  }, [vision.data]);

  const content = vision.data?.content ?? DEFAULT_VISION_MARKDOWN;

  const save = () => {
    upsert.mutate(draft, {
      onSuccess: () => {
        toast.success("Visión actualizada");
        setEditing(false);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <section className="space-y-6" aria-labelledby="vision-title">
      <SectionHeading
        eyebrow="Nivel 0 · Por encima de la Constitución"
        title="La Visión de LOGAN"
        icon="Eye"
        description="Documento breve que responde las preguntas filosóficas que ningún artículo alcanza a responder. Cuando hay 15 o 20 roles, esta visión los mantiene coherentes sin añadir reglas para cada caso."
        actions={
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-4 text-primary" />
            Editar
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <Eye className="size-4 text-primary" />
            Documento vigente
          </CardTitle>
          <CardDescription>
            Por encima de la Constitución. No se modifican reglas, se eligen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card/30 p-5 sm:p-8">
            <MarkdownView>{content}</MarkdownView>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <Layers className="size-4 text-primary" />
            Jerarquía de autoridad
          </CardTitle>
          <CardDescription>
            De lo más alto a la instrucción concreta. Cada nivel prevalece
            sobre los inferiores en caso de conflicto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {AUTHORITY_HIERARCHY.map((lvl) => (
              <li
                key={lvl.level}
                className="flex items-start gap-3 rounded-lg border bg-card/40 p-3"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20">
                  {lvl.level}
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-sm text-foreground">
                    {lvl.name}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {lvl.note}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Pencil className="size-4 text-primary" />
              Editar La Visión de LOGAN
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={20}
            className="font-mono text-xs logan-scroll"
            aria-label="Contenido Markdown de la Visión"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={save} disabled={upsert.isPending}>
              <Save className="size-4" />
              {upsert.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
