"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject } from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [vision, setVision] = React.useState("");
  const [users, setUsers] = React.useState("");
  const create = useCreateProject();
  const setActiveProjectId = useLoganStore((s) => s.setActiveProjectId);

  React.useEffect(() => {
    if (open) {
      setName("");
      setVision("");
      setUsers("");
    }
  }, [open]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("El proyecto necesita un nombre");
      return;
    }
    const usersArr = users
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    create.mutate(
      { name: name.trim(), vision: vision.trim() || undefined, users: usersArr.length ? usersArr : undefined },
      {
        onSuccess: (p) => {
          setActiveProjectId(p.id);
          onOpenChange(false);
          toast.success(`Proyecto "${p.name}" creado`);
          onCreated?.(p.id);
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Nuevo proyecto
          </DialogTitle>
          <DialogDescription>
            Una empresa o aplicación que el ecosistema LOGAN OS va a crear,
            administrar o hacer crecer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="np-name">Nombre *</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Tienda de café · App de meditación"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="np-vision">Visión del proyecto</Label>
            <Textarea
              id="np-vision"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="¿Qué queremos que sea este producto? Breve."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="np-users">Usuarios / audiencia</Label>
            <Textarea
              id="np-users"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              placeholder="Una audiencia por línea (o separa con comas)."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Creando…" : "Crear proyecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
