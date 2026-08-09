"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, ArrowRight } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5215512345678?text=Hola%20LOGAN%2C%20quiero%20digitalizar%20mi%20negocio";
const EMAIL_URL =
  "mailto:hola@logancorp.mx?subject=Quiero%20digitalizar%20mi%20negocio";

export function FinalCTA() {
  return (
    <section
      id="contacto"
      className="sc-section relative px-4 py-20 sm:py-32"
      aria-labelledby="contacto-title"
    >
      {/* Background warm radial */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 50%, oklch(0.22 0.018 50 / 0.7) 0%, oklch(0.12 0.008 60) 70%)",
          }}
        />
        <div className="sc-grid-bg opacity-60" />
        <div
          className="sc-orb"
          style={{
            width: 520,
            height: 520,
            top: "20%",
            left: "30%",
            background:
              "radial-gradient(circle, oklch(0.78 0.16 65 / 0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        {/* Monogram */}
        <div className="mx-auto mb-8 flex size-16 items-center justify-center">
          <div
            className="sc-pulse-glow relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]"
            aria-hidden
          >
            <span className="font-serif text-4xl leading-none text-[oklch(0.14_0.008_60)]">
              L
            </span>
          </div>
        </div>

        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[oklch(0.65_0.012_70)]">
          Contacto
        </p>
        <h2
          id="contacto-title"
          className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-[oklch(0.93_0.012_75)]"
        >
          ¿Listo para
          <br />
          <span className="sc-shimmer-text">digitalizar tu negocio?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-[oklch(0.78_0.012_72)]">
          Una conversación es suficiente. LOGAN entra en modo exploración,
          formula las preguntas justas y diseña el camino. Tú aportas la visión;
          nosotros, la ejecución coordinada y el aprendizaje continuo.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.008_60)] shadow-[0_8px_32px_-8px_oklch(0.78_0.16_65/0.6)] transition-transform hover:scale-105"
          >
            <MessageCircle className="size-4" />
            WhatsApp
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href={EMAIL_URL}
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.32_0.012_60/70%)] bg-[oklch(0.18_0.012_60/55%)] px-6 py-3 text-sm font-medium text-[oklch(0.93_0.012_75)] backdrop-blur transition-colors hover:border-[oklch(0.78_0.16_65/0.6)] hover:text-[oklch(0.85_0.16_65)]"
          >
            <Mail className="size-4 text-[oklch(0.85_0.16_65)]" />
            hola@logancorp.mx
          </a>
        </div>

        {/* Reassurance line */}
        <p className="mt-8 text-xs text-[oklch(0.55_0.012_70)]">
          Respondemos en menos de 24 horas hábiles. Sin compromiso.
        </p>
      </motion.div>
    </section>
  );
}
