"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateForwardPassSteps, EDGES, type NnNode } from "@/lib/simulators/nnForwardPassSteps";

const LAYER_X = [30, 140, 250];
const NODE_SIZE = 46;

function nodeY(node: NnNode, countInLayer: number) {
  const spacing = 70;
  const totalHeight = (countInLayer - 1) * spacing;
  return 90 - totalHeight / 2 + node.positionInLayer * spacing;
}

export default function NnForwardPassSimulator() {
  const steps = useMemo(() => generateForwardPassSteps(), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];
  const nodeById = new Map(current.nodes.map((n) => [n.id, n]));
  const countByLayer = [2, 2, 1];

  function pos(node: NnNode) {
    return { x: LAYER_X[node.layer], y: nodeY(node, countByLayer[node.layer]) };
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <svg viewBox="0 0 300 180" className="h-56 w-full">
          {EDGES.map((edge) => {
            const from = nodeById.get(edge.fromId)!;
            const to = nodeById.get(edge.toId)!;
            const a = pos(from);
            const b = pos(to);
            return (
              <line
                key={`${edge.fromId}-${edge.toId}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--line)"
                strokeWidth={1.5}
              />
            );
          })}
          {current.nodes.map((node) => {
            const p = pos(node);
            const isActive = node.id === current.activeNodeId;
            return (
              <g key={node.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_SIZE / 2}
                  fill={isActive ? "var(--accent-soft)" : "var(--surface-sunk)"}
                  stroke={isActive ? "var(--accent)" : "var(--line)"}
                  strokeWidth={2}
                />
                <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--ink-secondary)">
                  {node.label}
                </text>
                <text x={p.x} y={p.y + 10} textAnchor="middle" fontSize="9" fill="var(--ink-muted)">
                  {node.activation !== null ? node.activation.toFixed(3) : "…"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
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
