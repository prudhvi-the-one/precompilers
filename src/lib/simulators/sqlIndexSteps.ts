export type IndexNodeState = "pending" | "active" | "visited" | "found";

export type IndexStepNode = {
  value: number;
  depth: number;
  parentValue: number | null;
  x: number;
  state: IndexNodeState;
};

export type IndexStep = {
  nodes: IndexStepNode[];
  narration: string;
  comparisons: number;
  fullScanRowsTouched: number;
  found: boolean;
};

// A sorted set of row ids — what a real B-tree/B+tree index is built over.
export const INDEXED_ROW_IDS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29];
export const SEEK_TARGET = 29;

type TreeNode = {
  value: number;
  depth: number;
  parentValue: number | null;
  left: TreeNode | null;
  right: TreeNode | null;
};

// A real balanced build (always split at the sorted midpoint — how a real
// index is structured, not an arbitrary insert order) followed by a real
// binary-search descent for the target, replayed as one step per node
// visited.
export function generateIndexSeekSteps(sortedIds: number[], target: number): IndexStep[] {
  function build(lo: number, hi: number, depth: number, parentValue: number | null): TreeNode | null {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    const node: TreeNode = { value: sortedIds[mid], depth, parentValue, left: null, right: null };
    node.left = build(lo, mid - 1, depth + 1, node.value);
    node.right = build(mid + 1, hi, depth + 1, node.value);
    return node;
  }
  const root = build(0, sortedIds.length - 1, 0, null);

  const allNodes: TreeNode[] = [];
  (function collect(n: TreeNode | null) {
    if (!n) return;
    allNodes.push(n);
    collect(n.left);
    collect(n.right);
  })(root);

  let nextLeafX = 0;
  const xByValue = new Map<number, number>();
  (function assignX(n: TreeNode | null): number {
    if (!n) return -1;
    if (!n.left && !n.right) {
      const x = nextLeafX;
      nextLeafX += 1;
      xByValue.set(n.value, x);
      return x;
    }
    const leftX = n.left ? assignX(n.left) : -1;
    const rightX = n.right ? assignX(n.right) : -1;
    const x = leftX >= 0 && rightX >= 0 ? (leftX + rightX) / 2 : leftX >= 0 ? leftX : rightX;
    xByValue.set(n.value, x);
    return x;
  })(root);
  const maxX = Math.max(...Array.from(xByValue.values()), 1);

  const steps: IndexStep[] = [];
  const visited = new Set<number>();
  let comparisons = 0;

  function snapshot(activeValue: number | null, narration: string, found: boolean) {
    const nodes: IndexStepNode[] = allNodes.map((n) => ({
      value: n.value,
      depth: n.depth,
      parentValue: n.parentValue,
      x: (xByValue.get(n.value)! / maxX) * 100,
      state: n.value === activeValue ? (found ? "found" : "active") : visited.has(n.value) ? "visited" : "pending",
    }));
    steps.push({ nodes, narration, comparisons, fullScanRowsTouched: sortedIds.length, found });
  }

  let current = root;
  while (current) {
    comparisons++;
    visited.add(current.value);
    if (current.value === target) {
      snapshot(current.value, `Found row ${target} after ${comparisons} comparison${comparisons === 1 ? "" : "s"} — a full scan would have touched all ${sortedIds.length} rows.`, true);
      break;
    }
    if (target < current.value) {
      snapshot(current.value, `${target} < ${current.value} — go left.`, false);
      current = current.left;
    } else {
      snapshot(current.value, `${target} > ${current.value} — go right.`, false);
      current = current.right;
    }
  }

  return steps;
}
