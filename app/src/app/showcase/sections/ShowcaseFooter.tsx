"use client";

import * as React from "react";
import Link from "next/link";
import { Github, BookOpen, Waypoints, ArrowUpRight } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5215512345678?text=Hola%20LOGAN%2C%20quiero%20una%20demostraci%C3%B3n%20completa";
const EMAIL_URL = "mailto:hola@logancorp.mx";

const FOOTER_LINKS = [
  {
    label: "Constitución",
    href: "https://github.com/appsmx/logan",
    external: true,
    icon: BookOpen,
  },
  {
    label: "Roles",
    href: "/#top",
    external: false,
    icon: Waypoints,
  },
  {
    label: "GitHub",
    href: "https://github.com/appsmx/logan",
    external: true,
    icon: Github,
  },
];

export function ShowcaseFooter() {
  return (
    <footer className="border-t border-[oklch(0.28_0.012_60/55%)] bg-[oklch(0.10_0.006_60)] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Top — brand + monogram + tagline */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]"
                aria-hidden
              >
                <span className="font-serif text-xl leading-none text-[oklch(0.14_0.008_60)]">
                  L
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-lg text-[oklch(0.93_0.012_75)]">
                  LOGAN
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.012_70)]">
                  Corp
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[oklch(0.65_0.012_70)]">
              Learning, Organization, Governance, Architecture &amp; Navigation.
              Metodología para diseñar y desarrollar productos digitales
              asistidos por IA — y un sistema operativo que la hace real.
            </p>
          </div>

          {/* Links column */}
          <nav
            className="flex flex-col gap-2"
            aria-label="Enlaces del pie de página"
          >
            <span className="text-[10px] uppercase tracking-widest text-[oklch(0.55_0.012_70)] mb-1">
              Enlaces
            </span>
            {FOOTER_LINKS.map((l) => {
              const Icon = l.icon;
              const content = (
                <>
                  <Icon className="size-3.5 text-[oklch(0.85_0.16_65)]" />
                  {l.label}
                  {l.external && (
                    <ArrowUpRight className="size-3 ml-0.5 opacity-60" />
                  )}
                </>
              );
              const cls =
                "inline-flex items-center gap-1.5 text-sm text-[oklch(0.78_0.012_72)] hover:text-[oklch(0.85_0.16_65)] transition-colors";
              return l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cls}
                >
                  {content}
                </a>
              ) : (
                <Link key={l.label} href={l.href} className={cls}>
                  {content}
                </Link>
              );
            })}
            {/* Contact line */}
            <a
              href={EMAIL_URL}
              className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.78_0.012_72)] hover:text-[oklch(0.85_0.16_65)] transition-colors"
            >
              hola@logancorp.mx
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.78_0.012_72)] hover:text-[oklch(0.85_0.16_65)] transition-colors"
            >
              WhatsApp
            </a>
          </nav>

          {/* App link */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[oklch(0.55_0.012_70)] mb-1">
              App interna
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.78_0.012_72)] hover:text-[oklch(0.85_0.16_65)] transition-colors"
            >
              LOGAN OS — App
              <ArrowUpRight className="size-3 ml-0.5 opacity-60" />
            </Link>
            <p className="text-xs text-[oklch(0.55_0.012_70)] max-w-[200px] leading-relaxed">
              El sistema operativo completo está disponible para clientes y
              equipo interno.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="sc-gradient-divider my-8" />

        {/* Bottom — copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[oklch(0.55_0.012_70)]">
          <span>
            © {new Date().getFullYear()} LOGAN Corp. Todos los derechos
            reservados.
          </span>
          <span className="italic">
            Cada decisión deja una huella. Cada resultado, una lección.
          </span>
        </div>
      </div>
    </footer>
  );
}
