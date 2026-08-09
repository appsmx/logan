"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ROLES, type Role } from "@/lib/logan-os-data";
import {
  Brain, Database, Megaphone, Code, Palette, LineChart,
  Coins, Scale, LifeBuoy,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Brain, Database, Megaphone, Code, Palette, LineChart, Coins, Scale, LifeBuoy,
};

function roleColor(role: Role): { ring: string; bg: string; text: string; glow: string } {
  // Map role.color token to specific warm accents — no indigo, no blue.
  switch (role.color) {
    case "primary":
      return {
        ring: "ring-[oklch(0.78_0.16_65/0.5)]",
        bg: "bg-gradient-to-br from-[oklch(0.78_0.16_65/0.18)] to-[oklch(0.55_0.14_35/0.10)]",
        text: "text-[oklch(0.85_0.16_65)]",
        glow: "shadow-[0_0_24px_-4px_oklch(0.78_0.16_65/0.6)]",
      };
    case "success":
      return {
        ring: "ring-[oklch(0.7_0.14_155/0.5)]",
        bg: "bg-gradient-to-br from-[oklch(0.7_0.14_155/0.18)] to-[oklch(0.5_0.12_140/0.10)]",
        text: "text-[oklch(0.78_0.14_155)]",
        glow: "shadow-[0_0_24px_-4px_oklch(0.7_0.14_155/0.5)]",
      };
    case "warning":
      return {
        ring: "ring-[oklch(0.78_0.15_65/0.5)]",
        bg: "bg-gradient-to-br from-[oklch(0.78_0.15_65/0.18)] to-[oklch(0.6_0.13_45/0.10)]",
        text: "text-[oklch(0.85_0.15_65)]",
        glow: "shadow-[0_0_24px_-4px_oklch(0.78_0.15_65/0.5)]",
      };
    case "destructive":
      return {
        ring: "ring-[oklch(0.7_0.19_25/0.5)]",
        bg: "bg-gradient-to-br from-[oklch(0.7_0.19_25/0.18)] to-[oklch(0.55_0.18_20/0.10)]",
        text: "text-[oklch(0.78_0.18_25)]",
        glow: "shadow-[0_0_24px_-4px_oklch(0.7_0.19_25/0.5)]",
      };
    default:
      return {
        ring: "ring-[oklch(0.55_0.012_70/0.4)]",
        bg: "bg-gradient-to-br from-[oklch(0.28_0.012_60/0.4)] to-[oklch(0.22_0.012_60/0.2)]",
        text: "text-[oklch(0.78_0.012_72)]",
        glow: "shadow-[0_0_24px_-4px_oklch(0.55_0.012_70/0.4)]",
      };
  }
}

const CORE = ROLES.find((r) => r.key === "core")!;
const ORBITERS = ROLES.filter((r) => r.key !== "core");

