"use client";

import { Fragment, useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateConflictSteps, BASE, OURS, THEIRS, type LineDecision } from "@/lib/simulators/gitConflictSteps";

const DECISION_STYLE: Record<LineDecision, string> = {
  unchanged: "bg-surface-sunk text-ink-faint",
  "ours-only": "bg-accent-soft text-accent",
  "theirs-only": "bg-success-soft text-success",
  "both-same": "bg-success-soft text-success",
  conflict: "bg-error-soft text-error",
};

const DECISION_LABEL: Record<LineDecision, string> = {
  unchanged: "unchanged",
  "ours-only": "ours only",
  "theirs-only": "theirs only",
  "both-same": "both, identical",
  conflict: "CONFLICT",
};

export default function GitConflictSimulator() {
  const steps = useMemo(() => generateConflictSteps(BASE, OURS, THEIRS), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Three-way merge, line by line</span>
          <span className="font-mono text-xs text-ink-faint">
            line {step + 1} of {steps.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
          <p className="text-[10px] font-semibold text-ink-faint">BASE</p>
          <p className="text-[10px] font-semibold text-ink-faint">OURS</p>
          <p className="text-[10px] font-semibold text-ink-faint">THEIRS</p>
          {BASE.map((line, i) => {
            const isCurrent = i === current.lineIndex;
            const decision = i <= current.lineIndex ? steps[i].decision : null;
            return (
              <Fragment key={i}>
                <span
                  key={`base-${i}`}
                  className={`rounded px-2 py-1 ${isCurrent ? "ring-2 ring-accent" : ""} ${
                    decision ? DECISION_STYLE[decision] : "text-ink-faintest"
                  }`}
                >
                  {line}
                </span>
                <span
                  key={`ours-${i}`}
                  className={`rounded px-2 py-1 ${isCurrent ? "ring-2 ring-accent" : ""} ${
                    decision ? DECISION_STYLE[decision] : "text-ink-faintest"
                  }`}
                >
                  {OURS[i]}
                </span>
                <span
                  key={`theirs-${i}`}
                  className={`rounded px-2 py-1 ${isCurrent ? "ring-2 ring-accent" : ""} ${
                    decision ? DECISION_STYLE[decision] : "text-ink-faintest"
                  }`}
                >
                  {THEIRS[i]}
                </span>
              </Fragment>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <p className="flex-1 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
            {current.narration}
          </p>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${DECISION_STYLE[current.decision]}`}>
            {DECISION_LABEL[current.decision]}
          </span>
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
