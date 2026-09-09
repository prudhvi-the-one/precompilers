"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateListKeysSteps, type ReconciledSlot } from "@/lib/simulators/reactListKeysSteps";

const NODE_COLORS = ["#4f46e5", "#0d9488", "#e11d48"];

function Lane({ title, slots, mismatchIds }: { title: string; slots: ReconciledSlot[]; mismatchIds: string[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 text-sm font-semibold text-ink">{title}</div>
      <div className="space-y-1.5">
        {slots.map((slot) => {
          const isMismatch = mismatchIds.includes(slot.itemId);
          return (
            <div
              key={slot.itemId}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                isMismatch ? "border-error bg-error-soft" : "border-line bg-surface-sunk"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[(slot.domNode.nodeRef - 1) % NODE_COLORS.length] }}
                />
                <span className="font-semibold text-ink-secondary">{slot.itemLabel}</span>
                <span className="font-mono text-[10px] text-ink-faint">node#{slot.domNode.nodeRef}</span>
              </div>
              <span className={`font-mono ${isMismatch ? "text-error" : "text-ink-muted"}`}>
                &quot;{slot.domNode.localValue}&quot;
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReactListKeysSimulator() {
  const steps = useMemo(() => generateListKeysSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <Lane title="Keyed by id (key={item.id})" slots={current.keyed} mismatchIds={[]} />
      <Lane title="Keyed by index (key={index})" slots={current.indexed} mismatchIds={current.mismatchIds} />
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
