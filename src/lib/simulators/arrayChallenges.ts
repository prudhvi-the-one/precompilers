import { generateInsertSteps, generateDeleteSteps, type ArrayOp } from "@/lib/simulators/arrayOpsSteps";

export type ChallengeReplay = {
  op: ArrayOp;
  arr: number[];
  value?: number;
  index?: number;
};

export type Challenge = {
  op: ArrayOp;
  prompt: string;
  options: string[];
  correctIndex: number;
  replay: ChallengeReplay;
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(len: number): number[] {
  return Array.from({ length: len }, () => randInt(1, 99));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a 4-option set from a correct answer and a pool of candidate
// distractors, deduping against the correct answer and topping up with a
// fallback generator if the pool didn't yield enough unique wrong answers.
function buildOptions(correct: string, candidates: string[], fallback: () => string) {
  const pool = new Set(candidates.filter((c) => c !== correct));
  let guard = 0;
  while (pool.size < 3 && guard < 25) {
    const f = fallback();
    if (f !== correct) pool.add(f);
    guard++;
  }
  const distractors = shuffle(Array.from(pool)).slice(0, 3);
  const all = shuffle([correct, ...distractors]);
  return { list: all, correctIndex: all.indexOf(correct) };
}

function generateInsertChallenge(): Challenge {
  const arr = randomArray(randInt(4, 6));
  const value = randInt(1, 99);
  const index = randInt(0, arr.length);
  const { finalArr } = generateInsertSteps(arr, index, value);
  const correct = finalArr.join(", ");

  const candidates = [
    arr.concat(value).join(", "), // forgot to shift — always appended
    arr.map((v, i) => (i === index ? value : v)).join(", "), // overwrote instead of inserting
    (() => {
      const off = Math.min(index + 1, arr.length);
      return [...arr.slice(0, off), value, ...arr.slice(off)].join(", ");
    })(), // off-by-one insert position
  ];

  const { list, correctIndex } = buildOptions(correct, candidates, () => randomArray(arr.length + 1).join(", "));

  return {
    op: "insert",
    prompt: `Starting array: [${arr.join(", ")}]. Insert ${value} at index ${index}. What does the array look like afterward?`,
    options: list,
    correctIndex,
    replay: { op: "insert", arr, value, index },
  };
}

function generateDeleteChallenge(): Challenge {
  const arr = randomArray(randInt(4, 6));
  const index = randInt(0, arr.length - 1);
  const { finalArr } = generateDeleteSteps(arr, index);
  const correct = finalArr.join(", ");

  const candidates = [
    arr.slice(0, -1).join(", "), // always removed the last element
    arr.filter((_, i) => i !== Math.min(index + 1, arr.length - 1)).join(", "), // off-by-one
    arr.join(", "), // forgot to remove anything
  ];

  const { list, correctIndex } = buildOptions(correct, candidates, () =>
    randomArray(Math.max(1, arr.length - 1)).join(", ")
  );

  return {
    op: "delete",
    prompt: `Starting array: [${arr.join(", ")}]. Delete the element at index ${index}. What does the array look like afterward?`,
    options: list,
    correctIndex,
    replay: { op: "delete", arr, index },
  };
}

function generateSearchChallenge(): Challenge {
  const arr = randomArray(randInt(4, 7));
  const present = Math.random() < 0.6;
  const value = present ? arr[randInt(0, arr.length - 1)] : randInt(100, 199);
  const idx = arr.indexOf(value);
  const correct = idx >= 0 ? String(idx) : "Not found";

  const candidates = arr.map((_, i) => String(i));
  candidates.push("Not found");

  const { list, correctIndex } = buildOptions(correct, candidates, () => String(randInt(0, arr.length)));

  return {
    op: "search",
    prompt: `Array: [${arr.join(", ")}]. Searching left to right for ${value}, at what index is it found? (Answer "Not found" if it isn't in the array.)`,
    options: list,
    correctIndex,
    replay: { op: "search", arr, value },
  };
}

function generateTraverseChallenge(): Challenge {
  const arr = randomArray(randInt(4, 6));
  const sum = arr.reduce((a, b) => a + b, 0);
  const correct = String(sum);

  const candidates = [
    String(sum + arr[0]),
    String(sum - arr[arr.length - 1]),
    String(sum + (randInt(-8, 8) || 3)),
  ];

  const { list, correctIndex } = buildOptions(correct, candidates, () => String(sum + randInt(-15, 15)));

  return {
    op: "traverse",
    prompt: `Array: [${arr.join(", ")}]. What is the sum of every element visited during a full left-to-right traversal?`,
    options: list,
    correctIndex,
    replay: { op: "traverse", arr },
  };
}

export function generateChallenge(op: ArrayOp): Challenge {
  switch (op) {
    case "insert":
      return generateInsertChallenge();
    case "delete":
      return generateDeleteChallenge();
    case "search":
      return generateSearchChallenge();
    case "traverse":
      return generateTraverseChallenge();
  }
}

export function generateRandomChallenge(operations: ArrayOp[]): Challenge {
  const op = operations[randInt(0, operations.length - 1)];
  return generateChallenge(op);
}
