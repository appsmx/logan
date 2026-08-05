"use client";

import * as React from "react";
import {
  Brain,
  Database,
  Megaphone,
  Code,
  Palette,
  LineChart,
  Coins,
  Scale,
  LifeBuoy,
  Eye,
  ScrollText,
  Cpu,
  Users,
  Lightbulb,
  Gavel,
  Search,
  ShieldCheck,
  BookText,
  Repeat,
  History,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Brain,
  Database,
  Megaphone,
  Code,
  Palette,
  LineChart,
  Coins,
  Scale,
  LifeBuoy,
  Eye,
  ScrollText,
  Cpu,
  Users,
  Lightbulb,
  Gavel,
  Search,
  ShieldCheck,
  BookText,
  Repeat,
  History,
};

export function RoleIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Comp = MAP[name] ?? Brain;
  return <Comp className={className} aria-hidden />;
}
