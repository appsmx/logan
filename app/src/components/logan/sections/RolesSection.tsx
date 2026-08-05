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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleIcon } from "@/components/logan/RoleIcon";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { StatusPill } from "@/components/logan/StatusPill";
import { ROLES, type Role } from "@/lib/logan-os-data";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const KIND_COLOR = {
  sistema: "primary",
  especialista: "muted",
} as const;

const STATUS_COLOR = {
  activo: "success",
  planificado: "muted",
} as const;

const ROLE_COLOR_BG: Record<string, string> = {
  primary: "text-primary bg-primary/10 ring-primary/20",
  success: "text-success bg-success/15 ring-success/30",
  warning: "text-warning bg-warning/15 ring-warning/30",
  destructive: "text-destructive bg-destructive/10 ring-destructive/30",
  muted: "text-muted-foreground bg-muted ring-border",
};

function sortedRoles(): Role[] {
  const sys = ROLES.filter((r) => r.kind === "sistema");
  const esp = ROLES.filter((r) => r.kind === "especialista");
  return [...sys, ...esp];
}

export function RolesSection() {
  const [open, setOpen] = React.useState<Role | null>(null);

  return (
    <section className="space-y-6" aria-labelledby="roles-title">
      <SectionHeading
        eyebrow="Ecosistema"
        title="Roles"
        icon="Users"
        description="Los roles del sistema operativo LOGAN. Los roles de sistema orquestan; los especialistas ejecutan. Cada rol especialista devolverá, además del entregable, una hipótesis que justifica sus decisiones."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedRoles().map((r) => (
          <button
            key={r.key}
            onClick={() => setOpen(r)}
            className={cn(
              "group text-left flex flex-col rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/40",
              r.kind === "sistema" && "border-t-2 border-t-primary/50",
            )}
          >
            <div className="flex items-start gap-3 p-5 pb-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1",
                  ROLE_COLOR_BG[r.color] ?? ROLE_COLOR_BG.muted,
                )}
              >
                <RoleIcon name={r.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="font-serif text-base text-foreground">
                    {r.name}
                  </h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase tracking-widest",
                      r.kind === "sistema"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-muted text-muted-foreground border-transparent",
                    )}
                  >
                    {r.kind}
                  </Badge>
                  <StatusPill color={STATUS_COLOR[r.status]} dot>
                    {r.status}
                  </StatusPill>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
              {r.tagline}
            </div>
            {r.status === "planificado" && (
              <div className="mt-auto border-t bg-muted/30 px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                Próximamente
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-serif">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg ring-1",
                      ROLE_COLOR_BG[open.color] ?? ROLE_COLOR_BG.muted,
                    )}
                  >
                    <RoleIcon name={open.icon} className="size-5" />
                  </span>
                  {open.name}
                </DialogTitle>
                <DialogDescription>{open.tagline}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                    {open.kind}
                  </Badge>
                  <StatusPill color={STATUS_COLOR[open.status]}>
                    {open.status}
                  </StatusPill>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Responsabilidades
                  </div>
                  <ul className="space-y-1.5">
                    {open.responsibilities.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 text-sm text-foreground/85"
                      >
                        <Info className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
