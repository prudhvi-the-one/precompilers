"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateDriftDetectionData, type DriftWindow, type DriftDetectionData } from "@/lib/simulators/mlDriftDetectionSteps";

function Lane({ window, training, revealed }: { window: DriftWindow; training: DriftDetectionData; revealed: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        revealed && window.flagged ? "border-error bg-error-soft" : "border-line bg-surface"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{window.name}</span>
        {revealed ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              window.flagged ? "bg-error text-white" : "bg-success-soft text-success"
            }`}
          >
            {window.flagged ? "DRIFT FLAGGED" : "no drift"}
          </span>
        ) : null}
      </div>
      {revealed ? (
        <>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {window.samples.map((s, i) => (
              <span key={i} className="rounded-md border border-line bg-surface-sunk px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
                {s}
              </span>
            ))}
          </div>
          <div className="font-mono text-xs text-ink-muted">
            window mean {window.windowMean.toFixed(2)} vs. training mean {training.trainingMean.toFixed(2)} &middot; drift score {window.driftScore.toFixed(2)} (std units)
          </div>
        </>
      ) : (
        <p className="text-xs text-ink-faint">not yet observed</p>
      )}
    </div>
  );
}

export default function MlDriftDetectionSimulator() {
  const data = useMemo(() => generateDriftDetectionData(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const totalSteps = data.windows.length + 1; // step 0: baseline only, then one reveal per window

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        Training distribution: mean {data.trainingMean.toFixed(2)}, std {data.trainingStd.toFixed(2)}. Each window&apos;s real drift score is a standardized distance from that mean.
      </p>
      {data.windows.map((w, i) => (
        <Lane key={w.name} window={w} training={data} revealed={step > i} />
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
