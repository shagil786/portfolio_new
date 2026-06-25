"use client";

import { create } from "zustand";
import type { MissionId } from "@/data/portfolioData";

export type ThemeName = "green" | "purple" | "blue";

interface GameState {
  // Boot / phase
  booted: boolean;
  setBooted: (v: boolean) => void;

  // Recruiter mode (clean resume view)
  recruiterMode: boolean;
  toggleRecruiter: () => void;

  // Theme
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  cycleTheme: () => void;

  // Sound
  muted: boolean;
  toggleMute: () => void;

  // Low-end / reduced 3D mode
  lowPower: boolean;
  setLowPower: (v: boolean) => void;
  toggleLowPower: () => void;

  // Progress (XP)
  xp: number;
  addXp: (amount: number) => void;

  // Missions unlocked
  unlocked: Record<MissionId, boolean>;
  unlockMission: (id: MissionId) => void;
  unlockAll: () => void;

  // Achievements
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;

  // Command palette
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  // Active section (for minimap)
  activeSection: MissionId | "hero";
  setActiveSection: (s: MissionId | "hero") => void;
}

const allMissions: MissionId[] = [
  "identity",
  "experience",
  "skills",
  "projects",
  "achievements",
  "contact",
];

const initialUnlocked = allMissions.reduce(
  (acc, id) => ({ ...acc, [id]: false }),
  {} as Record<MissionId, boolean>
);

export const useGameStore = create<GameState>()((set, get) => ({
  booted: false,
  setBooted: (v) => set({ booted: v }),

  recruiterMode: false,
  toggleRecruiter: () => set((s) => ({ recruiterMode: !s.recruiterMode })),

  theme: "green",
  setTheme: (t) => set({ theme: t }),
  cycleTheme: () =>
    set((s) => ({
      theme: s.theme === "green" ? "purple" : s.theme === "purple" ? "blue" : "green",
    })),

  muted: true, // start muted; user opts in to sound
  toggleMute: () => set((s) => ({ muted: !s.muted })),

  lowPower: false,
  setLowPower: (v) => set({ lowPower: v }),
  toggleLowPower: () => set((s) => ({ lowPower: !s.lowPower })),

  xp: 0,
  addXp: (amount) => set((s) => ({ xp: Math.min(100, s.xp + amount) })),

  unlocked: { ...initialUnlocked },
  unlockMission: (id) =>
    set((s) => {
      if (s.unlocked[id]) return s;
      return { unlocked: { ...s.unlocked, [id]: true } };
    }),
  unlockAll: () =>
    set(() => ({
      unlocked: allMissions.reduce(
        (acc, id) => ({ ...acc, [id]: true }),
        {} as Record<MissionId, boolean>
      ),
      xp: 100,
    })),

  unlockedAchievements: [],
  unlockAchievement: (id) =>
    set((s) =>
      s.unlockedAchievements.includes(id)
        ? s
        : { unlockedAchievements: [...s.unlockedAchievements, id] }
    ),

  paletteOpen: false,
  setPaletteOpen: (v) => set({ paletteOpen: v }),

  activeSection: "hero",
  setActiveSection: (sec) => {
    const cur = get().activeSection;
    if (cur !== sec) set({ activeSection: sec });
  },
}));

export const MISSION_ORDER = allMissions;
