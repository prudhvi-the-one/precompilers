"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateCapLanes, type CapStep, type NodeState } from "@/lib/simulators/capTheoremSteps";

function NodeCard({ node, rejected }: { node: NodeState; rejected: boolean }) {
  return (
    <div
      className={`flex-1 rounded-lg border px-3 py-3 text-center ${
        node.reachableMajority ? "border-line bg-surface-sunk" : "border-warn bg-warn-soft"
      }`}
    >
      <div className="text-xs font-semibold text-ink-faint">{node.id}</div>
      <div className="mt-1 font-mono text-lg font-bold text-ink">{node.value ?? "?"}</div>
      {rejected ? <div className="mt-1 text-[10px] font-semibold text-error">WRITE REJECTED</div> : null}
    </div>
  );
}

function Lane({ title, steps, upTo }: { title: string; steps: CapStep[]; upTo: number }) {
  const current = steps[upTo];
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{title}</span>
        {current.diverged ? (
          <span className="rounded-full bg-error-soft px-2 py-0.5 text-xs font-semibold text-error">diverged</span>
        ) : (
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">consistent</span>
        )}
      </div>
      <div className="flex gap-3">
        <NodeCard node={current.nodeA} rejected={false} />
        <NodeCard node={current.nodeB} rejected={current.writeRejected} />
      </div>
      <p className="mt-2.5 text-xs text-ink-muted">{current.narration}</p>
    </div>
  );
}

export default function CapTheoremSimulator() {
  const lanes = useMemo(() => generateCapLanes(), []);
  const totalSteps = lanes.cp.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <Lane title="CP — consistency over availability" steps={lanes.cp} upTo={step} />
      <Lane title="AP — availability over consistency" steps={lanes.ap} upTo={step} />
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
