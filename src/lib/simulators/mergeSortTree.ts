export type TreeNodeState = "pending" | "active" | "done";

export type TreeNode = {
  lo: number;
  hi: number;
  label: string;
  state: TreeNodeState;
};

export type MergeSortTreeStep = {
  treeNodes: TreeNode[];
  activeMergeDescription: string;
  comparisons: number;
};

// Recursively simulates a real merge sort, emitting one step per actual merge
// operation — the tree's node set (by [lo,hi) range) is fixed up front so
// layout stays stable across steps; only each node's label/state changes.
export function generateMergeSortTreeSteps(input: number[]): MergeSortTreeStep[] {
  const n = input.length;
  const steps: MergeSortTreeStep[] = [];
  let comparisons = 0;

  const ranges: { lo: number; hi: number }[] = [];
  (function collect(lo: number, hi: number) {
    ranges.push({ lo, hi });
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    collect(lo, mid);
    collect(mid, hi);
  })(0, n);

  const stateByKey = new Map<string, TreeNodeState>();
  const valuesByKey = new Map<string, number[]>();
  ranges.forEach(({ lo, hi }) => {
    const key = `${lo}-${hi}`;
    if (hi - lo <= 1) {
      stateByKey.set(key, "done");
      valuesByKey.set(key, input.slice(lo, hi));
    } else {
      stateByKey.set(key, "pending");
    }
  });

  function snapshot(activeKey: string | null, description: string) {
    const treeNodes: TreeNode[] = ranges.map(({ lo, hi }) => {
      const key = `${lo}-${hi}`;
      const values = valuesByKey.get(key) ?? input.slice(lo, hi);
      const state = key === activeKey ? "active" : (stateByKey.get(key) ?? "pending");
      return { lo, hi, label: `[${values.join(",")}]`, state };
    });
    steps.push({ treeNodes, activeMergeDescription: description, comparisons });
  }

  function mergeSort(lo: number, hi: number): number[] {
    if (hi - lo <= 1) return input.slice(lo, hi);
    const mid = Math.floor((lo + hi) / 2);
    const left = mergeSort(lo, mid);
    const right = mergeSort(mid, hi);

    const key = `${lo}-${hi}`;
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

    valuesByKey.set(key, merged);
    stateByKey.set(key, "done");
    snapshot(key, `Merged [${left.join(",")}] and [${right.join(",")}] into [${merged.join(",")}].`);
    return merged;
  }

  mergeSort(0, n);
  return steps;
}
