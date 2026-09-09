"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateIdempotencyLanes, type IdempotencyLane } from "@/lib/simulators/apiIdempotencySteps";

function Lane({ name, lane, upTo }: { name: string; lane: IdempotencyLane; upTo: number }) {
  const visible = lane.events.slice(0, upTo + 1);
  const current = visible[visible.length - 1];
  const resourceCount = current.resourceCount;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted">{resourceCount} resource{resourceCount === 1 ? "" : "s"} created</span>
      </div>
      <div className="mb-3 flex gap-1.5">
        {Array.from({ length: resourceCount }).map((_, i) => (
          <span key={i} className="h-8 w-8 rounded-lg bg-accent-soft" />
        ))}
      </div>
      <div className="space-y-1.5">
        {visible.map((event, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-xs ${
              i === visible.length - 1 ? "bg-surface-sunk text-ink-secondary" : "text-ink-faint"
            }`}
          >
            <div className="font-mono font-semibold">{event.requestLabel}</div>
            <div className="mt-0.5">{event.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApiIdempotencySimulator() {
  const lanes = useMemo(() => generateIdempotencyLanes(), []);
  const totalSteps = lanes.withoutKey.events.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        A client POSTs a charge, the response is lost to a timeout, and the client retries the identical request.
      </p>
      <Lane name="Without an idempotency key" lane={lanes.withoutKey} upTo={step} />
      <Lane name="With an idempotency key" lane={lanes.withKey} upTo={step} />
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
