"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Waypoints } from "lucide-react";

// Generate stable particle positions (deterministic on first render so SSR
// matches client). 18 particles — enough to feel alive, not enough to lag.
const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: (i * 53) % 100, // pseudo-random but deterministic
  size: 2 + ((i * 7) % 4),
  duration: 18 + ((i * 3) % 14),
  delay: (i * 1.3) % 14,
}));

export function Hero() {
  return (
    <section
      id="top"
      className="sc-section relative isolate flex min-h-[88vh] items-center justify-center px-4 py-20 sm:py-24"
      aria-label="Hero — LOGAN"
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Warm dark gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, oklch(0.18 0.014 50) 0%, oklch(0.12 0.008 60) 55%, oklch(0.10 0.006 60) 100%)",
          }}
        />
        {/* Grid */}
        <div className="sc-grid-bg" />
        {/* Glow orbs */}
        <div
          className="sc-orb"
          style={{
            width: 480,
            height: 480,
            top: "-10%",
            left: "55%",
            background:
              "radial-gradient(circle, oklch(0.78 0.16 65 / 0.45) 0%, transparent 70%)",
          }}
        />
        <div
          className="sc-orb"
          style={{
            width: 380,
            height: 380,
            top: "55%",
            left: "5%",
            background:
              "radial-gradient(circle, oklch(0.62 0.13 35 / 0.4) 0%, transparent 70%)",
          }}
        />
        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="sc-particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl text-center">
        {/* Animated monogram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-8 flex size-20 items-center justify-center"
        >
          <div
            className="sc-pulse-glow relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]"
            aria-hidden
          >
            <span className="font-serif text-5xl leading-none text-[oklch(0.14_0.008_60)]">
              L
            </span>
            <span
              className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-[oklch(0.18_0.012_60)] text-[oklch(0.85_0.16_65)] ring-1 ring-[oklch(0.78_0.16_65/0.6)] sc-breathe"
              aria-hidden
            >
              <Sparkles className="size-3.5" />
            </span>
          </div>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 text-xs uppercase tracking-[0.32em] text-[oklch(0.65_0.012_70)]"
        >
          Learning · Organization · Governance · Architecture · Navigation
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-balance"
        >
          <span className="sc-shimmer-text">Sistemas digitales</span>
          <br />
          <span className="text-[oklch(0.93_0.012_75)]">
            que aprenden de sus
          </span>{" "}
          <span className="sc-shimmer-text">propios resultados</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[oklch(0.78_0.012_72)]"
        >
          LOGAN coordina{" "}
          <strong className="font-semibold text-[oklch(0.85_0.16_65)]">
            9 agentes de IA
          </strong>{" "}
          para crear, administrar y hacer crecer tu negocio. Cada decisión deja
          una huella; cada resultado, una lección.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#demo"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.62_0.13_35)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.008_60)] shadow-[0_8px_32px_-8px_oklch(0.78_0.16_65/0.55)] transition-transform hover:scale-105"
          >
            Ver demostración
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <a
            href="#servicios"
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.32_0.012_60/70%)] bg-[oklch(0.18_0.012_60/55%)] px-6 py-3 text-sm font-medium text-[oklch(0.93_0.012_75)] backdrop-blur transition-colors hover:border-[oklch(0.78_0.16_65/0.6)] hover:text-[oklch(0.85_0.16_65)]"
          >
            <Waypoints className="size-4 text-[oklch(0.85_0.16_65)]" />
            Servicios
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest text-[oklch(0.55_0.012_70)]"
        >
          <span>· Mr. Trámite</span>
          <span>· Mariscos El Jona</span>
          <span>· Hércules Bro (próximamente)</span>
        </motion.div>
      </div>
    </section>
  );
}
