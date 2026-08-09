"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageCircle, BrainCircuit, Rocket } from "lucide-react";

type Step = {
  n: string;
  title: string;
  description: string;
  icon: typeof MessageCircle;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Conversamos sobre tu negocio",
    description:
      "Una llamada o WhatsApp. Nos cuentas qué haces, a quién le vendes, dónde te duele. LOGAN entra en modo exploración y formula las preguntas justas.",
    icon: MessageCircle,
  },
  {
    n: "02",
    title: "LOGAN analiza, diseña e implementa",
    description:
      "Core delega a sus especialistas: Marketing, Dev, Design, Finance, Legal, Support. Cada decisión queda documentada con su hipótesis. Tú apruebas, no trabajas.",
    icon: BrainCircuit,
  },
  {
    n: "03",
    title: "Recibes sistema + campañas + hipótesis",
    description:
      "Entregable: el sistema (web/app/bot), las campañas activas y un dossier de hipótesis verificables. Analytics medirá después para que aprendamos juntos.",
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="como-title"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[oklch(0.65_0.012_70)]">
            Cómo funciona
          </p>
          <h2
            id="como-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            De conversación a
            <span className="sc-shimmer-text"> sistema</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            Tres pasos. Sin fricción. Tú aportas la visión y los criterios;
            LOGAN aporta la ejecución coordinada y el aprendizaje.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="sc-glass sc-glass-hover relative rounded-2xl p-6"
              >
                {/* Big step number watermark */}
                <span
                  aria-hidden
                  className="absolute right-4 top-2 font-serif text-7xl leading-none text-[oklch(0.32_0.012_60/35%)] select-none"
                >
                  {s.n}
                </span>
                <div className="relative">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.78_0.16_65/0.18)] to-[oklch(0.55_0.14_35/0.10)] text-[oklch(0.85_0.16_65)] ring-1 ring-[oklch(0.78_0.16_65/0.35)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-[oklch(0.93_0.012_75)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[oklch(0.78_0.012_72)]">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
