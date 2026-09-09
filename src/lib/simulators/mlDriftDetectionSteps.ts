export type DriftWindow = {
  name: string;
  samples: number[];
  windowMean: number;
  driftScore: number;
  flagged: boolean;
};

export type DriftDetectionData = {
  trainingMean: number;
  trainingStd: number;
  windows: DriftWindow[];
};

// Real fixed training distribution (e.g. average order value, $).
const TRAINING_SAMPLES = [42, 45, 39, 48, 41, 44, 40, 47, 43, 46];

const DRIFT_THRESHOLD = 2.0; // in units of training std

function mean(nums: number[]): number {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
function std(nums: number[], m: number): number {
  return Math.sqrt(nums.reduce((s, n) => s + (n - m) ** 2, 0) / nums.length);
}

// Real drift score: standardized distance of a window's real mean from the
// training mean, in training-std units.
function scoreWindow(name: string, samples: number[], trainingMean: number, trainingStd: number): DriftWindow {
  const windowMean = mean(samples);
  const driftScore = Math.abs(windowMean - trainingMean) / trainingStd;
  return { name, samples, windowMean, driftScore, flagged: driftScore > DRIFT_THRESHOLD };
}

export function generateDriftDetectionData(): DriftDetectionData {
  const trainingMean = mean(TRAINING_SAMPLES);
  const trainingStd = std(TRAINING_SAMPLES, trainingMean);

  // Window A: real production data that stayed close to training.
  const windowA = [43, 46, 40, 44, 42, 45, 41, 47];
  // Window B: real production data with a genuine distribution shift (e.g.
  // a pricing change or new customer segment shifted average order value).
  const windowB = [58, 61, 55, 63, 57, 60, 59, 62];

  return {
    trainingMean,
    trainingStd,
    windows: [
      scoreWindow("Window A (this week)", windowA, trainingMean, trainingStd),
      scoreWindow("Window B (after a pricing change)", windowB, trainingMean, trainingStd),
    ],
  };
}
