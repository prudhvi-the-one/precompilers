"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateNaiveFibSteps, FIB_N, type RecursionNodeState } from "@/lib/simulators/recursionTree";

const LEVEL_HEIGHT = 58;
const NODE_WIDTH = 52;

const STATE_STYLE: Record<RecursionNodeState, string> = {
  pending: "border border-dashed border-line-soft bg-surface-sunk text-ink-faintest",
  active: "border-2 border-accent bg-accent-soft text-accent",
  done: "border-transparent bg-success-soft text-success",
};

export default function RecursionTreeSimulator() {
  const steps = useMemo(() => generateNaiveFibSteps(FIB_N), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const maxDepth = FIB_N;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Naive recursion: fib({FIB_N})</span>
          <span className="font-mono text-xs text-ink-faint">
            call {current.callCount} &middot; step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="relative overflow-x-auto" style={{ height: (maxDepth + 1) * LEVEL_HEIGHT + 20 }}>
          {current.nodes.map((n) => (
            <div
              key={n.id}
              className="absolute -translate-x-1/2"
              style={{ top: n.depth * LEVEL_HEIGHT, left: `${n.x}%`, width: NODE_WIDTH }}
            >
              <div
                className={`rounded-lg px-1.5 py-1 text-center font-mono text-[11px] font-semibold ${STATE_STYLE[n.state]}`}
              >
                fib({n.n}){n.result !== null ? ` = ${n.result}` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </div>
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