export function EcosystemDiagram() {
  const [active, setActive] = React.useState<Role | null>(null);

  // Mobile fallback: orbit is hard on small screens. Show grid instead.
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="ecosistema"
      className="sc-section relative px-4 py-20 sm:py-28"
      aria-labelledby="ecosistema-title"
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
            El ecosistema
          </p>
          <h2
            id="ecosistema-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-[oklch(0.93_0.012_75)]"
          >
            9 roles coordinados,
            <br />
            <span className="sc-shimmer-text">una sola voz</span>
          </h2>
          <p className="mt-5 text-base text-[oklch(0.78_0.012_72)]">
            LOGAN Core no ejecuta trabajo especializado: delega. Cada rol tiene
            una responsabilidad clara y deja constancia de sus decisiones.
          </p>
        </motion.div>

        {/* Orbit diagram (desktop) / Grid (mobile) */}
        {isMobile ? (
          <MobileGrid onHover={setActive} />
        ) : (
          <OrbitDiagram active={active} setActive={setActive} />
        )}

        {/* Active role detail */}
        <motion.div
          key={active?.key ?? "none"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8 sc-glass rounded-2xl p-5 sm:p-6 min-h-[120px]"
        >
          {active ? (
            <RoleDetail role={active} />
          ) : (
            <div className="text-center text-sm text-[oklch(0.65_0.012_70)] py-2">
              Pasa el cursor sobre cualquier rol para ver su responsabilidad.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function OrbitDiagram({
  active,
  setActive,
}: {
  active: Role | null;
  setActive: (r: Role | null) => void;
}) {
  return (
    <div className="relative mx-auto mt-12 aspect-square max-h-[480px] w-full max-w-[480px]">
      {/* Orbit rings */}
      <div className="absolute inset-0 rounded-full border border-[oklch(0.32_0.012_60/40%)]" />
      <div className="absolute inset-[8%] rounded-full border border-[oklch(0.32_0.012_60/30%)]" />
      <div className="absolute inset-[18%] rounded-full border border-[oklch(0.32_0.012_60/20%)]" />

      {/* Animated center pulse ring */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          boxShadow: [
            "0 0 0 0 oklch(0.78 0.16 65 / 0.4)",
            "0 0 0 32px oklch(0.78 0.16 65 / 0)",
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />

      {/* Center node (Core) */}
      <button
        type="button"
        onMouseEnter={() => setActive(CORE)}
        onMouseLeave={() => setActive(null)}
        onFocus={() => setActive(CORE)}
        onBlur={() => setActive(null)}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        aria-label={`${CORE.name} — ${CORE.tagline}`}
      >
        <div className="sc-pulse-glow flex size-24 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]">
          <Brain className="size-7 text-[oklch(0.14_0.008_60)]" />
          <span className="mt-1 font-serif text-xs text-[oklch(0.14_0.008_60)]">
            Core
          </span>
        </div>
      </button>

      {/* Orbiting roles */}
      {ORBITERS.map((role, i) => {
        const angle = (i / ORBITERS.length) * 360;
        const Icon = ICONS[role.icon] ?? Brain;
        const c = roleColor(role);
        const isActive = active?.key === role.key;
        return (
          <div
            key={role.key}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `rotate(${angle}deg) translate(180px) rotate(${-angle}deg)`,
            }}
          >
            <button
              type="button"
              onMouseEnter={() => setActive(role)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(role)}
              onBlur={() => setActive(null)}
              className={`-translate-x-1/2 -translate-y-1/2 flex size-14 items-center justify-center rounded-xl ring-1 ${c.ring} ${c.bg} ${c.text} ${c.glow} transition-transform hover:scale-110 ${
                isActive ? "scale-110" : ""
              }`}
              aria-label={`${role.name} — ${role.tagline}`}
              title={role.name}
            >
              <Icon className="size-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MobileGrid({
  onHover,
}: {
  onHover: (r: Role | null) => void;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-3">
      <button
        type="button"
        onMouseEnter={() => onHover(CORE)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(CORE)}
        onBlur={() => onHover(null)}
        className="col-span-2 flex items-center gap-3 rounded-xl sc-glass p-4 text-left"
      >
        <div className="sc-pulse-glow flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.78_0.16_65)] to-[oklch(0.55_0.14_35)]">
          <Brain className="size-5 text-[oklch(0.14_0.008_60)]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[oklch(0.93_0.012_75)]">
            {CORE.name}
          </div>
          <div className="text-xs text-[oklch(0.65_0.012_70)]">{CORE.tagline}</div>
        </div>
      </button>
      {ORBITERS.map((role) => {
        const Icon = ICONS[role.icon] ?? Brain;
        const c = roleColor(role);
        return (
          <button
            key={role.key}
            type="button"
            onMouseEnter={() => onHover(role)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(role)}
            onBlur={() => onHover(null)}
            className={`flex items-center gap-3 rounded-xl sc-glass p-3 text-left ring-1 ${c.ring}`}
          >
            <div className={`flex size-9 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-[oklch(0.93_0.012_75)]">
                {role.name}
              </div>
              <div className="text-[10px] text-[oklch(0.65_0.012_70)]">
                {role.status === "activo" ? "Activo" : "Planificado"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RoleDetail({ role }: { role: Role }) {
  const Icon = ICONS[role.icon] ?? Brain;
  const c = roleColor(role);
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text} ring-1 ${c.ring}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-lg text-[oklch(0.93_0.012_75)]">
            {role.name}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
              role.status === "activo"
                ? "bg-[oklch(0.7_0.14_155/0.18)] text-[oklch(0.78_0.14_155)]"
                : "bg-[oklch(0.28_0.012_60/50%)] text-[oklch(0.65_0.012_70)]"
            }`}
          >
            {role.status === "activo" ? "Activo" : "Planificado"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[oklch(0.55_0.012_70)]">
            {role.kind === "sistema" ? "Sistema" : "Especialista"}
          </span>
        </div>
        <p className="mt-1 text-sm italic text-[oklch(0.78_0.012_72)]">
          {role.tagline}
        </p>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[oklch(0.78_0.012_72)]">
          {role.responsibilities.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-0.5 text-[oklch(0.78_0.16_65)]">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
