"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateCommitGraphSteps, GIT_OPERATIONS, type GitCommitNode } from "@/lib/simulators/gitCommitGraph";

const LANE_HEIGHT = 56;
const COL_WIDTH = 84;
const NODE_SIZE = 34;

const BRANCH_COLOR: Record<string, string> = {
  main: "var(--accent)",
  feature: "var(--success)",
};

export default function GitCommitGraphSimulator() {
  const steps = useMemo(() => generateCommitGraphSteps(GIT_OPERATIONS), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const nodeById = new Map(current.nodes.map((n) => [n.id, n]));
  const maxLane = Math.max(...current.nodes.map((n) => n.laneIndex), 0);
  const maxX = Math.max(...current.nodes.map((n) => n.x), 0);

  function pos(n: GitCommitNode) {
    return { left: n.x * COL_WIDTH + 20, top: n.laneIndex * LANE_HEIGHT + 10 };
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Commit graph</span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="relative overflow-x-auto" style={{ height: (maxLane + 1) * LANE_HEIGHT + 30 }}>
          <svg className="absolute inset-0" style={{ width: (maxX + 1) * COL_WIDTH + 40, height: "100%", overflow: "visible" }}>
            {current.nodes.flatMap((n) =>
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
                  />
                );
              })
            )}
          </svg>
          {current.nodes.map((n) => {
            const p = pos(n);
            const isLatest = n.id === current.nodes[current.nodes.length - 1].id;
            return (
              <div key={n.id} className="absolute" style={{ left: p.left, top: p.top }}>
                <div
                  className="flex items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
                  style={{
                    width: NODE_SIZE,
                    height: NODE_SIZE,
                    backgroundColor: BRANCH_COLOR[n.branch] ?? "var(--ink-faint)",
                    boxShadow: isLatest ? "0 0 0 3px var(--accent-soft)" : undefined,
                  }}
                >
                  {n.id}
                </div>
                <p className="mt-1 w-20 -translate-x-1/4 text-center text-[10px] leading-tight text-ink-faint">
                  {n.message}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </p>
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
