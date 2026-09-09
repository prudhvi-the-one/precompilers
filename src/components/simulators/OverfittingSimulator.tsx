"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateOverfittingData, type OverfittingData } from "@/lib/simulators/overfittingSteps";

function Lane({
  model,
  upTo,
  isOverfit,
}: {
  model: OverfittingData["models"][number];
  upTo: number;
  isOverfit: boolean;
}) {
  const showTest = upTo >= 1;
  const gap = model.testMse - model.trainMse;
  const flagGap = isOverfit && showTest && gap > 1;

  return (
    <div className={`rounded-xl border p-4 ${flagGap ? "border-error bg-error-soft" : "border-line bg-surface"}`}>
      <div className="mb-2 text-sm font-semibold text-ink">{model.name}</div>
      <div className="flex gap-4">
        <div>
          <div className="text-[10px] uppercase text-ink-faint">Train MSE</div>
          <div className="font-mono text-lg font-bold text-ink">{model.trainMse.toFixed(3)}</div>
        </div>
        {showTest ? (
          <div>
            <div className="text-[10px] uppercase text-ink-faint">Test MSE</div>
            <div className={`font-mono text-lg font-bold ${flagGap ? "text-error" : "text-ink"}`}>{model.testMse.toFixed(3)}</div>
          </div>
        ) : null}
      </div>
      {flagGap ? (
        <p className="mt-2 text-xs font-semibold text-error">
          Near-zero train error but much higher test error — the real overfitting signature.
        </p>
      ) : null}
    </div>
  );
}

export default function OverfittingSimulator() {
  const data = useMemo(() => generateOverfittingData(), []);
  const totalSteps = 2; // step 0: train MSE only, step 1: reveal test MSE
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        Three real, from-scratch models fit to the same noisy training data, then evaluated on held-out test points.
      </p>
      {data.models.map((m) => (
        <Lane key={m.name} model={m} upTo={step} isOverfit={m.name.includes("overfit")} />
      ))}
      <SimulatorControls
        currentStep={step}
        totalSteps={totalSteps}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
