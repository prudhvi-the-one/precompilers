"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { TREE, generateRerenderScenarios, type RerenderState } from "@/lib/simulators/reactRerenderTreeSteps";

function nodeState(id: string, state: RerenderState): "dirty" | "bailed" | "idle" {
  if (state.dirtyIds.includes(id)) return "dirty";
  if (state.bailedOutIds.includes(id)) return "bailed";
  return "idle";
}

function TreeNodeView({ id, depth, state }: { id: string; depth: number; state: RerenderState }) {
  const node = TREE[id];
  const status = nodeState(id, state);
  const colorClass =
    status === "dirty"
      ? "border-accent bg-accent-soft text-accent"
      : status === "bailed"
        ? "border-warn bg-warn-soft text-warn"
        : "border-line bg-surface-sunk text-ink-faint";

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className={`mb-1.5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${colorClass}`}>
        {node.label}
        {status === "dirty" ? <span className="text-[10px] uppercase">re-rendered</span> : null}
        {status === "bailed" ? <span className="text-[10px] uppercase">bailed out</span> : null}
      </div>
      {status !== "bailed"
        ? node.children.map((childId) => <TreeNodeView key={childId} id={childId} depth={depth + 1} state={state} />)
        : null}
    </div>
  );
}

export default function ReactRerenderTreeSimulator() {
  const scenarios = useMemo(() => generateRerenderScenarios(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = scenarios[step];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2.5 text-sm font-semibold text-ink">{current.title}</div>
        <TreeNodeView id="App" depth={0} state={current.state} />
      </div>
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">{current.narration}</p>
      <SimulatorControls
        currentStep={step}
        totalSteps={scenarios.length}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
