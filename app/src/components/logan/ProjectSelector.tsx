"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { NewProjectDialog } from "./NewProjectDialog";
import { FolderOpen, Plus } from "lucide-react";

export function ProjectSelector() {
  const projects = useProjects();
  const activeId = useLoganStore((s) => s.activeProjectId);
  const setActive = useLoganStore((s) => s.setActiveProjectId);
  const [openNew, setOpenNew] = React.useState(false);

  const active = projects.data?.find((p) => p.id === activeId) ?? null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          value={activeId ?? ""}
          onValueChange={(v) => {
            if (v === "__new__") setOpenNew(true);
            else setActive(v);
          }}
        >
          <SelectTrigger
            aria-label="Proyecto activo"
            className="h-9 min-w-[12rem] max-w-[18rem] bg-card/60"
          >
            <span className="flex items-center gap-2 truncate">
              <FolderOpen className="size-4 text-primary" />
              <SelectValue placeholder="Sin proyecto">
                {active ? active.name : "Sin proyecto"}
              </SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Proyectos</SelectLabel>
              {projects.data && projects.data.length > 0 ? (
                projects.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__none" disabled>
                  Sin proyectos todavía
                </SelectItem>
              )}
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="__new__">
              <span className="flex items-center gap-2 text-primary">
                <Plus className="size-4" /> Nuevo proyecto…
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-2"
          aria-label="Nuevo proyecto"
          onClick={() => setOpenNew(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <NewProjectDialog open={openNew} onOpenChange={setOpenNew} />
    </>
  );
}
