"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Code2, Store, Gauge, Target, MessageCircle,
  type LucideIcon,
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
};

const SERVICES: Service[] = [
  {
    id: "marketing",
    title: "Marketing efectivo",
    description:
      "Campañas Meta con copies que convierten, prompts para imagen y video, presupuestos sugeridos y estimaciones de resultado.",
    icon: Megaphone,
    bullets: ["Campañas Meta", "Copies", "Prompts IA", "Presupuestos"],
  },
  {
    id: "webs-apps",
    title: "Webs y aplicaciones",
    description:
      "Construimos en Next.js — sites responsivos, PWA instalables, bots de WhatsApp integrados a tu operación.",
    icon: Code2,
    bullets: ["Next.js", "PWA", "Bots WhatsApp", "APIs"],
  },
  {
    id: "digitalizacion",
    title: "Digitalización de negocios",
    description:
      "Convertimos tu operación offline en sistema: catálogo, pagos en línea, gestión de clientes, citas y órdenes.",
    icon: Store,
    bullets: ["Catálogo", "Pagos", "Clientes", "Citas"],
  },
  {
    id: "control",
    title: "Control de negocios digitalizados",
    description:
      "Si ya tienes un sistema, lo auditamos, optimizamos y empujamos el growth con base en métricas reales, no suposiciones.",
    icon: Gauge,
    bullets: ["Auditoría", "Optimización", "Growth", "Métricas"],
  },
  {
    id: "campanas",
    title: "Campañas efectivas",
    description:
      "Meta Ads con hipótesis verificables: cada campaña lleva una predicción medible que Analytics verificará después.",
    icon: Target,
    bullets: ["Meta Ads", "Hipótesis", "Verificación", "A/B"],
  },
  {
    id: "agente",
    title: "Agente IA conversacional",
    description:
      "Bot de WhatsApp + web chat que atiende a tus clientes con la voz y el conocimiento de tu negocio, 24/7.",
    icon: MessageCircle,
    bullets: ["WhatsApp", "Web chat", "24/7", "Tu marca"],
  },
];

export function Services() {
  return (
    <section
      id="servicios"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="servicios-title"
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
            Servicios
          </p>
          <h2
            id="servicios-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            Qué puede hacer LOGAN
            <br />
            <span className="sc-shimmer-text">por tu negocio</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            No es una lista de productos. Es un sistema coordinado: cada servicio
            se conecta con los demás para que el resultado sea mayor que la suma
            de las partes.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="sc-glass sc-glass-hover group relative overflow-hidden rounded-2xl p-5 sm:p-6"
              >
                {/* Hover gradient overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.16_65/0.18)_0%,transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.78_0.16_65/0.18)] to-[oklch(0.55_0.14_35/0.10)] text-[oklch(0.85_0.16_65)] ring-1 ring-[oklch(0.78_0.16_65/0.35)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-serif text-lg text-[oklch(0.93_0.012_75)]">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[oklch(0.78_0.012_72)]">
                  {s.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="rounded-full border border-[oklch(0.32_0.012_60/50%)] bg-[oklch(0.18_0.012_60/50%)] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[oklch(0.78_0.012_72)]"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
