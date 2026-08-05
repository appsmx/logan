"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OS_MANUAL } from "@/lib/logan-os-data";
import { MarkdownView } from "@/components/logan/MarkdownView";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { FolderTree, Cpu } from "lucide-react";

const REPO_TREE = `LOGAN/
├── constitution/LOGAN.md
├── os/
│   ├── LOGAN_OS.md
│   ├── communication.md
│   ├── delegation.md
│   ├── memory.md
│   └── standards.md
├── roles/
│   ├── core.md
│   ├── marketing.md
│   ├── memory.md
│   ├── dev.md
│   ├── design.md
│   ├── analytics.md
│   ├── finance.md
│   ├── legal.md
│   └── support.md
├── templates/
├── prompts/
├── examples/
├── docs/
└── changelog/`;

export function OSSection() {
  return (
    <section className="space-y-6" aria-labelledby="os-title">
      <SectionHeading
        eyebrow="Sistema operativo"
        title="LOGAN OS"
        icon="Cpu"
        description="LOGAN OS no reemplaza a LOGAN; vive dentro del mismo repositorio y es el manual de funcionamiento del ecosistema. Cuatro documentos definen cómo se comunican, delegan, memorizan y estandarizan los roles."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <FolderTree className="size-4 text-primary" />
            Estructura del repositorio
          </CardTitle>
          <CardDescription>
            Un solo repositorio contiene el método, el sistema operativo, los
            roles, las plantillas y los ejemplos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground/85 logan-scroll">
            {REPO_TREE}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Manual del sistema operativo
          </CardTitle>
          <CardDescription>
            Comunicación · Delegación · Memoria · Estándares.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={OS_MANUAL[0].key}>
            <TabsList className="flex-wrap">
              {OS_MANUAL.map((d) => (
                <TabsTrigger key={d.key} value={d.key}>
                  {d.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {OS_MANUAL.map((d) => (
              <TabsContent
                key={d.key}
                value={d.key}
                className="rounded-lg border bg-card/30 p-5 sm:p-6 mt-3"
              >
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {d.path}
                  </span>
                </div>
                <MarkdownView>{d.body}</MarkdownView>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
