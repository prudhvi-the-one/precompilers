export type DpRaceStep = {
  k: number;
  naiveCalls: number;
  memoCalls: number;
  narration: string;
  done: boolean;
};

// Larger than FIB_N's tree (which stays visual/readable) — this only tracks
// call counts, so it can afford to go far enough for the exponential-vs-linear
// gap to actually read as dramatic.
export const DP_N = 15;

function naiveFib(k: number, tick: () => void): number {
  tick();
  if (k <= 1) return k;
  return naiveFib(k - 1, tick) + naiveFib(k - 2, tick);
}

function memoFib(k: number, memo: Map<number, number>, tick: () => void): number {
  tick();
  if (k <= 1) return k;
  if (memo.has(k)) return memo.get(k)!;
  const result = memoFib(k - 1, memo, tick) + memoFib(k - 2, memo, tick);
  memo.set(k, result);
  return result;
}

// Real naive-recursive and real memoized fib, each run fresh per k so the
// step-by-step call counts are a fair per-k comparison rather than counts
// accumulated across k's (which would hide the real per-call blowup).
export function generateDpRaceSteps(n: number): DpRaceStep[] {
  const steps: DpRaceStep[] = [];
  for (let k = 0; k <= n; k++) {
    let naiveCalls = 0;
    naiveFib(k, () => naiveCalls++);
    let memoCalls = 0;
    memoFib(k, new Map(), () => memoCalls++);
    steps.push({
      k,
      naiveCalls,
      memoCalls,
      narration: `fib(${k}): naive makes ${naiveCalls} call${naiveCalls === 1 ? "" : "s"}; memoized makes ${memoCalls}.`,
      done: k === n,
    });
  }
  return steps;
}
