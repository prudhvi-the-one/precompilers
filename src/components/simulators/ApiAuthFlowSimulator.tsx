"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateAuthFlowSteps, type AuthActor } from "@/lib/simulators/apiAuthFlowSteps";

const ACTORS: AuthActor[] = ["User", "Client App", "Auth Server", "Resource Server"];

function ActorCard({ actor, active }: { actor: AuthActor; active: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition-colors ${
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface-sunk text-ink-faint"
      }`}
    >
      {actor}
    </div>
  );
}

export default function ApiAuthFlowSimulator() {
  const steps = useMemo(() => generateAuthFlowSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {ACTORS.map((actor) => (
          <ActorCard key={actor} actor={actor} active={current.actor === actor} />
        ))}
      </div>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{current.action}</span>
          {current.done ? (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
              flow complete
            </span>
          ) : null}
        </div>
        {current.payload ? (
          <dl className="mb-3 space-y-1 rounded-lg bg-surface-sunk p-3 font-mono text-xs text-ink-secondary">
            {Object.entries(current.payload).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-ink-faint">{key}:</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="text-sm text-ink-muted">{current.narration}</p>
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
