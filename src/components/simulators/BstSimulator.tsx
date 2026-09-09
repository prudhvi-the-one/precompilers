"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateBstSteps, BST_INSERT_VALUES, type BstNodeState } from "@/lib/simulators/bstSteps";

const LEVEL_HEIGHT = 66;
const NODE_SIZE = 34;

const STATE_STYLE: Record<BstNodeState, string> = {
  pending: "border border-dashed border-line-soft bg-surface-sunk text-ink-faintest",
  active: "border-2 border-accent bg-accent-soft text-accent",
  settled: "border-transparent bg-line-soft text-ink-secondary",
  visited: "border-transparent bg-success-soft text-success",
};

export default function BstSimulator() {
  const steps = useMemo(() => generateBstSteps(BST_INSERT_VALUES), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const maxDepth = Math.max(...current.nodes.map((n) => n.depth), 0);
  const nodeByValue = new Map(current.nodes.map((n) => [n.value, n]));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            {current.phase === "insert" ? "Building the BST" : "Inorder traversal"}
          </span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="relative" style={{ height: (maxDepth + 1) * LEVEL_HEIGHT + 20 }}>
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            {current.nodes
              .filter((n) => n.parentValue !== null)
              .map((n) => {
                const parent = nodeByValue.get(n.parentValue!);
                if (!parent) return null;
                return (
                  <line
                    key={n.value}
                    x1={`${parent.x}%`}
                    y1={parent.depth * LEVEL_HEIGHT + NODE_SIZE / 2}
                    x2={`${n.x}%`}
                    y2={n.depth * LEVEL_HEIGHT + NODE_SIZE / 2}
                    stroke="var(--line)"
                    strokeWidth={1.5}
                  />
                );
              })}
          </svg>
          {current.nodes.map((n) => (
            <div
              key={n.value}
              className="absolute -translate-x-1/2"
              style={{ top: n.depth * LEVEL_HEIGHT, left: `${n.x}%` }}
            >
              <div
                className={`flex items-center justify-center rounded-full font-mono text-[12px] font-semibold ${STATE_STYLE[n.state]}`}
                style={{ width: NODE_SIZE, height: NODE_SIZE }}
              >
                {n.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </div>
        {current.phase === "traverse" ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-faint">Sorted output:</span>
            {current.traversalSoFar.map((v, i) => (
              <span key={i} className="rounded bg-success-soft px-1.5 py-0.5 font-mono text-[11px] text-success">
                {v}
              </span>
            ))}
          </div>
        ) : null}
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
