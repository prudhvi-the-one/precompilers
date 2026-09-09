"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateCanaryRolloutSteps } from "@/lib/simulators/mlCanaryRolloutSteps";

export default function MlCanaryRolloutSimulator() {
  const steps = useMemo(() => generateCanaryRolloutSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-4 ${current.rolledBack ? "border-error bg-error-soft" : "border-line bg-surface"}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Canary traffic</span>
          {current.rolledBack ? (
            <span className="rounded-full bg-error px-2 py-0.5 text-xs font-semibold text-white">ROLLED BACK</span>
          ) : (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">ramping</span>
          )}
        </div>
        <div className="mb-2 h-4 overflow-hidden rounded-full bg-line-soft">
          <div
            className={`h-full rounded-full transition-all ${current.rolledBack ? "bg-error" : "bg-accent"}`}
            style={{ width: `${current.trafficPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-xs text-ink-muted">
          <span>{current.trafficPercent}% traffic</span>
          <span>
            {current.successes + current.failures > 0
              ? `${current.failures}/${current.successes + current.failures} failed (${(current.errorRate * 100).toFixed(1)}%)`
              : ""}
          </span>
        </div>
      </div>
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">{current.narration}</p>
      <SimulatorControls
        currentStep={step}
        totalSteps={steps.length}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
