"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateMergeSortTreeSteps, type TreeNodeState } from "@/lib/simulators/mergeSortTree";
import { RACE_INPUT } from "@/lib/simulators/sortSteps";

const NODE_WIDTH = 100;
const LEVEL_HEIGHT = 76;

type Position = { lo: number; hi: number; top: number; left: number };

function computeLayout(n: number): Position[] {
  const positions: Position[] = [];
  const maxLevel = Math.log2(n);
  (function place(lo: number, hi: number, level: number) {
    const centerFraction = (lo + hi) / (2 * n);
    positions.push({ lo, hi, top: level * LEVEL_HEIGHT, left: centerFraction * 100 });
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    place(lo, mid, level + 1);
    place(mid, hi, level + 1);
  })(0, n, 0);
  void maxLevel;
  return positions;
}

const STATE_STYLE: Record<TreeNodeState, string> = {
  done: "border-transparent bg-success-soft text-success",
  active: "border-2 border-accent bg-accent-soft text-accent",
  pending: "border border-dashed border-line-soft bg-surface-sunk text-ink-faintest",
};

export default function MergeSortTreeSimulator() {
  const steps = useMemo(() => generateMergeSortTreeSteps(RACE_INPUT), []);
  const positions = useMemo(() => computeLayout(RACE_INPUT.length), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const nodeByKey = new Map(current.treeNodes.map((n) => [`${n.lo}-${n.hi}`, n]));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Merge sort recursion tree</span>
          <span className="font-mono text-xs text-ink-faint">
            merge {step + 1} of {steps.length} &middot; {current.comparisons} comparisons
          </span>
        </div>
        <div className="relative" style={{ height: (Math.log2(RACE_INPUT.length) + 1) * LEVEL_HEIGHT + 30 }}>
          {positions.map((pos) => {
            const node = nodeByKey.get(`${pos.lo}-${pos.hi}`);
            if (!node) return null;
            return (
              <div
                key={`${pos.lo}-${pos.hi}`}
                className="absolute -translate-x-1/2"
                style={{ top: pos.top, left: `${pos.left}%`, width: NODE_WIDTH }}
              >
                <div
                  className={`rounded-lg px-2 py-1.5 text-center font-mono text-[11px] font-semibold ${STATE_STYLE[node.state]}`}
                >
                  {node.label}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.activeMergeDescription}
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
