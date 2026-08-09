"use client";

import * as React from "react";
import { ShowcaseNav } from "./sections/ShowcaseNav";
import { Hero } from "./sections/Hero";
import { EcosystemDiagram } from "./sections/EcosystemDiagram";
import { HypothesisLoop } from "./sections/HypothesisLoop";
import { Services } from "./sections/Services";
import { Projects } from "./sections/Projects";
import { LimitedChat } from "./sections/LimitedChat";
import { HowItWorks } from "./sections/HowItWorks";
import { FinalCTA } from "./sections/FinalCTA";
import { ShowcaseFooter } from "./sections/ShowcaseFooter";

export default function ShowcasePage() {
  React.useEffect(() => {
    // Smooth scroll behavior for in-page navigation
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="showcase-shell min-h-screen flex flex-col">
      <ShowcaseNav />
      <main className="flex-1 relative overflow-hidden">
        <Hero />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <EcosystemDiagram />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <HypothesisLoop />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <Services />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <Projects />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <LimitedChat />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <HowItWorks />
        <div className="sc-gradient-divider mx-auto max-w-5xl" />
        <FinalCTA />
      </main>
      <ShowcaseFooter />
    </div>
  );
}
