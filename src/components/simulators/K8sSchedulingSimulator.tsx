"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateK8sSchedulingSteps, type NodeCapacity, type Pod } from "@/lib/simulators/k8sSchedulingSteps";

const POD_COLORS: Record<string, string> = {
  "pod-a": "#4f46e5",
  "pod-b": "#0d9488",
  "pod-c": "#e11d48",
  "pod-d": "#b45309",
  "pod-e": "#7c3aed",
  "pod-f": "#16a34a",
};

function NodeCard({ node, pods }: { node: NodeCapacity; pods: Pod[] }) {
  const pct = Math.round((node.cpuUsed / node.cpuCapacity) * 100);
  const onThisNode = pods.filter((p) => p.nodeId === node.id);
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">{node.id}</span>
        <span className="font-mono text-[11px] text-ink-muted">
          {node.cpuUsed}/{node.cpuCapacity} CPU
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-line-soft">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-1">
        {onThisNode.map((p) => (
          <span
            key={p.id}
            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white"
            style={{ backgroundColor: POD_COLORS[p.id] ?? "var(--ink-faint)" }}
          >
            {p.id}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function K8sSchedulingSimulator() {
  const steps = useMemo(() => generateK8sSchedulingSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const pendingPods = current.pods.filter((p) => p.nodeId === null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {current.nodes.map((n) => (
          <NodeCard key={n.id} node={n} pods={current.pods} />
        ))}
      </div>
      {pendingPods.length > 0 ? (
        <div className="rounded-lg bg-warn-soft px-3.5 py-2 text-xs font-semibold text-warn">
          Pending: {pendingPods.map((p) => p.id).join(", ")}
        </div>
      ) : null}
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">{current.narration}</p>
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
