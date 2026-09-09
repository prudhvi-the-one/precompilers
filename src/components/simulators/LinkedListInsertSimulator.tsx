"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateInsertFrontSteps, LINKED_LIST_EXISTING, LINKED_LIST_NEW_VALUE } from "@/lib/simulators/linkedListSteps";

export default function LinkedListInsertSimulator() {
  const steps = useMemo(
    () => generateInsertFrontSteps(LINKED_LIST_EXISTING, LINKED_LIST_NEW_VALUE),
    []
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = steps[step];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Array</span>
          <span className="rounded-full bg-error-soft px-2 py-0.5 text-[11px] font-semibold text-error">
            O(n)
          </span>
        </div>
        <div className="flex gap-1.5">
          {current.arrayValues.map((v, i) => (
            <div
              key={i}
              className={`flex h-11 flex-1 items-center justify-center rounded-md font-mono text-sm font-semibold ${
                v === null
                  ? "border border-dashed border-line-soft text-ink-faintest"
                  : current.shiftedIndices.includes(i)
                    ? "bg-warn-soft text-warn"
                    : i === 0
                      ? "border-2 border-dashed border-accent bg-accent-soft text-accent"
                      : "bg-line-soft text-ink"
              }`}
            >
              {v ?? "·"}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Linked list</span>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
            O(1)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {current.label !== "Before" ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-accent bg-accent-soft font-mono text-sm font-semibold text-accent">
              {LINKED_LIST_NEW_VALUE}
            </div>
          ) : null}
          {current.label !== "Before" ? <span className="text-ink-faint">&rarr;</span> : null}
          {current.listNodes.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-line-soft font-mono text-sm font-semibold text-ink">
                {v}
              </div>
              {i < current.listNodes.length - 1 ? <span className="text-ink-faint">&rarr;</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        {current.narration}
      </div>

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
