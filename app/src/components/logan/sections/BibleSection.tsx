"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { StatusPill, type StatusColor } from "@/components/logan/StatusPill";
import { WORK_MODES } from "@/lib/logan-os-data";
import {
  useBacklog,
  useCreateBacklogItem,
  useDeleteBacklogItem,
  useProject,
  useUpdateBacklogItem,
  useUpdateProject,
} from "@/lib/hooks";
import { useLoganStore } from "@/lib/store";
import { toast } from "sonner";
import { shortDate } from "@/lib/api";
import { BookText, Plus, Trash2, Save, X } from "lucide-react";
import type { BacklogItem } from "@/lib/logan-types";

const PRIORITY_COLOR: Record<string, StatusColor> = {
  baja: "muted",
  media: "warning",
  alta: "destructive",
};

const STATUSES = ["En construcción", "En revisión", "Oficial"];
const PHASES = Array.from({ length: 8 }, (_, i) => i + 1);

export function BibleSection() {
  const activeId = useLoganStore((s) => s.activeProjectId);
  const project = useProject(activeId);

  if (!activeId || !project.data) {
    return (
      <section className="space-y-6" aria-labelledby="biblia-title">
        <SectionHeading
          eyebrow="Conocimiento del proyecto"
          title="Biblia"
          icon="BookText"
          description="Visión, usuarios, estado y backlog del proyecto activo. La Biblia es la única fuente de verdad del producto."
        />
        <EmptyState
          icon={<BookText className="size-5" />}
          title="Crea o selecciona un proyecto"
          description="La Biblia es la única fuente de verdad del producto. Crea uno para empezar a escribirla."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="biblia-title">
      <SectionHeading
        eyebrow="Conocimiento del proyecto"
        title="Biblia"
        icon="BookText"
        description="La Biblia define el producto. Visión, usuarios, decisiones, especificaciones y estado. Nombre estándar: Biblia_<Proyecto>.md"
      />

      <Tabs defaultValue="vision" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="vision">Visión</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="estado">Estado</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent value="vision">
          <VisionTab />
        </TabsContent>
        <TabsContent value="usuarios">
          <UsersTab />
        </TabsContent>
        <TabsContent value="estado">
          <StateTab />
        </TabsContent>
        <TabsContent value="backlog">
          <BacklogTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function VisionTab() {
  const activeId = useLoganStore((s) => s.activeProjectId)!;
  const project = useProject(activeId);
  const update = useUpdateProject(activeId);
  const [vision, setVision] = React.useState("");

  React.useEffect(() => {
    setVision(project.data?.vision ?? "");
  }, [project.data?.vision]);

  const save = () => {
    if (!vision.trim()) return;
    update.mutate(
      { vision: vision.trim() },
      {
        onSuccess: () => toast.success("Visión del proyecto guardada"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Visión del proyecto</CardTitle>
        <CardDescription>
          Se autoguarda al perder el foco. La visión define qué queremos que sea
          este producto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          onBlur={save}
          rows={8}
          placeholder="¿Qué queremos que sea este producto?"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={save} variant="outline" size="sm">
            <Save className="size-3.5" />
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  const activeId = useLoganStore((s) => s.activeProjectId)!;
  const project = useProject(activeId);
  const update = useUpdateProject(activeId);
  const [users, setUsers] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    setUsers(project.data?.users ?? []);
  }, [project.data?.users]);

  const save = (arr: string[]) => {
    update.mutate(
      { users: arr },
      {
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const add = () => {
    if (!draft.trim()) return;
    const next = [...users, draft.trim()];
    setUsers(next);
    setDraft("");
    save(next);
  };

  const remove = (i: number) => {
    const next = users.filter((_, idx) => idx !== i);
    setUsers(next);
    save(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Usuarios</CardTitle>
        <CardDescription>
          La audiencia a la que se dirige el producto. Una descripción por
          entrada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Ej. Madres primerizas 25-35 con bebé 0-12 meses"
          />
          <Button onClick={add}>
            <Plus className="size-4" />
            Añadir
          </Button>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin usuarios definidos todavía.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {users.map((u, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 rounded-md border bg-card/40 px-3 py-1.5 text-sm"
              >
                <span className="text-foreground/90">{u}</span>
                <button
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Quitar usuario"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function StateTab() {
  const activeId = useLoganStore((s) => s.activeProjectId)!;
  const project = useProject(activeId);
  const update = useUpdateProject(activeId);

  const [status, setStatus] = React.useState("En construcción");
  const [phase, setPhase] = React.useState(1);
  const [mode, setMode] = React.useState("exploracion");
  const [repo, setRepo] = React.useState("");

  React.useEffect(() => {
    setStatus(project.data?.status ?? "En construcción");
    setPhase(project.data?.currentPhase ?? 1);
    setMode(project.data?.currentMode ?? "exploracion");
    setRepo(project.data?.repo ?? "");
  }, [project.data]);

  const save = () => {
    update.mutate(
      { status, currentPhase: phase, currentMode: mode, repo: repo.trim() || null },
      {
        onSuccess: () => toast.success("Estado actualizado"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Estado del proyecto
        </CardTitle>
        <CardDescription>
          Estado global, fase del ciclo metodológico, modo de trabajo y
          repositorio GitHub asociado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Fase actual</Label>
            <Select
              value={String(phase)}
              onValueChange={(v) => setPhase(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHASES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Fase {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Modo de trabajo</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-repo">Repositorio GitHub asociado</Label>
          <Input
            id="project-repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="mrtramite"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nombre del repo de GitHub que LOGAN debe usar por defecto al emitir
            acciones git (branches, archivos, PRs) para este proyecto. Debe estar
            en <code className="rounded bg-muted px-1 py-0.5">LOGAN_ALLOWED_REPOS</code>{" "}
            (mrtramite, mariscoseljona). Vacío = sin repo asociado; LOGAN te
            preguntará qué repo usar antes de emitir acciones git.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={update.isPending}>
            <Save className="size-4" />
            Guardar estado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BacklogTab() {
  const activeId = useLoganStore((s) => s.activeProjectId)!;
  const list = useBacklog(activeId);
  const create = useCreateBacklogItem(activeId);
  const update = useUpdateBacklogItem(activeId);
  const del = useDeleteBacklogItem(activeId);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState("media");

  const items = list.data ?? [];

  const add = () => {
    if (!title.trim()) {
      toast.error("El ítem necesita un título");
      return;
    }
    create.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setPriority("media");
          toast.success("Ítem añadido al backlog");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const setStatus = (it: BacklogItem, status: string) => {
    update.mutate(
      { id: it.id, status },
      {
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Nuevo ítem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="bl-title">Título</Label>
            <Input
              id="bl-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bl-desc">Descripción</Label>
            <Textarea
              id="bl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">baja</SelectItem>
                  <SelectItem value="media">media</SelectItem>
                  <SelectItem value="alta">alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={add} disabled={create.isPending} className="w-full">
                <Plus className="size-4" />
                Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-serif text-lg text-foreground">
          Backlog ({items.length})
        </h3>
        {items.length === 0 ? (
          <EmptyState
            icon={<BookText className="size-5" />}
            title="Backlog vacío"
            description="Cada ítem del backlog es una unidad de trabajo pendiente del producto."
          />
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-md border bg-card/40 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium text-foreground text-sm">
                        {it.title}
                      </p>
                      <StatusPill color={PRIORITY_COLOR[it.priority]} dot={false}>
                        {it.priority}
                      </StatusPill>
                    </div>
                    {it.description && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {it.description}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {shortDate(it.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Select
                      value={it.status}
                      onValueChange={(v) => setStatus(it, v)}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">pendiente</SelectItem>
                        <SelectItem value="en_progreso">en progreso</SelectItem>
                        <SelectItem value="completada">completada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        del.mutate(it.id, {
                          onError: (e: Error) => toast.error(e.message),
                        })
                      }
                      aria-label="Eliminar ítem"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
