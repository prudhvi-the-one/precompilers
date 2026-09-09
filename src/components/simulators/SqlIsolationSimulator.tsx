"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateIsolationSteps } from "@/lib/simulators/sqlIsolationSteps";

function Lane({
  name,
  dotColor,
  value,
  dirty,
}: {
  name: string;
  dotColor: string;
  value: number;
  dirty: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${dirty ? "border-error bg-error-soft" : "border-line bg-surface"}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-sm font-semibold text-ink">{name}</span>
        </div>
        {dirty ? (
          <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white">DIRTY READ</span>
        ) : null}
      </div>
      <p className="font-mono text-2xl font-bold text-ink">balance = {value}</p>
      <p className="mt-1 text-xs text-ink-muted">what T1 currently sees</p>
    </div>
  );
}

export default function SqlIsolationSimulator() {
  const steps = useMemo(() => generateIsolationSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <Lane name="READ UNCOMMITTED" dotColor="var(--error)" value={current.uncommittedSees} dirty={current.dirtyRead} />
      <Lane name="READ COMMITTED" dotColor="var(--accent)" value={current.committedSees} dirty={false} />
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
