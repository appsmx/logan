"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, User, ShieldAlert, Loader2, Sparkles } from "lucide-react";
import { useLoganStore } from "@/lib/store";
import { SectionHeading } from "@/components/logan/SectionHeading";
import { EmptyState } from "@/components/logan/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/lib/hooks";
import { toast } from "sonner";
import { CONSTITUTION_ARTICLES, MARKETING_CAPABILITIES, LEGAL_CAPABILITIES, SUPPORT_CAPABILITIES } from "@/lib/logan-os-data";

// A single turn with LOGAN Core.
type ActionTaken = {
  type:
    | "register_decision"
    | "register_hypothesis"
    | "marketing_proposal"
    | "marketing_execute"
    | "dev_execute"
    | "design_execute"
    | "analytics_verify"
    | "analytics_patterns"
    | "finance_execute"
    | "legal_execute"
    | "support_execute";
  decId?: string;
  id?: string;
  hypothesisId?: string;
  marketingAssetId?: string;
  devAssetId?: string;
  designAssetId?: string;
  financeAssetId?: string;
  legalAssetId?: string;
  supportAssetId?: string;
  capability?: string;
  title?: string;
  verdict?: string;
  hypothesesAnalyzed?: number;
};

type CoreResponse = {
  response: string;
  actionsTaken?: ActionTaken[];
  constitutionalCheck?: {
    approved: boolean;
    violatedArticle?: string | null;
    note?: string;
  };
  sessionId?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "logan";
  text: string;
  actions?: ActionTaken[];
  constitutional?: CoreResponse["constitutionalCheck"];
  pending?: boolean;
};

