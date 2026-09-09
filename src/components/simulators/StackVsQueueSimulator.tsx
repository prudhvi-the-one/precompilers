"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateBracketScanSteps, BRACKET_TOKENS } from "@/lib/simulators/stackQueueSteps";

export default function StackVsQueueSimulator() {
  const steps = useMemo(() => generateBracketScanSteps(BRACKET_TOKENS), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = steps[step];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Scanning
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BRACKET_TOKENS.map((tok, i) => (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-md font-mono text-sm font-semibold ${
                i === current.tokenIndex
                  ? "border-2 border-accent bg-accent-soft text-accent"
                  : i < current.tokenIndex
                    ? "bg-line-soft text-ink-muted"
                    : "border border-line-soft text-ink-faintest"
              }`}
            >
              {tok}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl border-2 p-4 ${current.stackValid ? "border-success" : "border-error"}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Stack (LIFO)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                current.stackValid ? "bg-success-soft text-success" : "bg-error-soft text-error"
              }`}
            >
              {current.stackValid ? "VALID" : "INVALID"}
            </span>
          </div>
          <div className="flex h-28 flex-col-reverse gap-1.5">
            {current.stackContents.map((tok, i) => (
              <div
                key={i}
                className="flex h-8 items-center justify-center rounded-md bg-line-soft font-mono text-sm font-semibold text-ink"
              >
                {tok}
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl border-2 p-4 ${current.queueValid ? "border-success" : "border-error"}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Queue (FIFO)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                current.queueValid ? "bg-success-soft text-success" : "bg-error-soft text-error"
              }`}
            >
              {current.queueValid ? "VALID" : "WRONG MATCH"}
            </span>
          </div>
          <div className="flex h-28 flex-col gap-1.5">
            {current.queueContents.map((tok, i) => (
              <div
                key={i}
                className="flex h-8 items-center justify-center rounded-md bg-line-soft font-mono text-sm font-semibold text-ink"
              >
                {tok}
              </div>
            ))}
          </div>
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
