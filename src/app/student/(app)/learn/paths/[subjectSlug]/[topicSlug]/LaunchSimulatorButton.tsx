"use client";

import type { ReactNode } from "react";
import { useGoToSimulate } from "./SimulateStepContext";

export default function LaunchSimulatorButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const goToSimulate = useGoToSimulate();
  return (
    <button type="button" onClick={goToSimulate} className={className}>
      {children}
    </button>
  );
}
