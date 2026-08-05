"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Color = "muted" | "primary" | "success" | "warning" | "destructive";

const COLOR: Record<Color, string> = {
  muted:
    "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary text-primary-foreground border-transparent",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusPill({
  children,
  color = "muted",
  className,
  dot = true,
}: {
  children: React.ReactNode;
  color?: Color;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        COLOR[color],
        className,
      )}
    >
      {dot && (
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
      )}
      {children}
    </span>
  );
}

export type { Color as StatusColor };
