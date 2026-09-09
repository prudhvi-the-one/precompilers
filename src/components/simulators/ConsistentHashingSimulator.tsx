"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateHashRingSteps, type RingNode, type RingKey } from "@/lib/simulators/consistentHashingSteps";

const RADIUS = 90;
const CENTER = 110;

const NODE_COLORS: Record<string, string> = {
  "Node A": "#4f46e5",
  "Node B": "#0d9488",
  "Node C": "#e11d48",
  "Node D": "#b45309",
};

function pointOnRing(position: number) {
  const angle = (position / 360) * 2 * Math.PI - Math.PI / 2;
  return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
}

function Ring({ nodes, keys, remappedKeyIds }: { nodes: RingNode[]; keys: RingKey[]; remappedKeyIds: string[] }) {
  return (
    <svg viewBox="0 0 220 220" className="mx-auto h-64 w-64">
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--line)" strokeWidth={1.5} />
      {nodes.map((n) => {
        const p = pointOnRing(n.position);
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={7} fill={NODE_COLORS[n.id] ?? "var(--accent)"} />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fill="var(--ink-secondary)" fontWeight={700}>
              {n.label}
            </text>
          </g>
        );
      })}
      {keys.map((k) => {
        const p = pointOnRing(k.position);
        const isRemapped = remappedKeyIds.includes(k.id);
        return (
          <g key={k.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill={k.nodeId ? (NODE_COLORS[k.nodeId] ?? "var(--ink-faint)") : "var(--ink-faint)"}
              stroke={isRemapped ? "var(--error)" : "none"}
              strokeWidth={2}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function ConsistentHashingSimulator() {
  const steps = useMemo(() => generateHashRingSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-3">
      <Ring nodes={current.nodes} keys={current.keys} remappedKeyIds={current.remappedKeyIds} />
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">{current.narration}</p>
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 text-xs font-semibold text-ink-faint">KEY ASSIGNMENTS</div>
        <div className="flex flex-wrap gap-1.5">
          {current.keys.map((k) => (
            <span
              key={k.id}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                current.remappedKeyIds.includes(k.id)
                  ? "border-error bg-error-soft text-error"
                  : "border-line bg-surface-sunk text-ink-secondary"
              }`}
            >
              {k.label} &rarr; {k.nodeId ?? "?"}
            </span>
          ))}
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
