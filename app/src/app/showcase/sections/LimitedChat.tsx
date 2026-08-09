"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Lock, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "logan";
  content: string;
  ts: number;
};

const WHATSAPP_URL =
  "https://wa.me/5215512345678?text=Hola%20LOGAN%2C%20quiero%20una%20demostraci%C3%B3n%20completa";
const EMAIL_URL =
  "mailto:hola@logancorp.mx?subject=Demostraci%C3%B3n%20LOGAN";

const SUGGESTIONS = [
  "¿Qué eres, LOGAN?",
  "¿Cómo trabajas con un negocio real?",
  "¿Qué servicios ofrecen?",
  "¿Puedes crear una campaña para mi negocio?",
];

const INTRO_MESSAGE: Message = {
  id: "intro",
  role: "logan",
  content:
    "Hola. Soy **LOGAN** en modo demostración pública. Puedo contarte qué hago, cómo coordino a mis 9 roles y por qué aprendo de mis propios resultados. **No** ejecuto trabajo real aquí — eso lo hago para mis clientes. ¿Qué quieres saber?",
  ts: Date.now(),
};

export function LimitedChat() {
  const [messages, setMessages] = React.useState<Message[]>([INTRO_MESSAGE]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [rateLimited, setRateLimited] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || rateLimited) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        ts: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/showcase/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            setRateLimited(true);
            setRemaining(0);
            setMessages((m) => [
              ...m,
              {
                id: `l-${Date.now()}`,
                role: "logan",
                content: data.response,
                ts: Date.now(),
              },
            ]);
            return;
          }
          throw new Error(data.error || "LOGAN no respondió");
        }

        setMessages((m) => [
          ...m,
          {
            id: `l-${Date.now()}`,
            role: "logan",
            content: data.response,
            ts: Date.now(),
          },
        ]);
        if (typeof data.remaining === "number") {
          setRemaining(data.remaining);
          if (data.remaining === 0) setRateLimited(true);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [loading, rateLimited],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const onSuggestion = (s: string) => {
    sendMessage(s);
  };

  return (
    <section
      id="demo"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="demo-title"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.18 0.014 50 / 0.6) 0%, transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[oklch(0.65_0.012_70)]">
            Demostración interactiva
          </p>
          <h2
            id="demo-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            Habla con
            <span className="sc-shimmer-text"> LOGAN</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            Esta es una versión limitada. Sin git, sin acceso a tus datos, sin
            crear archivos. Pregúntale lo que quieras saber sobre LOGAN.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 sc-glass rounded-2xl overflow-hidden"
        >
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-[oklch(0.32_0.012_60/55%)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="sc-pulse-glow flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]"
                aria-hidden
              >
                <span className="font-serif text-lg leading-none text-[oklch(0.14_0.008_60)]">
                  L
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[oklch(0.93_0.012_75)]">
                  LOGAN
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[oklch(0.65_0.012_70)] flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[oklch(0.7_0.14_155)] sc-breathe" />
                  Modo demostración
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-[oklch(0.55_0.012_70)]">
                Restantes
              </div>
              <div
                className={`text-sm font-mono ${
                  remaining === null
                    ? "text-[oklch(0.65_0.012_70)]"
                    : remaining > 1
                    ? "text-[oklch(0.78_0.16_65)]"
                    : "text-[oklch(0.78_0.18_25)]"
                }`}
                aria-live="polite"
              >
                {remaining === null ? "5" : remaining}/5
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="sc-chat-scroll max-h-[460px] min-h-[280px] overflow-y-auto px-4 py-5 space-y-4"
            aria-live="polite"
            aria-label="Conversación con LOGAN"
          >
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div
                  className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]"
                  aria-hidden
                >
                  <span className="font-serif text-xs text-[oklch(0.14_0.008_60)]">
                    L
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[oklch(0.65_0.012_70)]">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>LOGAN está pensando…</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && !loading && !rateLimited && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestion(s)}
                  className="rounded-full border border-[oklch(0.32_0.012_60/55%)] bg-[oklch(0.18_0.012_60/55%)] px-3 py-1.5 text-xs text-[oklch(0.78_0.012_72)] transition-colors hover:border-[oklch(0.78_0.16_65/0.6)] hover:text-[oklch(0.85_0.16_65)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Rate-limited notice */}
          {rateLimited && (
            <div className="mx-4 mb-3 rounded-xl border border-[oklch(0.78_0.16_65/0.4)] bg-[oklch(0.78_0.16_65/0.08)] p-3 text-sm">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 mt-0.5 text-[oklch(0.85_0.16_65)]" />
                <div className="flex-1">
                  <p className="font-medium text-[oklch(0.93_0.012_75)]">
                    Has alcanzado el límite de la demostración.
                  </p>
                  <p className="mt-1 text-xs text-[oklch(0.78_0.012_72)]">
                    Para una demostración completa y personalizada — donde
                    LOGAN coordina a sus 9 roles sobre tu negocio real —
                    contáctanos:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)] px-3 py-1.5 text-xs font-medium text-[oklch(0.14_0.008_60)]"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={EMAIL_URL}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.32_0.012_60/55%)] px-3 py-1.5 text-xs text-[oklch(0.93_0.012_75)] hover:border-[oklch(0.78_0.16_65/0.6)]"
                    >
                      Correo
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !rateLimited && (
            <div className="mx-4 mb-3 rounded-xl border border-[oklch(0.7_0.19_25/0.4)] bg-[oklch(0.7_0.19_25/0.08)] p-3 text-xs text-[oklch(0.78_0.18_25)] flex items-start gap-2">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="border-t border-[oklch(0.32_0.012_60/55%)] p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                rateLimited
                  ? "Demostración limitada. Contáctanos para continuar."
                  : "Escribe tu pregunta a LOGAN…"
              }
              disabled={loading || rateLimited}
              maxLength={2000}
              aria-label="Mensaje para LOGAN"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[oklch(0.93_0.012_75)] placeholder:text-[oklch(0.55_0.012_70)] focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || rateLimited}
              aria-label="Enviar mensaje"
              className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)] text-[oklch(0.14_0.008_60)] shadow-[0_4px_16px_-4px_oklch(0.78_0.16_65/0.55)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </form>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[oklch(0.55_0.012_70)]"
        >
          <Lock className="size-3.5" />
          Versión limitada. LOGAN completo está disponible para clientes.
          Sin git, sin persistencia, sin acceso a tu Biblia.
        </motion.p>
      </div>
    </section>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-[oklch(0.28_0.012_60/55%)] text-[oklch(0.78_0.012_72)]"
            : "bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)] text-[oklch(0.14_0.008_60)]"
        }`}
        aria-hidden
      >
        {isUser ? (
          <span className="text-[10px] font-semibold">TÚ</span>
        ) : (
          <span className="font-serif text-sm leading-none">L</span>
        )}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[oklch(0.28_0.012_60/55%)] text-[oklch(0.93_0.012_75)] rounded-tr-sm"
            : "bg-[oklch(0.22_0.012_60/70%)] text-[oklch(0.93_0.012_75)] border border-[oklch(0.32_0.012_60/55%)] rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="space-y-2 text-[oklch(0.93_0.012_75)] [&_a]:text-[oklch(0.85_0.16_65)] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-[oklch(0.85_0.16_65)] [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <strong>{children}</strong>,
                h2: ({ children }) => <strong>{children}</strong>,
                h3: ({ children }) => <strong>{children}</strong>,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
