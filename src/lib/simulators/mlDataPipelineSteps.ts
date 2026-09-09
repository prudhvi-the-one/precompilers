export type PipelineNodeStatus = "pending" | "passed" | "failed" | "blocked";

export type PipelineNode = {
  id: string;
  label: string;
  x: number;
  laneIndex: number;
  dependsOn: string[];
  status: PipelineNodeStatus;
};

export type PipelineStep = {
  nodes: PipelineNode[];
  narration: string;
};

type DataPoint = { x: number; y: number };

// Real raw data with an obvious linear relationship plus real noise.
const RAW_TRAIN: DataPoint[] = [
  { x: 1, y: 3.2 },
  { x: 2, y: 5.1 },
  { x: 3, y: 6.9 },
  { x: 4, y: 9.3 },
  { x: 5, y: 10.8 },
  { x: 6, y: 13.1 },
];
// A real distribution shift relative to training — the validation set's
// underlying trend has genuinely moved, not just noisier versions of train.
const VALIDATION_SET: DataPoint[] = [
  { x: 1.5, y: 6.0 },
  { x: 3.5, y: 12.0 },
  { x: 5.5, y: 19.0 },
];

const MSE_THRESHOLD = 1.0;

function mean(nums: number[]): number {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
function std(nums: number[], m: number): number {
  return Math.sqrt(nums.reduce((s, n) => s + (n - m) ** 2, 0) / nums.length);
}

// Real z-score normalization — genuinely computed from the raw data's own
// mean/std, not hardcoded.
function normalize(points: DataPoint[]): { transformed: DataPoint[]; xMean: number; xStd: number } {
  const xMean = mean(points.map((p) => p.x));
  const xStd = std(points.map((p) => p.x), xMean);
  return {
    transformed: points.map((p) => ({ x: (p.x - xMean) / xStd, y: p.y })),
    xMean,
    xStd,
  };
}

// Real closed-form least-squares linear regression (same approach as Phase
// K's overfittingSteps.ts).
function fitLinearRegression(points: DataPoint[]): (x: number) => number {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return (x: number) => slope * x + intercept;
}

function mse(points: DataPoint[], predict: (x: number) => number): number {
  return points.reduce((s, p) => s + (predict(p.x) - p.y) ** 2, 0) / points.length;
}

function canRun(node: { dependsOn: string[] }, statusById: Map<string, PipelineNodeStatus>): boolean {
  return node.dependsOn.every((id) => statusById.get(id) === "passed");
}

export function generateDataPipelineSteps(): PipelineStep[] {
  const steps: PipelineStep[] = [];
  const statusById = new Map<string, PipelineNodeStatus>();

  const base: Omit<PipelineNode, "status">[] = [
    { id: "extract", label: "Extract", x: 0, laneIndex: 0, dependsOn: [] },
    { id: "transform", label: "Transform", x: 1, laneIndex: 0, dependsOn: ["extract"] },
    { id: "load", label: "Load", x: 2, laneIndex: 0, dependsOn: ["transform"] },
    { id: "train", label: "Train", x: 3, laneIndex: 0, dependsOn: ["load"] },
    { id: "validate", label: "Validate", x: 4, laneIndex: 0, dependsOn: ["train"] },
    { id: "deploy", label: "Deploy", x: 5, laneIndex: 0, dependsOn: ["validate"] },
  ];
  base.forEach((n) => statusById.set(n.id, "pending"));

  function snapshot(narration: string) {
    steps.push({ nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)! })), narration });
  }

  snapshot(`Pipeline queued: extract → transform → load → train → validate → deploy over ${RAW_TRAIN.length} raw rows.`);

  statusById.set("extract", "passed");
  snapshot(`Extract: pulled ${RAW_TRAIN.length} real raw rows.`);

  const { transformed, xMean, xStd } = normalize(RAW_TRAIN);
  statusById.set("transform", "passed");
  snapshot(`Transform: real z-score normalization computed from the raw data (mean=${xMean.toFixed(2)}, std=${xStd.toFixed(2)}).`);

  statusById.set("load", "passed");
  snapshot(`Load: ${transformed.length} normalized rows written to the feature store.`);

  const predict = fitLinearRegression(transformed);
  statusById.set("train", "passed");
  snapshot(`Train: real closed-form linear regression fit on the normalized features.`);

  const normalizedValidation = VALIDATION_SET.map((p) => ({ x: (p.x - xMean) / xStd, y: p.y }));
  const validationMse = mse(normalizedValidation, predict);
  const validationPassed = validationMse <= MSE_THRESHOLD;
  statusById.set("validate", validationPassed ? "passed" : "failed");
  steps.push({
    nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)! })),
    narration: validationPassed
      ? `Validate: real MSE ${validationMse.toFixed(3)} on the held-out validation set — under the ${MSE_THRESHOLD} threshold, passes.`
      : `Validate: real MSE ${validationMse.toFixed(3)} — OVER the ${MSE_THRESHOLD} threshold, fails.`,
  });

  const deployNode = base.find((n) => n.id === "deploy")!;
  const deployAllowed = canRun(deployNode, statusById);
  statusById.set("deploy", deployAllowed ? "passed" : "blocked");
  steps.push({
    nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)! })),
    narration: deployAllowed
      ? "Deploy: Validate passed — the new model deploys."
      : "Deploy BLOCKED — its dependency check found Validate did not pass. The new model never ships.",
  });

  return steps;
}
