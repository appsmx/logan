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
  CONSTITUTION_ARTICLES,
  AUTHORITY_HIERARCHY,
} from "@/lib/logan-os-data";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { Scale, ScrollText } from "lucide-react";

export function ConstitutionSection() {
  return (
    <section className="space-y-6" aria-labelledby="constitucion-title">
      <SectionHeading
        eyebrow="Marco normativo supremo"
        title="Constitución de LOGAN"
        icon="ScrollText"
        description="Diez artículos que definen las normas supremas de la metodología. Prevalecen sobre cualquier otro documento en caso de conflicto. La IA trabaja dentro de este marco."
      />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="font-semibold text-primary">
              La Constitución es el marco normativo supremo.
            </span>{" "}
            Ante cualquier conflicto entre documentos, la Constitución
            prevalece. Es la base sobre la que se construyen LOGAN OS, los
            roles, las Biblias y los SESSION_CONTEXT.
          </p>
        </CardContent>
      </Card>

      <ol className="space-y-4">
        {CONSTITUTION_ARTICLES.map((a) => (
          <Card key={a.roman} className="overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div
                aria-hidden
                className="flex shrink-0 items-center justify-center bg-primary text-primary-foreground px-5 py-4 sm:py-6 sm:w-20"
              >
                <span className="font-serif text-4xl sm:text-5xl leading-none">
                  {a.roman}
                </span>
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Artículo {a.numeral}
                  </span>
                </div>
                <h3 className="mt-1 font-serif text-xl text-foreground">
                  {a.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                  {a.body}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <Scale className="size-4 text-primary" />
            Jerarquía de autoridad
          </CardTitle>
          <CardDescription>
            Orden de prevalencia. Un documento superior manda sobre uno
            inferior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {AUTHORITY_HIERARCHY.map((lvl, i) => (
              <React.Fragment key={lvl.level}>
                <span className="inline-flex items-center gap-2 rounded-md border bg-card/40 px-3 py-1.5">
                  <span className="flex size-5 items-center justify-center rounded-sm bg-primary/10 text-[10px] font-semibold text-primary">
                    {lvl.level}
                  </span>
                  <span className="font-serif text-foreground">
                    {lvl.name}
                  </span>
                </span>
                {i < AUTHORITY_HIERARCHY.length - 1 && (
                  <span className="text-primary/70" aria-hidden>
                    →
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
