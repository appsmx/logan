"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Clock, Github } from "lucide-react";

type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  status: "live" | "repo" | "soon";
  emoji: string;
};

const PROJECTS: Project[] = [
  {
    id: "mr-tramite",
    name: "Mr. Trámite",
    category: "Gestión de trámites",
    description:
      "Plataforma para gestionar trámites con seguimiento de orden, pagos y notificaciones. LOGAN trabaja su marketing y desarrollo de forma continua.",
    href: "https://mrtramite.vercel.app",
    hrefLabel: "Ver proyecto",
    status: "live",
    emoji: "📋",
  },
  {
    id: "mariscos-el-jona",
    name: "Mariscos El Jona",
    category: "Restaurante digitalizado",
    description:
      "Restaurante de mariscos con catálogo digital, pedidos en línea y gestión interna. LOGAN diseñó, construyó y administra la operación.",
    href: "https://github.com/appsmx/mariscoseljona",
    hrefLabel: "Ver repositorio",
    status: "repo",
    emoji: "🦐",
  },
  {
    id: "hercules-bro",
    name: "Hércules Bro",
    category: "Próximamente",
    description:
      "Un proyecto en cocina. LOGAN está en fase de descubrimiento: definiendo visión, usuarios y MVP. Próximamente será presentado aquí mismo.",
    status: "soon",
    emoji: "💪",
  },
];

function statusBadge(s: Project["status"]) {
  switch (s) {
    case "live":
      return {
        label: "En vivo",
        cls: "bg-[oklch(0.7_0.14_155/0.18)] text-[oklch(0.78_0.14_155)] border-[oklch(0.7_0.14_155/0.4)]",
      };
    case "repo":
      return {
        label: "Código abierto",
        cls: "bg-[oklch(0.78_0.16_65/0.18)] text-[oklch(0.85_0.16_65)] border-[oklch(0.78_0.16_65/0.4)]",
      };
    case "soon":
      return {
        label: "Próximamente",
        cls: "bg-[oklch(0.28_0.012_60/60%)] text-[oklch(0.78_0.012_72)] border-[oklch(0.32_0.012_60/60%)]",
      };
  }
}

export function Projects() {
  return (
    <section
      id="proyectos"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="proyectos-title"
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
            Proyectos
          </p>
          <h2
            id="proyectos-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            Casos donde LOGAN
            <span className="sc-shimmer-text"> ya trabaja</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            Tres productos digitales reales. Cada uno con su propia Biblia, sus
            propias decisiones registradas y sus hipótesis en verificación.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROJECTS.map((p, i) => {
            const badge = statusBadge(p.status);
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="sc-glass sc-glass-hover group relative flex flex-col overflow-hidden rounded-2xl"
              >
                {/* Cover */}
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[oklch(0.18_0.012_60/55%)] to-[oklch(0.12_0.008_60/55%)]">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.78 0.16 65 / 0.25) 0%, transparent 70%)",
                    }}
                  />
                  <span className="relative text-5xl" aria-hidden>
                    {p.emoji}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg text-[oklch(0.93_0.012_75)]">
                      {p.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[oklch(0.65_0.012_70)]">
                    {p.category}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[oklch(0.78_0.012_72)]">
                    {p.description}
                  </p>

                  {/* Link */}
                  {p.status === "soon" ? (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[oklch(0.65_0.012_70)]">
                      <Clock className="size-3.5" />
                      En cocina
                    </div>
                  ) : (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(0.85_0.16_65)] transition-colors hover:text-[oklch(0.93_0.012_75)]"
                    >
                      {p.status === "repo" ? (
                        <Github className="size-3.5" />
                      ) : p.href?.startsWith("http") ? (
                        <ExternalLink className="size-3.5" />
                      ) : (
                        <FileText className="size-3.5" />
                      )}
                      {p.hrefLabel}
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
