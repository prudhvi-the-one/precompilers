"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateDecoratorSteps, type DecoratorFrameState } from "@/lib/simulators/pythonDecoratorSteps";

const STATE_STYLE: Record<DecoratorFrameState, string> = {
  active: "border-2 border-accent bg-accent-soft text-accent",
  waiting: "border-transparent bg-line-soft text-ink-secondary",
};

export default function PythonDecoratorSimulator() {
  const steps = useMemo(() => generateDecoratorSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Call stack: @decorator_a @decorator_b def greet()</span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length} &middot; max depth {current.maxDepthSoFar}
          </span>
        </div>
        <div className="flex min-h-[168px] flex-col-reverse items-stretch justify-start gap-1.5 rounded-lg bg-surface-sunk p-3">
          {current.stack.length === 0 ? (
            <p className="text-center text-xs text-ink-faintest">call stack empty</p>
          ) : (
            current.stack.map((frame, i) => (
              <div
                key={`${frame.id}-${i}`}
                className={`rounded-lg px-3 py-2 text-center font-mono text-xs font-semibold ${STATE_STYLE[frame.state]}`}
              >
                {frame.label}
              </div>
            ))
          )}
        </div>
        <p className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </p>
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
