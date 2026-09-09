"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import {
  generateBfsSteps,
  GRAPH_NODES,
  GRAPH_EDGES,
  type GraphNodeState,
} from "@/lib/simulators/graphSteps";

const NODE_SIZE = 40;

const STATE_STYLE: Record<GraphNodeState, string> = {
  unvisited: "border border-line bg-surface text-ink-faint",
  frontier: "border-2 border-warn bg-warn-soft text-warn",
  active: "border-2 border-accent bg-accent-soft text-accent",
  visited: "border-transparent bg-success-soft text-success",
};

export default function GraphTraversalSimulator() {
  const steps = useMemo(() => generateBfsSteps("A"), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const nodeById = new Map(GRAPH_NODES.map((n) => [n.id, n]));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Breadth-first search from A</span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="relative" style={{ height: 260 }}>
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {GRAPH_EDGES.map((e, i) => {
              const from = nodeById.get(e.from)!;
              const to = nodeById.get(e.to)!;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--line)"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          {GRAPH_NODES.map((n) => (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${n.y}%`, left: `${n.x}%` }}
            >
              <div
                className={`flex items-center justify-center rounded-full font-mono text-[13px] font-semibold ${STATE_STYLE[current.nodeStates[n.id]]}`}
                style={{ width: NODE_SIZE, height: NODE_SIZE }}
              >
                {n.id}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-faint">Queue:</span>
          {current.queue.length ? (
            current.queue.map((id, i) => (
              <span key={i} className="rounded bg-warn-soft px-1.5 py-0.5 font-mono text-[11px] text-warn">
                {id}
              </span>
            ))
          ) : (
            <span className="text-xs text-ink-faintest">empty</span>
          )}
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
