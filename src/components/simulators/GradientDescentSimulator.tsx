"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateGradientScenarios, type GradientScenario } from "@/lib/simulators/gradientDescentSteps";

const WIDTH = 280;
const HEIGHT = 160;
const X_MIN = -8;
const X_MAX = 12;
const Y_MIN = 0;
const Y_MAX = 60;

function toSvgX(x: number) {
  return ((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
}
function toSvgY(y: number) {
  return HEIGHT - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;
}

function curvePath() {
  const points: string[] = [];
  for (let x = X_MIN; x <= X_MAX; x += 0.5) {
    const y = (x - 3) ** 2 + 2;
    if (y > Y_MAX) continue;
    points.push(`${toSvgX(x)},${toSvgY(y)}`);
  }
  return `M ${points.join(" L ")}`;
}

function Lane({ scenario, upTo }: { scenario: GradientScenario; upTo: number }) {
  const visibleSteps = scenario.steps.slice(0, upTo + 1);
  const current = visibleSteps[visibleSteps.length - 1];

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{scenario.title}</span>
        {scenario.diverged ? (
          <span className="rounded-full bg-error-soft px-2 py-0.5 text-xs font-semibold text-error">diverging</span>
        ) : (
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">converging</span>
        )}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mb-2 h-32 w-full rounded-lg bg-surface-sunk">
        <path d={curvePath()} fill="none" stroke="var(--line)" strokeWidth={2} />
        {visibleSteps.map((s, i) => {
          const cx = toSvgX(Math.max(X_MIN, Math.min(X_MAX, s.x)));
          const cy = toSvgY(Math.max(Y_MIN, Math.min(Y_MAX, s.loss)));
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === visibleSteps.length - 1 ? 5 : 2.5}
              fill={i === visibleSteps.length - 1 ? "var(--accent)" : "var(--ink-faint)"}
            />
          );
        })}
      </svg>
      <div className="font-mono text-xs text-ink-muted">
        step {current.step} &middot; x={current.x.toFixed(3)} &middot; loss={current.loss.toFixed(3)} &middot; gradient={current.gradient.toFixed(3)}
      </div>
    </div>
  );
}

export default function GradientDescentSimulator() {
  const scenarios = useMemo(() => generateGradientScenarios(), []);
  const totalSteps = Math.max(...scenarios.map((s) => s.steps.length));
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        {scenarios[0].narration}
      </p>
      <Lane scenario={scenarios[0]} upTo={Math.min(step, scenarios[0].steps.length - 1)} />
      <Lane scenario={scenarios[1]} upTo={Math.min(step, scenarios[1].steps.length - 1)} />
      <SimulatorControls
        currentStep={step}
        totalSteps={totalSteps}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
