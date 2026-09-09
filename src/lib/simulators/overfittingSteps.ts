export type DataPoint = { x: number; y: number };

export type ModelResult = {
  name: string;
  predict: (x: number) => number;
  trainMse: number;
  testMse: number;
};

export type OverfittingData = {
  train: DataPoint[];
  test: DataPoint[];
  models: { name: string; trainMse: number; testMse: number; trainPredictions: number[]; testPredictions: number[] }[];
};

// A real underlying relationship (a shallow curve) plus real, fixed noise —
// not Math.random(), so the fixture is reproducible and inspectable.
function trueFn(x: number): number {
  return 2 + 0.5 * x + 0.1 * x * x;
}

const TRAIN_NOISE = [2.5, -2.0, 2.8, -2.5, 2.2, -2.6, 2.4, -2.1];
const TRAIN_X = [0, 1, 2, 3, 4, 5, 6, 7];
const TRAIN: DataPoint[] = TRAIN_X.map((x, i) => ({ x, y: trueFn(x) + TRAIN_NOISE[i] }));

// Held-out points at different x positions than any training point.
const TEST_NOISE = [-0.3, 0.4, -0.5, 0.3];
const TEST_X = [0.5, 2.5, 4.5, 6.5];
const TEST: DataPoint[] = TEST_X.map((x, i) => ({ x, y: trueFn(x) + TEST_NOISE[i] }));

function mse(points: DataPoint[], predict: (x: number) => number): number {
  const sumSq = points.reduce((sum, p) => sum + (predict(p.x) - p.y) ** 2, 0);
  return sumSq / points.length;
}

// Model 1: constant — predicts the training mean. Genuinely underfits any
// real relationship in the data.
function buildConstantModel(train: DataPoint[]): (x: number) => number {
  const mean = train.reduce((sum, p) => sum + p.y, 0) / train.length;
  return () => mean;
}

// Model 2: linear regression via real closed-form least squares.
function buildLinearModel(train: DataPoint[]): (x: number) => number {
  const n = train.length;
  const sumX = train.reduce((s, p) => s + p.x, 0);
  const sumY = train.reduce((s, p) => s + p.y, 0);
  const sumXY = train.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = train.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return (x: number) => slope * x + intercept;
}

// Model 3: 1-nearest-neighbor — memorizes training points, the real proxy
// for overfitting.
function buildNearestNeighborModel(train: DataPoint[]): (x: number) => number {
  return (x: number) => {
    let closest = train[0];
    let closestDist = Math.abs(x - train[0].x);
    for (const p of train) {
      const dist = Math.abs(x - p.x);
      if (dist < closestDist) {
        closest = p;
        closestDist = dist;
      }
    }
    return closest.y;
  };
}

export function generateOverfittingData(): OverfittingData {
  const models = [
    { name: "Constant (underfit)", predict: buildConstantModel(TRAIN) },
    { name: "Linear regression (good fit)", predict: buildLinearModel(TRAIN) },
    { name: "1-Nearest-Neighbor (overfit)", predict: buildNearestNeighborModel(TRAIN) },
  ];

  return {
    train: TRAIN,
    test: TEST,
    models: models.map((m) => ({
      name: m.name,
      trainMse: mse(TRAIN, m.predict),
      testMse: mse(TEST, m.predict),
      trainPredictions: TRAIN.map((p) => m.predict(p.x)),
      testPredictions: TEST.map((p) => m.predict(p.x)),
    })),
  };
}
