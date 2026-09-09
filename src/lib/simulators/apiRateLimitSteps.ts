export type RateLimitDecision = "accepted" | "rejected";

export type RateLimitTick = {
  requestIndex: number;
  atSecond: number;
  decision: RateLimitDecision;
  detail: string;
};

export type RateLimitLanes = {
  tokenBucket: RateLimitTick[];
  fixedWindow: RateLimitTick[];
};

// A burst of 12 requests: 8 arrive in the first second (a real spike), then
// one every second for 4 more seconds — chosen because it straddles a
// fixed-window boundary (window = 5s) while a token bucket only cares about
// its own refill rate, not wall-clock window edges.
const ARRIVALS: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4];

function runTokenBucket(arrivals: number[]): RateLimitTick[] {
  const capacity = 5;
  const refillPerSecond = 1;
  let tokens = capacity;
  let lastRefillSecond = 0;
  const ticks: RateLimitTick[] = [];

  arrivals.forEach((atSecond, i) => {
    const elapsed = atSecond - lastRefillSecond;
    if (elapsed > 0) {
      tokens = Math.min(capacity, tokens + elapsed * refillPerSecond);
      lastRefillSecond = atSecond;
    }
    if (tokens >= 1) {
      tokens -= 1;
      ticks.push({
        requestIndex: i,
        atSecond,
        decision: "accepted",
        detail: `${tokens.toFixed(0)}/${capacity} tokens left after this request`,
      });
    } else {
      ticks.push({
        requestIndex: i,
        atSecond,
        decision: "rejected",
        detail: `bucket empty (0/${capacity} tokens)`,
      });
    }
  });

  return ticks;
}

function runFixedWindow(arrivals: number[]): RateLimitTick[] {
  const windowSeconds = 5;
  const limitPerWindow = 6;
  let windowStart = 0;
  let countInWindow = 0;
  const ticks: RateLimitTick[] = [];

  arrivals.forEach((atSecond, i) => {
    if (atSecond >= windowStart + windowSeconds) {
      windowStart = Math.floor(atSecond / windowSeconds) * windowSeconds;
      countInWindow = 0;
    }
    if (countInWindow < limitPerWindow) {
      countInWindow += 1;
      ticks.push({
        requestIndex: i,
        atSecond,
        decision: "accepted",
        detail: `${countInWindow}/${limitPerWindow} used in window [${windowStart}s-${windowStart + windowSeconds}s)`,
      });
    } else {
      ticks.push({
        requestIndex: i,
        atSecond,
        decision: "rejected",
        detail: `window [${windowStart}s-${windowStart + windowSeconds}s) already at ${limitPerWindow}/${limitPerWindow}`,
      });
    }
  });

  return ticks;
}

export function generateRateLimitLanes(): RateLimitLanes {
  return {
    tokenBucket: runTokenBucket(ARRIVALS),
    fixedWindow: runFixedWindow(ARRIVALS),
  };
}
