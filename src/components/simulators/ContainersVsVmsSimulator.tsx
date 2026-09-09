"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateContainersVsVmsData, type BootLane } from "@/lib/simulators/containersVsVmsSteps";

function Lane({ name, lane, upTo }: { name: string; lane: BootLane; upTo: number }) {
  const visible = lane.steps.slice(0, upTo + 1);
  const totalMs = visible.reduce((sum, s) => sum + s.durationMs, 0);
  const totalMb = visible.reduce((sum, s) => sum + s.memoryMb, 0);
  const done = upTo >= lane.steps.length - 1;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="font-mono text-xs text-ink-muted">
          {totalMs}ms{done ? " total" : ""} &middot; {totalMb}MB
        </span>
      </div>
      <div className="space-y-1.5">
        {visible.map((s, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
              i === visible.length - 1 ? "bg-surface-sunk text-ink-secondary" : "text-ink-faint"
            }`}
          >
            <span>{s.label}</span>
            <span className="font-mono">+{s.durationMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContainersVsVmsSimulator() {
  const data = useMemo(() => generateContainersVsVmsData(), []);
  const totalSteps = Math.max(data.vm.steps.length, data.container.steps.length);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const vmIndex = Math.min(step, data.vm.steps.length - 1);
  const containerIndex = Math.min(step, data.container.steps.length - 1);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        Real, itemized boot costs — the container lane structurally skips the kernel-boot steps by sharing the host kernel.
      </p>
      <Lane name="Virtual Machine" lane={data.vm} upTo={vmIndex} />
      <Lane name="Container" lane={data.container} upTo={containerIndex} />
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
