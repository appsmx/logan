"use client";

import * as React from "react";
import { Github, Scale } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="mt-auto border-t bg-background/80 backdrop-blur"
      aria-label="Pie de página LOGAN OS"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
          <span className="font-serif text-sm text-foreground/80">
            LOGAN
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span>
            Learning, Organization, Governance, Architecture &amp; Navigation
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href="https://github.com/appsmx/logan"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Github className="size-3.5" />
            github.com/appsmx/logan
          </a>
          <span className="text-border">·</span>
          <span>v1.0 · Oficial</span>
        </div>
      </div>
    </footer>
  );
}
