"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateRateLimitLanes, type RateLimitTick } from "@/lib/simulators/apiRateLimitSteps";

function Chip({ tick, isCurrent }: { tick: RateLimitTick; isCurrent: boolean }) {
  const base =
    tick.decision === "accepted"
      ? "bg-success-soft text-success border-success"
      : "bg-error-soft text-error border-error";
  return (
    <span
      className={`rounded-md border px-2 py-1 font-mono text-[11px] font-semibold ${base} ${
        isCurrent ? "ring-2 ring-accent ring-offset-1" : "opacity-70"
      }`}
      title={`req${tick.requestIndex} @${tick.atSecond}s`}
    >
      r{tick.requestIndex}
    </span>
  );
}

function Lane({
  name,
  ticks,
  currentIndex,
  acceptedCount,
}: {
  name: string;
  ticks: RateLimitTick[];
  currentIndex: number;
  acceptedCount: number;
}) {
  const current = ticks[currentIndex];
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted">{acceptedCount}/{ticks.length} accepted so far</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ticks.slice(0, currentIndex + 1).map((t) => (
          <Chip key={t.requestIndex} tick={t} isCurrent={t.requestIndex === currentIndex} />
        ))}
      </div>
      <p className="text-xs text-ink-muted">{current.detail}</p>
    </div>
  );
}

export default function RateLimitSimulator() {
  const lanes = useMemo(() => generateRateLimitLanes(), []);
  const totalSteps = lanes.tokenBucket.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const tokenAccepted = lanes.tokenBucket.slice(0, step + 1).filter((t) => t.decision === "accepted").length;
  const windowAccepted = lanes.fixedWindow.slice(0, step + 1).filter((t) => t.decision === "accepted").length;

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        A burst of 12 requests: 8 arrive in the same instant, then one per second for 4 more seconds.
      </p>
      <Lane name="Token bucket (capacity 5, refills 1/s)" ticks={lanes.tokenBucket} currentIndex={step} acceptedCount={tokenAccepted} />
      <Lane name="Fixed window (6 per 5s window)" ticks={lanes.fixedWindow} currentIndex={step} acceptedCount={windowAccepted} />
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
