"use client";

import * as React from "react";
import { SIDEBAR_SECTIONS } from "@/lib/logan-os-data";
import { RoleIcon } from "./RoleIcon";
import { useLoganStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GROUPS: { key: "MARCO" | "ECOSISTEMA" | "PROYECTO"; label: string; hint: string }[] = [
  { key: "MARCO", label: "MARCO", hint: "La visión, la constitución y el manual." },
  {
    key: "ECOSISTEMA",
    label: "ECOSISTEMA",
    hint: "Los roles y el bucle de aprendizaje.",
  },
  {
    key: "PROYECTO",
    label: "PROYECTO",
    hint: "La Biblia del proyecto activo.",
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const activeSection = useLoganStore((s) => s.activeSection);
  const setActiveSection = useLoganStore((s) => s.setActiveSection);

  return (
    <nav
      aria-label="Secciones LOGAN OS"
      className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground"
    >
      <div className="hidden md:flex h-16 items-center border-b px-5">
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Navegación
          </span>
          <span className="font-serif text-sm">Secciones</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto logan-scroll px-3 py-4">
        <TooltipProvider delayDuration={150}>
          {GROUPS.map((group) => {
            const sections = SIDEBAR_SECTIONS.filter((s) => s.group === group.key);
            return (
              <div key={group.key} className="mb-5">
                <div className="mb-2 px-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 leading-tight">
                    {group.hint}
                  </div>
                </div>
                <ul className="space-y-0.5">
                  {sections.map((s) => {
                    const disabled = s.requiresProject && !activeId;
                    const isActive = activeSection === s.key;
                    const item = (
                      <li key={s.key}>
                        <button
                          type="button"
                          disabled={disabled}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => {
                            if (disabled) return;
                            setActiveSection(s.key);
                            onNavigate?.();
                          }}
                          className={cn(
                            "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                            "min-h-[40px] text-left",
                            isActive
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            disabled &&
                              "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
                          )}
                        >
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary"
                            />
                          )}
                          <RoleIcon
                            name={s.icon}
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span className="truncate">{s.label}</span>
                          {s.requiresProject && (
                            <span className="ml-auto text-[10px] text-muted-foreground/60">
                              {activeId ? "" : "proy."}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                    if (!disabled) return item;
                    return (
                      <Tooltip key={s.key}>
                        <TooltipTrigger asChild>
                          <span className="block">{item}</span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Crea o selecciona un proyecto
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </nav>
  );
}
