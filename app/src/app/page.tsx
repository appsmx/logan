"use client";

import * as React from "react";
import { QueryProvider } from "@/lib/query-provider";
import { Header } from "@/components/logan/Header";
import { Sidebar } from "@/components/logan/Sidebar";
import { Footer } from "@/components/logan/Footer";
import { useLoganStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { SIDEBAR_SECTIONS } from "@/lib/logan-os-data";
import { VisionSection } from "@/components/logan/sections/VisionSection";
import { ConstitutionSection } from "@/components/logan/sections/ConstitutionSection";
import { OSSection } from "@/components/logan/sections/OSSection";
import { CoreSection } from "@/components/logan/sections/CoreSection";
import { RolesSection } from "@/components/logan/sections/RolesSection";
import { MemorySection } from "@/components/logan/sections/MemorySection";
import { ChatSection } from "@/components/logan/sections/ChatSection";
import { HypothesesSection } from "@/components/logan/sections/HypothesesSection";
import { MarketingSection } from "@/components/logan/sections/MarketingSection";
import { DecisionsSection } from "@/components/logan/sections/DecisionsSection";
import { DiscoveriesSection } from "@/components/logan/sections/DiscoveriesSection";
import { AuditSection } from "@/components/logan/sections/AuditSection";
import { BibleSection } from "@/components/logan/sections/BibleSection";
import { CycleSection } from "@/components/logan/sections/CycleSection";
import { SessionSection } from "@/components/logan/sections/SessionSection";

const SECTIONS: Record<string, React.ComponentType> = {
  vision: VisionSection,
  constitucion: ConstitutionSection,
  os: OSSection,
  nucleo: CoreSection,
  roles: RolesSection,
  memoria: MemorySection,
  hablar: ChatSection,
  hipotesis: HypothesesSection,
  marketing: MarketingSection,
  decisiones: DecisionsSection,
  descubrimientos: DiscoveriesSection,
  auditoria: AuditSection,
  biblia: BibleSection,
  ciclo: CycleSection,
  sesion: SessionSection,
};

function PageInner() {
  const activeSection = useLoganStore((s) => s.activeSection);
  const Section = SECTIONS[activeSection] ?? VisionSection;
  const meta = SIDEBAR_SECTIONS.find((s) => s.key === activeSection);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <aside className="sticky top-16 hidden max-h-[calc(100vh-4rem)] w-[260px] shrink-0 self-start overflow-y-auto border-r md:block logan-scroll">
          <Sidebar />
        </aside>
        <main
          className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
          aria-labelledby={`sec-${activeSection}`}
        >
          <div className="mx-auto max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Section />
              </motion.div>
            </AnimatePresence>
            <div className="mt-10 text-center text-[11px] text-muted-foreground/60">
              {meta?.label
                ? `LOGAN OS · ${meta.group} · ${meta.label}`
                : "LOGAN OS"}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <QueryProvider>
      <PageInner />
    </QueryProvider>
  );
}
