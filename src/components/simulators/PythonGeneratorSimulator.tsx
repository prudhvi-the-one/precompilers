"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateGeneratorSteps, RANGE_N } from "@/lib/simulators/pythonGeneratorSteps";

function ValueChips({ values, placeholderCount }: { values: number[]; placeholderCount: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v, i) => (
        <span key={i} className="rounded-md bg-accent-soft px-2 py-1 font-mono text-xs font-semibold text-accent">
          {v}
        </span>
      ))}
      {Array.from({ length: Math.max(0, placeholderCount - values.length) }).map((_, i) => (
        <span key={`ph-${i}`} className="rounded-md border border-dashed border-line-soft px-2 py-1 font-mono text-xs text-ink-faintest">
          ?
        </span>
      ))}
    </div>
  );
}

export default function PythonGeneratorSimulator() {
  const steps = useMemo(() => generateGeneratorSteps(RANGE_N), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--error)" }} />
          <span className="text-sm font-semibold text-ink">List comprehension</span>
          <code className="ml-auto rounded bg-line-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-faintest">
            [x*x for x in range(5)]
          </code>
        </div>
        <ValueChips values={current.listValues ?? []} placeholderCount={RANGE_N} />
      </div>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          <span className="text-sm font-semibold text-ink">Generator expression</span>
          <code className="ml-auto rounded bg-line-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-faintest">
            (x*x for x in range(5))
          </code>
          {current.generatorExhausted ? (
            <span className="rounded-full bg-error-soft px-2 py-0.5 text-[10px] font-semibold text-error">
              StopIteration
            </span>
          ) : null}
        </div>
        <ValueChips values={current.generatorValues} placeholderCount={RANGE_N} />
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
