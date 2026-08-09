"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { href: "#ecosistema", label: "Ecosistema" },
  { href: "#diferenciador", label: "Diferenciador" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#demo", label: "Demo" },
  { href: "#contacto", label: "Contacto" },
];

export function ShowcaseNav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "sc-glass border-b border-[oklch(0.32_0.012_60/55%)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="#top"
          className="group flex items-center gap-3"
          aria-label="LOGAN — inicio"
        >
          <motion.div
            aria-hidden
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.62_0.13_35)] shadow-[0_0_24px_oklch(0.78_0.16_65/0.45)]"
          >
            <span className="font-serif text-xl leading-none text-[oklch(0.16_0.008_60)]">
              L
            </span>
          </motion.div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-serif text-lg tracking-tight text-[oklch(0.93_0.012_75)]">
              LOGAN
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.65_0.012_70)]">
              Corp
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-[oklch(0.78_0.012_72)] transition-colors hover:text-[oklch(0.85_0.16_65)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center text-xs text-[oklch(0.65_0.012_70)] hover:text-[oklch(0.85_0.16_65)] transition-colors"
          >
            App LOGAN OS
          </Link>
          <a
            href="#contacto"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.62_0.13_35)] px-4 py-2 text-sm font-medium text-[oklch(0.16_0.008_60)] shadow-[0_4px_24px_-4px_oklch(0.78_0.16_65/0.5)] transition-transform hover:scale-105"
          >
            <Sparkles className="size-3.5" />
            Hablar con LOGAN
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden border-t border-[oklch(0.28_0.012_60/40%)] bg-[oklch(0.14_0.008_60/85%)] backdrop-blur">
        <div className="flex overflow-x-auto px-2 py-2 gap-1 logan-scroll">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs text-[oklch(0.78_0.012_72)] hover:bg-[oklch(0.28_0.012_60/40%)] hover:text-[oklch(0.85_0.16_65)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
