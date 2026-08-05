"use client";

import { create } from "zustand";

type LoganState = {
  activeProjectId: string | null;
  activeSection: string;
  setActiveProjectId: (id: string | null) => void;
  setActiveSection: (section: string) => void;
};

export const useLoganStore = create<LoganState>((set) => ({
  activeProjectId: null,
  activeSection: "vision",
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveSection: (section) => set({ activeSection: section }),
}));
