"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateMergeRebaseSteps, type MergeRebaseNode } from "@/lib/simulators/gitMergeRebase";

const COL_WIDTH = 64;
const LANE_HEIGHT = 50;
const NODE_SIZE = 30;

const BRANCH_COLOR: Record<string, string> = {
  main: "var(--accent)",
  feature: "var(--success)",
};

function nodeLane(n: MergeRebaseNode): number {
  // Merge commits sit between the two lanes they join; everything else uses
  // its own branch's lane.
  if (n.id === "M") return 0.5;
  return n.branch === "main" ? 0 : 1;
}

function MiniGraph({ name, nodes, dotColor }: { name: string; nodes: MergeRebaseNode[]; dotColor: string }) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...nodes.map((n) => n.x), 0);

  function pos(n: MergeRebaseNode) {
    return { left: n.x * COL_WIDTH + 16, top: nodeLane(n) * LANE_HEIGHT + 10 };
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="ml-auto rounded bg-line-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-faintest">
          {nodes.filter((n) => !n.abandoned).length} commits
        </span>
      </div>
      <div className="relative overflow-x-auto" style={{ height: LANE_HEIGHT * 2 + 20 }}>
        <svg className="absolute inset-0" style={{ width: (maxX + 1) * COL_WIDTH + 30, height: "100%", overflow: "visible" }}>
          {nodes.flatMap((n) =>
            n.parentIds.map((pid) => {
              const parent = nodeById.get(pid);
              if (!parent) return null;
              const a = pos(parent);
              const b = pos(n);
              return (
                <line
                  key={`${pid}-${n.id}`}
                  x1={a.left + NODE_SIZE / 2}
                  y1={a.top + NODE_SIZE / 2}
                  x2={b.left + NODE_SIZE / 2}
                  y2={b.top + NODE_SIZE / 2}
                  stroke="var(--line)"
                  strokeWidth={1.5}
                  strokeDasharray={n.abandoned ? "3,3" : undefined}
                />
              );
            })
          )}
        </svg>
        {nodes.map((n) => {
          const p = pos(n);
          return (
            <div key={n.id} className="absolute" style={{ left: p.left, top: p.top, opacity: n.abandoned ? 0.35 : 1 }}>
              <div
                className="flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  backgroundColor: n.id === "M" ? "var(--error)" : BRANCH_COLOR[n.branch] ?? "var(--ink-faint)",
                  border: n.abandoned ? "1px dashed var(--ink-faint)" : undefined,
                }}
              >
                {n.id}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GitMergeRebaseSimulator() {
  const steps = useMemo(() => generateMergeRebaseSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <MiniGraph name="MERGE" nodes={current.mergeNodes} dotColor="var(--error)" />
      <MiniGraph name="REBASE" nodes={current.rebaseNodes} dotColor="var(--accent)" />
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
