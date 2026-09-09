export type CacheEvent = {
  page: string;
  lane: "no-cache" | "cached";
  outcome: "miss" | "hit" | "miss-eviction";
  latencyMs: number;
  cacheContents: string[];
  evicted: string | null;
  runningHits: number;
  runningMisses: number;
};

export type CachingLanes = {
  noCache: CacheEvent[];
  cached: CacheEvent[];
  requestSequence: string[];
};

const BACKEND_LATENCY_MS = 100;
const CACHE_LATENCY_MS = 5;
const CAPACITY = 3;

// A working set of 4 distinct pages over a capacity-3 cache, with enough
// repeats and revisits to force real evictions and real repeat misses.
const REQUEST_SEQUENCE = ["home", "profile", "settings", "home", "billing", "home", "profile", "home"];

function runNoCache(sequence: string[]): CacheEvent[] {
  const hits = 0;
  let misses = 0;
  return sequence.map((page) => {
    misses += 1;
    return {
      page,
      lane: "no-cache" as const,
      outcome: "miss" as const,
      latencyMs: BACKEND_LATENCY_MS,
      cacheContents: [],
      evicted: null,
      runningHits: hits,
      runningMisses: misses,
    };
  });
}

function runLru(sequence: string[]): CacheEvent[] {
  const cache: string[] = []; // front = most recently used
  let hits = 0;
  let misses = 0;
  const events: CacheEvent[] = [];

  for (const page of sequence) {
    const idx = cache.indexOf(page);
    if (idx !== -1) {
      cache.splice(idx, 1);
      cache.unshift(page);
      hits += 1;
      events.push({
        page,
        lane: "cached",
        outcome: "hit",
        latencyMs: CACHE_LATENCY_MS,
        cacheContents: [...cache],
        evicted: null,
        runningHits: hits,
        runningMisses: misses,
      });
      continue;
    }

    misses += 1;
    let evicted: string | null = null;
    if (cache.length >= CAPACITY) {
      evicted = cache.pop()!; // least recently used, at the back
    }
    cache.unshift(page);
    events.push({
      page,
      lane: "cached",
      outcome: evicted ? "miss-eviction" : "miss",
      latencyMs: BACKEND_LATENCY_MS,
      cacheContents: [...cache],
      evicted,
      runningHits: hits,
      runningMisses: misses,
    });
  }

  return events;
}

export function generateCachingLanes(): CachingLanes {
  return {
    noCache: runNoCache(REQUEST_SEQUENCE),
    cached: runLru(REQUEST_SEQUENCE),
    requestSequence: REQUEST_SEQUENCE,
  };
}
