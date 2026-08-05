"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "./ProjectSelector";
import { ModeBadge } from "./ModeBadge";
import { useProject } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, setTheme } = useTheme();
  const activeId = useLoganStore((s) => s.activeProjectId);
  const setActiveSection = useLoganStore((s) => s.setActiveSection);
  const project = useProject(activeId);
  const [navOpen, setNavOpen] = React.useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir navegación"
                className="size-9"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navegación LOGAN OS</SheetTitle>
              <Sidebar onNavigate={() => setNavOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Monogram + name */}
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground ring-1 ring-primary/40 shadow-sm"
          >
            <span className="font-serif text-xl leading-none">L</span>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-serif text-lg tracking-tight text-foreground">
              LOGAN OS
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              v1.0 · Oficial
            </span>
          </div>
        </div>

        <div className="ml-1 hidden md:block h-6 w-px bg-border" />

        {/* Project selector */}
        <div className="ml-auto md:ml-0">
          <ProjectSelector />
        </div>

        {/* Mode badge + theme + PCS */}
        <div className="ml-auto flex items-center gap-2">
          {project.data && (
            <div className="hidden sm:block">
              <ModeBadge mode={project.data.currentMode} />
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="hidden lg:inline-flex h-9 gap-2"
            disabled={!project.data}
            onClick={() => setActiveSection("sesion")}
            aria-label="Generar SESSION_CONTEXT (PCS)"
          >
            <Waypoints className="size-4 text-primary" />
            Generar PCS
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
