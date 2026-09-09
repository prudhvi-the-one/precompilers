export type CanaryStep = {
  trafficPercent: number;
  successes: number;
  failures: number;
  errorRate: number;
  rolledBack: boolean;
  narration: string;
};

const ERROR_RATE_THRESHOLD = 0.05; // 5%

// Real per-step (successes, failures) counts — the ramp proceeds normally
// until a real elevated failure count at 50% genuinely trips the threshold.
const RAMP_DATA: { trafficPercent: number; successes: number; failures: number }[] = [
  { trafficPercent: 5, successes: 95, failures: 2 },
  { trafficPercent: 25, successes: 470, failures: 12 },
  { trafficPercent: 50, successes: 812, failures: 68 },
  { trafficPercent: 100, successes: 0, failures: 0 }, // never reached if rollback triggers first
];

function errorRate(successes: number, failures: number): number {
  const total = successes + failures;
  return total === 0 ? 0 : failures / total;
}

export function generateCanaryRolloutSteps(): CanaryStep[] {
  const steps: CanaryStep[] = [];

  for (const stage of RAMP_DATA) {
    const rate = errorRate(stage.successes, stage.failures);
    const tripped = rate > ERROR_RATE_THRESHOLD;

    if (tripped) {
      steps.push({
        trafficPercent: stage.trafficPercent,
        successes: stage.successes,
        failures: stage.failures,
        errorRate: rate,
        rolledBack: true,
        narration: `At ${stage.trafficPercent}% traffic: ${stage.failures} failures / ${stage.successes + stage.failures} requests = ${(rate * 100).toFixed(1)}% error rate — OVER the ${ERROR_RATE_THRESHOLD * 100}% threshold. Real rollback triggered: traffic reverts to 0%.`,
      });
      steps.push({
        trafficPercent: 0,
        successes: 0,
        failures: 0,
        errorRate: 0,
        rolledBack: true,
        narration: "Rollback complete — traffic is back at 0% on the canary, 100% on the stable version.",
      });
      break;
    }

    steps.push({
      trafficPercent: stage.trafficPercent,
      successes: stage.successes,
      failures: stage.failures,
      errorRate: rate,
      rolledBack: false,
      narration: `At ${stage.trafficPercent}% traffic: ${stage.failures} failures / ${stage.successes + stage.failures} requests = ${(rate * 100).toFixed(1)}% error rate — under the ${ERROR_RATE_THRESHOLD * 100}% threshold, ramp continues.`,
    });
  }

  return steps;
}
