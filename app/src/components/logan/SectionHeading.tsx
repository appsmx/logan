"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RoleIcon } from "./RoleIcon";

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <RoleIcon name={icon} className="size-5" />
            </div>
          )}
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
