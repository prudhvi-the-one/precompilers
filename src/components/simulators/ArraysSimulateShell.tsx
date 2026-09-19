"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";
import SimulateShell from "@/components/learn/paths/SimulateShell";
import { useArraysSimulator } from "@/components/simulators/ArraysSimulatorContext";

// Thin Arrays-specific wrapper around the generic SimulateShell: reads
// active-tab state from the shared context (so a "Try in Simulator" click
// from Challenges can switch this shell to the Simulator tab), and forces
// the Simulator content to remount on each new replay request (via `key`)
// so it can pick up the replay scenario from a lazy useState initializer
// instead of an effect — the shell itself stays fully topic-agnostic.
export default function ArraysSimulateShell({
  simulatorContent,
  challengesContent,
  progressContent,
}: {
  simulatorContent: ReactNode;
  challengesContent: ReactNode;
  progressContent: ReactNode;
}) {
  const { replay, activeTab, setActiveTab } = useArraysSimulator();

  const keyedSimulatorContent = isValidElement(simulatorContent)
    ? cloneElement(simulatorContent, { key: replay?.nonce ?? "default" })
    : simulatorContent;

  return (
    <SimulateShell
      simulatorContent={keyedSimulatorContent}
      challengesContent={challengesContent}
      progressContent={progressContent}
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
    />
  );
}
