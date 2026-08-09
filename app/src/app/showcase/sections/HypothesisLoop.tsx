"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Brain, FileText, BarChart3, RefreshCw } from "lucide-react";

type Step = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: typeof Brain;
};

const STEPS: Step[] = [
  {
    id: "decide",
    label: "01",
    title: "Especialista decide",
    description:
      "Marketing propone una campaña. Dev implementa una feature. Design elige una paleta. Cada decisión nace con un por qué.",
    icon: Brain,
  },
  {
    id: "registra",
    label: "02",
    title: "Registra hipótesis",
    description:
      "El rol declara: contexto, hipótesis y predicción medible. La hipótesis queda vinculada al entregable.",
    icon: FileText,
  },
  {
    id: "verifica",
    label: "03",
    title: "Analytics verifica",
    description:
      "Después de un tiempo, Analytics mide resultados reales contra la predicción. Veredicto: confirmada o refutada.",
    icon: BarChart3,
  },
  {
    id: "aprende",
    label: "04",
    title: "LOGAN aprende",
    description:
      "Si acertó, se repite el patrón. Si falló, se ajusta. El aprendizaje migra a LOGAN o a la Biblia del proyecto.",
    icon: RefreshCw,
  },
];

export function HypothesisLoop() {
  return (
    <section
      id="diferenciador"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="diferenciador-title"
    >
      {/* Background warm tint */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.18 0.012 60 / 0.6) 0%, transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[oklch(0.65_0.012_70)]">
            El diferenciador
          </p>
          <h2
            id="diferenciador-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            El bucle de
            <span className="sc-shimmer-text"> hipótesis</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            Cada decisión deja una huella. Cada resultado, una lección. Así LOGAN
            se convierte en un sistema que aprende de sus propios resultados.
          </p>
        </motion.div>

        {/* Flow diagram */}
        <div className="mt-14">
          {/* Desktop: 4 nodes in a row, connected by animated lines */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <FlowNode step={s} index={i} />
                {i < STEPS.length - 1 && <FlowConnector delay={i * 0.15} />}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile: vertical stack */}
          <div className="md:hidden space-y-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <FlowNode step={s} index={i} mobile />
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center" aria-hidden>
                    <div className="h-6 w-px bg-gradient-to-b from-[oklch(0.72_0.14_50/60%)] to-transparent" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Loop back indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-3 text-sm text-[oklch(0.65_0.012_70)]"
          >
            <RefreshCw className="size-4 text-[oklch(0.85_0.16_65)] sc-breathe" />
            <span className="italic">
              El ciclo se cierra. La próxima decisión parte de lo aprendido.
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FlowNode({ step, index, mobile = false }: { step: Step; index: number; mobile?: boolean }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.12 }}
      className="sc-glass sc-glass-hover rounded-2xl p-5 sm:p-6 flex flex-col items-start gap-3 h-full"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.78_0.16_65/0.18)] to-[oklch(0.55_0.14_35/0.10)] text-[oklch(0.85_0.16_65)] ring-1 ring-[oklch(0.78_0.16_65/0.4)]">
          <Icon className="size-5" />
        </div>
        <span className="font-serif text-3xl text-[oklch(0.32_0.012_60/70%)]">
          {step.label}
        </span>
      </div>
      <h3 className="font-serif text-lg text-[oklch(0.93_0.012_75)] leading-tight">
        {step.title}
      </h3>
      <p className="text-sm leading-relaxed text-[oklch(0.78_0.012_72)]">
        {step.description}
      </p>
      {mobile && (
        <span className="text-[10px] uppercase tracking-widest text-[oklch(0.55_0.012_70)]">
          Paso {step.label}
        </span>
      )}
    </motion.div>
  );
}

function FlowConnector({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <motion.svg
        width="64"
        height="24"
        viewBox="0 0 64 24"
        fill="none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
      >
        <line
          x1="0"
          y1="12"
          x2="56"
          y2="12"
          stroke="oklch(0.72 0.14 50 / 0.6)"
          strokeWidth="2"
          className="sc-flow-line"
        />
        <path
          d="M50 6 L62 12 L50 18 Z"
          fill="oklch(0.85 0.16 65)"
          opacity="0.7"
        />
      </motion.svg>
    </div>
  );
}
