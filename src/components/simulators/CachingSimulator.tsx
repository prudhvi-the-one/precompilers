"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateCachingLanes, type CacheEvent } from "@/lib/simulators/cachingSteps";

function outcomeBadge(outcome: CacheEvent["outcome"]) {
  if (outcome === "hit") return { label: "HIT", cls: "bg-success-soft text-success" };
  if (outcome === "miss-eviction") return { label: "MISS (evicted)", cls: "bg-error-soft text-error" };
  return { label: "MISS", cls: "bg-warn-soft text-warn" };
}

function Lane({ name, events, upTo }: { name: string; events: CacheEvent[]; upTo: number }) {
  const visible = events.slice(0, upTo + 1);
  const current = visible[visible.length - 1];
  const totalLatency = visible.reduce((sum, e) => sum + e.latencyMs, 0);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted">
          {current.runningHits} hits / {current.runningMisses} misses &middot; {totalLatency}ms total
        </span>
      </div>
      {current.cacheContents.length > 0 ? (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <span className="text-xs text-ink-faint">cache:</span>
          {current.cacheContents.map((page) => (
            <span key={page} className="rounded-md border border-line bg-surface-sunk px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
              {page}
            </span>
          ))}
        </div>
      ) : null}
      <div className="space-y-1.5">
        {visible.map((e, i) => {
          const badge = outcomeBadge(e.outcome);
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                i === visible.length - 1 ? "bg-surface-sunk" : ""
              }`}
            >
              <span className="font-mono font-semibold text-ink-secondary">
                request: {e.page}
                {e.evicted ? ` (evicted ${e.evicted})` : ""}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-semibold ${badge.cls}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CachingSimulator() {
  const lanes = useMemo(() => generateCachingLanes(), []);
  const totalSteps = lanes.requestSequence.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        8 real page requests over a 4-page working set, racing a real LRU cache (capacity 3) against no cache at all.
      </p>
      <Lane name="No cache" events={lanes.noCache} upTo={step} />
      <Lane name="LRU cache (capacity 3)" events={lanes.cached} upTo={step} />
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
