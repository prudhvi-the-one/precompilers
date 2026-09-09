export type SortStep = {
  array: number[];
  highlightIndices: number[];
  comparisons: number;
  writes: number;
  narration: string;
  done: boolean;
};

export const RACE_INPUT = [8, 3, 5, 4, 7, 6, 1, 2];

export function generateBubbleSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  let comparisons = 0;
  let writes = 0;
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const a = arr[j];
      const b = arr[j + 1];
      if (a > b) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        writes += 2;
        swappedThisPass = true;
        steps.push({
          array: [...arr],
          highlightIndices: [j, j + 1],
          comparisons,
          writes,
          narration: `Compared ${a} and ${b}: ${a} > ${b}, so we swap them.`,
          done: false,
        });
      } else {
        steps.push({
          array: [...arr],
          highlightIndices: [j, j + 1],
          comparisons,
          writes,
          narration: `Compared ${a} and ${b}: already in order, no swap needed.`,
          done: false,
        });
      }
    }
    if (!swappedThisPass) break;
  }
  steps.push({
    array: [...arr],
    highlightIndices: [],
    comparisons,
    writes,
    narration: "Sorted!",
    done: true,
  });
  return steps;
}

export function generateInsertionSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  let comparisons = 0;
  let writes = 0;

  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      comparisons++;
      if (arr[j - 1] > arr[j]) {
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        writes += 2;
        steps.push({
          array: [...arr],
          highlightIndices: [j - 1, j],
          comparisons,
          writes,
          narration: `Shifting ${arr[j - 1]} left — swapped into position ${j - 1}.`,
          done: false,
        });
        j--;
      } else {
        steps.push({
          array: [...arr],
          highlightIndices: [j - 1, j],
          comparisons,
          writes,
          narration: `${arr[j]} is now in its correct position among the sorted prefix.`,
          done: false,
        });
        break;
      }
    }
  }
  steps.push({
    array: [...arr],
    highlightIndices: [],
    comparisons,
    writes,
    narration: "Sorted!",
    done: true,
  });
  return steps;
}

// Merge sort's own step-by-step tree is in mergeSortTree.ts (it needs the
// recursion structure, not just a flat array); this returns just the total
// comparisons/writes and final array for the race lane, which only needs to
// show "already finished" — the deep-dive tab is where the real steps live.
export function summarizeMergeSort(input: number[]): { array: number[]; comparisons: number; writes: number } {
  let comparisons = 0;
  let writes = 0;

  function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const merged: number[] = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i] <= right[j]) merged.push(left[i++]);
      else merged.push(right[j++]);
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);
    writes += merged.length;
    return merged;
  }

  return { array: mergeSort([...input]), comparisons, writes };
}
