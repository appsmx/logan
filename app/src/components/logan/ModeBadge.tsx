"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { WORK_MODES } from "@/lib/logan-os-data";
import type { StatusColor } from "./StatusPill";
import { cn } from "@/lib/utils";

const MODE_COLORS: Record<string, StatusColor> = {
  exploracion: "muted",
  arquitectura: "primary",
  construccion: "warning",
  auditoria: "destructive",
  evolucion: "success",
};

const BADGE_CLASS: Record<StatusColor, string> = {
  muted: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary text-primary-foreground border-transparent",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

export function ModeBadge({
  mode,
  className,
}: {
  mode: string | null | undefined;
  className?: string;
}) {
  const found = WORK_MODES.find((m) => m.key === mode) ?? WORK_MODES[0];
  const color = MODE_COLORS[found.key] ?? "muted";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        BADGE_CLASS[color],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          color === "muted" && "bg-muted-foreground/60",
          color === "primary" && "bg-primary",
          color === "success" && "bg-success",
          color === "warning" && "bg-warning",
          color === "destructive" && "bg-destructive",
        )}
      />
      {found.name}
    </Badge>
  );
}
