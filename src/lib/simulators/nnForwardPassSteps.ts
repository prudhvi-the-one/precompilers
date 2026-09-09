export type NnNode = {
  id: string;
  label: string;
  layer: number;
  positionInLayer: number;
  weightedSum: number | null;
  activation: number | null;
};

export type NnEdge = { fromId: string; toId: string; weight: number };

export type NnForwardStep = {
  activeNodeId: string | null;
  nodes: NnNode[];
  narration: string;
};

function relu(x: number): number {
  return Math.max(0, x);
}
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// Fixed real weights/biases for a tiny 2 -> 2(ReLU) -> 1(sigmoid) network.
const INPUT = [0.6, 0.9];
const W_H1 = { in1: 0.5, in2: -0.3, bias: 0.1 };
const W_H2 = { in1: -0.4, in2: 0.8, bias: -0.05 };
const W_OUT = { h1: 0.7, h2: 0.6, bias: 0.2 };

export const EDGES: NnEdge[] = [
  { fromId: "in1", toId: "h1", weight: W_H1.in1 },
  { fromId: "in2", toId: "h1", weight: W_H1.in2 },
  { fromId: "in1", toId: "h2", weight: W_H2.in1 },
  { fromId: "in2", toId: "h2", weight: W_H2.in2 },
  { fromId: "h1", toId: "out", weight: W_OUT.h1 },
  { fromId: "h2", toId: "out", weight: W_OUT.h2 },
];

export function generateForwardPassSteps(): NnForwardStep[] {
  const nodes: Record<string, NnNode> = {
    in1: { id: "in1", label: "x1", layer: 0, positionInLayer: 0, weightedSum: null, activation: INPUT[0] },
    in2: { id: "in2", label: "x2", layer: 0, positionInLayer: 1, weightedSum: null, activation: INPUT[1] },
    h1: { id: "h1", label: "h1 (ReLU)", layer: 1, positionInLayer: 0, weightedSum: null, activation: null },
    h2: { id: "h2", label: "h2 (ReLU)", layer: 1, positionInLayer: 1, weightedSum: null, activation: null },
    out: { id: "out", label: "y (sigmoid)", layer: 2, positionInLayer: 0, weightedSum: null, activation: null },
  };

  const steps: NnForwardStep[] = [];

  function snapshot(activeNodeId: string | null, narration: string) {
    steps.push({
      activeNodeId,
      nodes: Object.values(nodes).map((n) => ({ ...n })),
      narration,
    });
  }

  snapshot(null, `Input vector: x1=${INPUT[0]}, x2=${INPUT[1]}.`);

  const h1Sum = INPUT[0] * W_H1.in1 + INPUT[1] * W_H1.in2 + W_H1.bias;
  const h1Act = relu(h1Sum);
  nodes.h1.weightedSum = h1Sum;
  nodes.h1.activation = h1Act;
  snapshot("h1", `h1: weighted sum = (${INPUT[0]}×${W_H1.in1}) + (${INPUT[1]}×${W_H1.in2}) + ${W_H1.bias} = ${h1Sum.toFixed(3)} → ReLU → ${h1Act.toFixed(3)}.`);

  const h2Sum = INPUT[0] * W_H2.in1 + INPUT[1] * W_H2.in2 + W_H2.bias;
  const h2Act = relu(h2Sum);
  nodes.h2.weightedSum = h2Sum;
  nodes.h2.activation = h2Act;
  snapshot("h2", `h2: weighted sum = (${INPUT[0]}×${W_H2.in1}) + (${INPUT[1]}×${W_H2.in2}) + ${W_H2.bias} = ${h2Sum.toFixed(3)} → ReLU → ${h2Act.toFixed(3)}.`);

  const outSum = h1Act * W_OUT.h1 + h2Act * W_OUT.h2 + W_OUT.bias;
  const outAct = sigmoid(outSum);
  nodes.out.weightedSum = outSum;
  nodes.out.activation = outAct;
  snapshot("out", `output: weighted sum = (${h1Act.toFixed(3)}×${W_OUT.h1}) + (${h2Act.toFixed(3)}×${W_OUT.h2}) + ${W_OUT.bias} = ${outSum.toFixed(3)} → sigmoid → ${outAct.toFixed(4)}.`);

  return steps;
}
