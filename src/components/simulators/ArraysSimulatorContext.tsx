"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ArrayOp } from "@/lib/simulators/arrayOpsSteps";
import type { SimTab } from "@/components/learn/paths/SimulateShell";

export type OperationStat = { attempts: number; correct: number; mastered: boolean };

export type ArraysProgressState = {
  simulatorXp: number;
  globalXpEarned: number;
  currentCorrectStreak: number;
  operations: Record<string, OperationStat>;
  quests: {
    firstSteps: boolean;
    allOperationsAttempted: boolean;
    streak: boolean;
    allMastered: boolean;
  };
  rank: string;
};

export type ReplayRequest = {
  op: ArrayOp;
  arr: number[];
  value?: number;
  index?: number;
  nonce: number;
};

type ContextValue = {
  topicId: string;
  progress: ArraysProgressState;
  setProgress: (p: ArraysProgressState) => void;
  replay: ReplayRequest | null;
  requestReplay: (r: Omit<ReplayRequest, "nonce">) => void;
  activeTab: SimTab;
  setActiveTab: (tab: SimTab) => void;
};

const ArraysSimulatorContext = createContext<ContextValue | null>(null);

export function ArraysSimulatorProvider({
  topicId,
  initialProgress,
  children,
}: {
  topicId: string;
  initialProgress: ArraysProgressState;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [replay, setReplay] = useState<ReplayRequest | null>(null);
  const [activeTab, setActiveTab] = useState<SimTab>("simulator");

  // Both state changes happen synchronously inside this one event handler
  // (triggered by a "Try in Simulator" click) — no effect needed to keep
  // them in sync, which is what made the earlier effect-based version fire
  // a lint violation (adjusting state in response to a prop/context change).
  const requestReplay = (r: Omit<ReplayRequest, "nonce">) => {
    setReplay({ ...r, nonce: Date.now() });
    setActiveTab("simulator");
  };

  return (
    <ArraysSimulatorContext.Provider
      value={{ topicId, progress, setProgress, replay, requestReplay, activeTab, setActiveTab }}
    >
      {children}
    </ArraysSimulatorContext.Provider>
  );
}

export function useArraysSimulator() {
  const ctx = useContext(ArraysSimulatorContext);
  if (!ctx) {
    throw new Error("useArraysSimulator must be used within ArraysSimulatorProvider");
  }
  return ctx;
}
