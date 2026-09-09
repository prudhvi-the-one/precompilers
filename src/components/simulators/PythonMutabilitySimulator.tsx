"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateMutabilitySteps, type MutabilityStep } from "@/lib/simulators/pythonMutabilitySteps";

const OBJECT_COLORS = ["var(--accent-soft)", "#fde68a", "#bbf7d0", "#fbcfe8"];

function Lane({ name, dotColor, step }: { name: string; dotColor: string; step: MutabilityStep }) {
  const colorByObjectId = new Map(step.laneObjects.map((o, i) => [o.id, OBJECT_COLORS[i % OBJECT_COLORS.length]]));

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            step.done ? "bg-success-soft text-success" : "bg-warn-soft text-warn"
          }`}
        >
          {step.done ? "DONE" : "RUNNING"}
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        {step.laneVars.map((v) => {
          const obj = step.laneObjects.find((o) => o.id === v.objectId)!;
          return (
            <div key={v.name} className="flex flex-col items-center gap-1">
              <span className="rounded-md border border-line bg-surface-sunk px-2.5 py-1 font-mono text-xs font-semibold text-ink-secondary">
                {v.name}
              </span>
              <span className="text-ink-faintest">↓</span>
              <span
                className="rounded-lg px-3 py-1.5 font-mono text-xs text-ink"
                style={{ backgroundColor: colorByObjectId.get(v.objectId) }}
              >
                {obj.display}
                <span className="ml-1.5 text-[10px] text-ink-faint">{obj.id}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-muted">{step.narration}</p>
    </div>
  );
}

export default function PythonMutabilitySimulator() {
  const { mutable, immutable } = useMemo(() => generateMutabilitySteps(), []);
  const totalSteps = Math.max(mutable.length, immutable.length);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const mStep = mutable[Math.min(step, mutable.length - 1)];
  const iStep = immutable[Math.min(step, immutable.length - 1)];

  return (
    <div className="space-y-3">
      <Lane name="Mutable — list" dotColor="var(--error)" step={mStep} />
      <Lane name="Immutable — tuple" dotColor="var(--accent)" step={iStep} />
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
