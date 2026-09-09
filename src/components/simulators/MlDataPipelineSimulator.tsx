"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateDataPipelineSteps, type PipelineNode, type PipelineNodeStatus } from "@/lib/simulators/mlDataPipelineSteps";

const LANE_HEIGHT = 56;
const COL_WIDTH = 92;
const NODE_SIZE = 46;

const STATUS_COLOR: Record<PipelineNodeStatus, string> = {
  pending: "var(--line)",
  passed: "var(--success)",
  failed: "var(--error)",
  blocked: "var(--ink-faint)",
};

export default function MlDataPipelineSimulator() {
  const steps = useMemo(() => generateDataPipelineSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const nodeById = new Map(current.nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...current.nodes.map((n) => n.x), 0);

  function pos(n: PipelineNode) {
    return { left: n.x * COL_WIDTH + 20, top: n.laneIndex * LANE_HEIGHT + 10 };
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Pipeline</span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="relative overflow-x-auto" style={{ height: LANE_HEIGHT + 30 }}>
          <svg className="absolute inset-0" style={{ width: (maxX + 1) * COL_WIDTH + 60, height: "100%", overflow: "visible" }}>
            {current.nodes.flatMap((n) =>
              n.dependsOn.map((depId) => {
                const dep = nodeById.get(depId);
                if (!dep) return null;
                const a = pos(dep);
                const b = pos(n);
                return (
                  <line
                    key={`${depId}-${n.id}`}
                    x1={a.left + NODE_SIZE}
                    y1={a.top + NODE_SIZE / 2}
                    x2={b.left}
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
            return (
              <div key={n.id} className="absolute" style={{ left: p.left, top: p.top }}>
                <div
                  className="flex items-center justify-center rounded-lg px-2 font-mono text-[11px] font-bold text-white"
                  style={{ width: NODE_SIZE + 24, height: NODE_SIZE, backgroundColor: STATUS_COLOR[n.status] }}
                >
                  {n.label}
                </div>
                <p className="mt-1 w-16 text-center text-[10px] uppercase leading-tight text-ink-faint">{n.status}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">{current.narration}</p>
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
