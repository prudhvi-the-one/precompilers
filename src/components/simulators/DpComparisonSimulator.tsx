"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateDpRaceSteps, DP_N } from "@/lib/simulators/dpRace";

// Naive calls grow exponentially (thousands by k=15) while memoized calls stay
// near-linear (tens) — a log scale keeps both bars readable on the same axis.
const MAX_LOG = Math.log2(2 ** DP_N);
const barHeight = (calls: number) => Math.round((Math.log2(calls + 1) / MAX_LOG) * 90) + 8;

function Lane({
  name,
  dotColor,
  calls,
  narration,
}: {
  name: string;
  dotColor: string;
  calls: number;
  narration: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-sm font-semibold text-ink">{name}</span>
        </div>
        <span className="font-mono text-xs text-ink-muted">{calls.toLocaleString()} calls</span>
      </div>
      <div className="flex h-24 items-end">
        <div className="w-10 rounded-t" style={{ height: barHeight(calls), backgroundColor: dotColor }} />
      </div>
      <p className="mt-2.5 text-xs text-ink-muted">{narration}</p>
    </div>
  );
}

export default function DpComparisonSimulator() {
  const steps = useMemo(() => generateDpRaceSteps(DP_N), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <Lane
        name="Naive recursive"
        dotColor="var(--error)"
        calls={current.naiveCalls}
        narration={`fib(${current.k}) recomputes every overlapping subproblem from scratch.`}
      />
      <Lane
        name="Memoized (DP)"
        dotColor="var(--accent)"
        calls={current.memoCalls}
        narration={`fib(${current.k}) — each subproblem is solved once and cached.`}
      />
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