export function ChatSection() {
  const activeProjectId = useLoganStore((s) => s.activeProjectId);
  const { data: project } = useProject(activeProjectId || undefined);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message.
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Reset chat when project changes.
  React.useEffect(() => {
    setMessages([]);
  }, [activeProjectId]);

  if (!activeProjectId) {
    return (
      <EmptyState
        title="Necesitas un proyecto activo"
        description="LOGAN Core orquesta el trabajo de un proyecto. Crea o selecciona un proyecto para hablar con LOGAN."
        actionLabel="Ir al selector de proyecto"
      />
    );
  }

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending || !activeProjectId) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const pendingMsg: ChatMessage = {
      id: `l-${Date.now()}`,
      role: "logan",
      text: "",
      pending: true,
    };
    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          message: trimmed,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data: CoreResponse = await res.json();

      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                text: data.response || "(LOGAN no devolvió respuesta)",
                actions: data.actionsTaken,
                constitutional: data.constitutionalCheck,
                pending: false,
              }
            : msg
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setMessages((m) =>
        m.map((s) =>
          s.id === pendingMsg.id
            ? {
                ...s,
                text: `No pude responder esta vez: ${msg}. Intenta de nuevo.`,
                pending: false,
              }
            : s
        )
      );
      toast.error("LOGAN no pudo responder", { description: msg });
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Hablar con LOGAN"
        subtitle={
          project
            ? `Hablás con LOGAN Core — la única voz del ecosistema. Detrás, Core lee la Constitución, la Biblia de ${project.name} y el reporte de Memory, y responde coherente. Si registra una decisión o hipótesis, lo verás abajo del mensaje.`
            : "Hablás con LOGAN Core — la única voz del ecosistema."
        }
      />

      {/* Conversation surface */}
      <div
        ref={scrollRef}
        className="logan-scroll flex h-[60vh] min-h-[420px] flex-col gap-4 overflow-y-auto rounded-xl border bg-card p-4 sm:p-6"
        role="log"
        aria-live="polite"
        aria-label="Conversación con LOGAN"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <Brain className="h-10 w-10 text-primary" aria-hidden />
            <div>
              <p className="font-serif text-lg text-foreground">
                LOGAN escucha.
              </p>
              <p className="mt-1 max-w-md text-sm">
                Pregúntale qué hacer primero, pídele una decisión, o solicítale
                una propuesta de Marketing. Cada respuesta suya pasa la
                validación constitucional.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border bg-background px-3 py-1.5 text-xs text-foreground/80 transition hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm border bg-background px-4 py-3"
                  }
                >
                  {/* Header row */}
                  <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide opacity-70">
                    {m.role === "user" ? (
                      <>
                        <User className="h-3 w-3" aria-hidden /> Tú
                      </>
                    ) : (
                      <>
                        <Brain className="h-3 w-3 text-primary" aria-hidden />{" "}
                        LOGAN
                      </>
                    )}
                  </div>

                  {/* Body */}
                  {m.pending ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span className="text-sm italic">pensando…</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {m.text}
                    </div>
                  )}

                  {/* Actions footer (LOGAN only) */}
                  {m.role === "logan" && !m.pending && m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Registró:
                      </span>
                      {m.actions.map((a, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="gap-1 border-primary/30 bg-primary/5 text-[10px] font-normal"
                        >
                          <Sparkles className="h-3 w-3 text-primary" aria-hidden />
                          {actionLabel(a)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Constitutional flag (LOGAN only, when not approved) — shows the full text of the cited article so the human can verify */}
                  {m.role === "logan" && !m.pending && m.constitutional && !m.constitutional.approved && (() => {
                    const roman = m.constitutional?.violatedArticle ?? null;
                    const article = roman
                      ? CONSTITUTION_ARTICLES.find((a) => a.roman === roman)
                      : null;
                    return (
                      <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-50/60 px-3 py-2.5 text-xs dark:bg-amber-950/20">
                        <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                          <div>
                            <span className="font-semibold">
                              Validación constitucional — Art. {roman}
                              {article ? `: ${article.title}` : ""}
                            </span>
                            <p className="mt-1 text-amber-800 dark:text-amber-300">
                              {m.constitutional?.note || "Posible violación."}
                            </p>
                            {article && (
                              <blockquote className="mt-2 border-l-2 border-amber-400/60 pl-2 text-[11px] italic text-amber-700/90 dark:text-amber-400/80">
                                “{article.body}”
                              </blockquote>
                            )}
                            <p className="mt-2 text-[11px] italic text-amber-700/80 dark:text-amber-400/80">
                              LOGAN eleva este desacuerdo fundamentado al
                              criterio humano (Art. VII, Art. IX). Tú decides si
                              la respuesta aplica o no.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe a LOGAN…  (Enter para enviar · Shift+Enter para salto de línea)"
          className="min-h-[52px] flex-1 resize-none"
          aria-label="Mensaje a LOGAN"
          disabled={sending}
        />
        <Button
          onClick={send}
          disabled={sending || !input.trim()}
          className="h-[52px] gap-2"
          aria-label="Enviar mensaje a LOGAN"
        >
          <Send className="h-4 w-4" aria-hidden />
          Enviar
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        LOGAN lee la Constitución y la Biblia de {project?.name || "tu proyecto"}{" "}
        en cada turno. Cada respuesta se valida contra los 10 artículos. Si
        registra una decisión o hipótesis, queda persistido en el ecosistema.
      </p>
    </div>
  );
}

function actionLabel(a: ActionTaken): string {
  if (a.type === "register_decision") return a.decId || "Decisión";
  if (a.type === "register_hypothesis") return "Hipótesis";
  if (a.type === "marketing_proposal") return "Brief de Marketing";
  if (a.type === "marketing_execute") {
    const cap = MARKETING_CAPABILITIES.find((c) => c.key === a.capability);
    return cap?.label || a.title || "Marketing";
  }
  if (a.type === "legal_execute") {
    const cap = LEGAL_CAPABILITIES.find((c) => c.key === a.capability);
    return cap?.label || a.title || "Legal";
  }
  if (a.type === "support_execute") {
    const cap = SUPPORT_CAPABILITIES.find((c) => c.key === a.capability);
    return cap?.label || a.title || "Support";
  }
  return a.title || a.type;
}

const SUGGESTIONS = [
  "¿Qué deberíamos hacer primero?",
  "Propónme una campaña de Meta con su hipótesis.",
  "¿Qué decisión importante falta por tomar?",
];
