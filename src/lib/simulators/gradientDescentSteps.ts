export type GradientStep = {
  step: number;
  x: number;
  loss: number;
  gradient: number;
};

export type GradientScenario = {
  title: string;
  learningRate: number;
  diverged: boolean;
  narration: string;
  steps: GradientStep[];
};

// A real convex loss function and its real derivative — minimum at x=3, loss=2.
function loss(x: number): number {
  return (x - 3) ** 2 + 2;
}
function gradient(x: number): number {
  return 2 * (x - 3);
}

// One real update loop, run under whatever learning rate is passed in.
function runGradientDescent(startX: number, learningRate: number, iterations: number): GradientStep[] {
  const steps: GradientStep[] = [];
  let x = startX;
  for (let i = 0; i <= iterations; i++) {
    const currentLoss = loss(x);
    const currentGradient = gradient(x);
    steps.push({ step: i, x, loss: currentLoss, gradient: currentGradient });
    x = x - learningRate * currentGradient;
  }
  return steps;
}

function isMonotonicNonIncreasing(steps: GradientStep[]): boolean {
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].loss > steps[i - 1].loss + 1e-9) return false;
  }
  return true;
}

export function generateGradientScenarios(): GradientScenario[] {
  const startX = -2;
  const iterations = 8;

  const goodSteps = runGradientDescent(startX, 0.3, iterations);
  const badSteps = runGradientDescent(startX, 1.1, iterations);

  const goodConverged = isMonotonicNonIncreasing(goodSteps) && Math.abs(goodSteps[goodSteps.length - 1].x - 3) < 0.5;
  const badDiverged = badSteps[badSteps.length - 1].loss > badSteps[0].loss;

  return [
    {
      title: "Learning rate 0.3 — converges",
      learningRate: 0.3,
      diverged: !goodConverged,
      narration: `Each step recomputes the real gradient at the current x and moves against it. Loss falls from ${goodSteps[0].loss.toFixed(2)} to ${goodSteps[goodSteps.length - 1].loss.toFixed(2)}, x approaches the true minimum (x=3).`,
      steps: goodSteps,
    },
    {
      title: "Learning rate 1.1 — diverges",
      learningRate: 1.1,
      diverged: badDiverged,
      narration: badDiverged
        ? `The same update rule with too large a step overshoots the minimum every time. Loss grows from ${badSteps[0].loss.toFixed(2)} to ${badSteps[badSteps.length - 1].loss.toFixed(2)} instead of shrinking — a real divergence, not staged.`
        : `Learning rate 1.1 happened not to diverge for this run.`,
      steps: badSteps,
    },
  ];
}
