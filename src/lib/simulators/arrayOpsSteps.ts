export type ArrayOp = "insert" | "delete" | "search" | "traverse";

export type ArrayOpMarks = {
  shift?: number[];
  target?: number[];
  found?: number[];
  remove?: number[];
};

export type ArrayOpStep = {
  cells: (number | null)[];
  marks: ArrayOpMarks;
  narration: string;
};

export const DEFAULT_ARRAY = [8, 3, 5, 1, 9];
export const MAX_ARRAY_LENGTH = 8;
const BASE_ADDR = 0x1000;
const ELEM_SIZE = 4;

export function formatAddress(index: number): string {
  return "0x" + (BASE_ADDR + index * ELEM_SIZE).toString(16).toUpperCase();
}

export function complexityFor(op: ArrayOp, arrLength: number, index: number | null): "O(1)" | "O(n)" {
  if (op === "insert") {
    return index === null || index >= arrLength ? "O(1)" : "O(n)";
  }
  if (op === "delete") {
    return arrLength > 0 && index === arrLength - 1 ? "O(1)" : "O(n)";
  }
  return "O(n)";
}

export function generateInsertSteps(
  arr: number[],
  rawIndex: number | null,
  value: number
): { steps: ArrayOpStep[]; finalArr: number[] } {
  const index = rawIndex === null ? arr.length : Math.max(0, Math.min(rawIndex, arr.length));

  if (index >= arr.length) {
    const finalArr = [...arr, value];
    return {
      finalArr,
      steps: [
        { cells: arr, marks: {}, narration: `Before: array has ${arr.length} elements.` },
        {
          cells: finalArr,
          marks: { target: [arr.length] },
          narration: `Appending ${value} at index ${arr.length} — no shifting needed, direct write to the next free slot.`,
        },
      ],
    };
  }

  const shiftedNewPositions: number[] = [];
  for (let j = index; j < arr.length; j++) shiftedNewPositions.push(j + 1);
  const mid: (number | null)[] = [...arr.slice(0, index), null, ...arr.slice(index)];
  const finalArr = [...arr.slice(0, index), value, ...arr.slice(index)];

  return {
    finalArr,
    steps: [
      {
        cells: arr,
        marks: {},
        narration: `Before: inserting ${value} at index ${index} means everyone from index ${index} onward has to move first.`,
      },
      {
        cells: mid,
        marks: { shift: shiftedNewPositions },
        narration: `Shifting ${arr.length - index} element(s) one slot to the right to open up index ${index}.`,
      },
      {
        cells: finalArr,
        marks: { target: [index] },
        narration: `Index ${index} is now free — write ${value} there. Total cost: ${arr.length - index} shifts + 1 write.`,
      },
    ],
  };
}

export function generateDeleteSteps(
  arr: number[],
  rawIndex: number | null
): { steps: ArrayOpStep[]; finalArr: number[] } {
  if (arr.length === 0) {
    return {
      finalArr: arr,
      steps: [{ cells: arr, marks: {}, narration: "Nothing to delete — the array is empty." }],
    };
  }

  const index = rawIndex === null ? arr.length - 1 : Math.max(0, Math.min(rawIndex, arr.length - 1));
  const removedValue = arr[index];

  if (index === arr.length - 1) {
    const finalArr = arr.slice(0, -1);
    return {
      finalArr,
      steps: [
        {
          cells: arr,
          marks: { remove: [index] },
          narration: `Removing the last element (index ${index}, value ${removedValue}) — no shifting needed.`,
        },
        { cells: finalArr, marks: {}, narration: "Done — one write to clear the slot, nothing else moved." },
      ],
    };
  }

  const finalArr = [...arr.slice(0, index), ...arr.slice(index + 1)];
  const shiftedNewPositions: number[] = [];
  for (let j = index; j < finalArr.length; j++) shiftedNewPositions.push(j);

  return {
    finalArr,
    steps: [
      {
        cells: arr,
        marks: { remove: [index] },
        narration: `Before: removing index ${index} (value ${removedValue}) means everyone after it has to shift left to close the gap.`,
      },
      {
        cells: finalArr,
        marks: { shift: shiftedNewPositions },
        narration: `Shifted ${arr.length - 1 - index} element(s) one slot to the left to close the gap.`,
      },
    ],
  };
}

export function generateSearchSteps(arr: number[], value: number): { steps: ArrayOpStep[]; finalArr: number[] } {
  const steps: ArrayOpStep[] = [];
  let foundAt = -1;
  for (let i = 0; i < arr.length; i++) {
    steps.push({ cells: arr, marks: { target: [i] }, narration: `Checking index ${i}: is ${arr[i]} == ${value}?` });
    if (arr[i] === value) {
      foundAt = i;
      break;
    }
  }
  if (foundAt >= 0) {
    steps.push({
      cells: arr,
      marks: { found: [foundAt] },
      narration: `Found! ${value} lives at index ${foundAt} — it took ${foundAt + 1} comparison(s).`,
    });
  } else {
    steps.push({ cells: arr, marks: {}, narration: `${value} isn't in this array — checked all ${arr.length} element(s).` });
  }
  return { steps, finalArr: arr };
}

export function generateTraverseSteps(arr: number[]): { steps: ArrayOpStep[]; finalArr: number[] } {
  const steps: ArrayOpStep[] = arr.map((v, i) => ({
    cells: arr,
    marks: { target: [i] },
    narration: `Visiting index ${i} -> ${v}`,
  }));
  steps.push({ cells: arr, marks: {}, narration: `Traversal complete — visited all ${arr.length} element(s) in order.` });
  return { steps, finalArr: arr };
}
