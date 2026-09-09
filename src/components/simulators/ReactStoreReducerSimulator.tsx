"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateStoreReducerSteps, type StoreStep } from "@/lib/simulators/reactStoreReducerSteps";

function Lane({ title, steps, upTo }: { title: string; steps: StoreStep[]; upTo: number }) {
  const visible = steps.slice(0, upTo + 1);
  const current = visible[visible.length - 1];

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            current.sameReferenceAsPrev ? "bg-error-soft text-error" : "bg-success-soft text-success"
          }`}
        >
          prevState === newState: {String(current.sameReferenceAsPrev)}
        </span>
      </div>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {current.state.items.map((item, i) => (
          <span key={i} className="rounded-md border border-line bg-surface-sunk px-2 py-1 font-mono text-[11px] text-ink-secondary">
            {item.label} (${item.price})
          </span>
        ))}
        {current.state.items.length === 0 ? <span className="text-xs text-ink-faint">empty cart</span> : null}
      </div>
      <div className="mb-2 font-mono text-xs text-ink-muted">total: ${current.state.total}</div>
      <div className="space-y-1">
        {visible.map((s, i) => (
          <div key={i} className={`rounded-lg px-3 py-1.5 text-xs ${i === visible.length - 1 ? "bg-surface-sunk text-ink-secondary" : "text-ink-faint"}`}>
            {s.narration}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReactStoreReducerSimulator() {
  const data = useMemo(() => generateStoreReducerSteps(), []);
  const totalSteps = data.reducer.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        Identical actions (add apple, add banana, remove apple) dispatched to a pure reducer vs. a direct-mutation anti-pattern.
      </p>
      <Lane title="Pure reducer (returns a new object)" steps={data.reducer} upTo={step} />
      <Lane title="Direct mutation (returns the same object)" steps={data.mutation} upTo={step} />
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
