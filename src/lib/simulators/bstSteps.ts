export type BstNodeState = "pending" | "active" | "settled" | "visited";

export type BstStepNode = {
  value: number;
  depth: number;
  parentValue: number | null;
  x: number;
  state: BstNodeState;
};

export type BstStep = {
  nodes: BstStepNode[];
  narration: string;
  traversalSoFar: number[];
  phase: "insert" | "traverse";
};

export const BST_INSERT_VALUES = [8, 3, 10, 1, 6, 14, 4, 7, 13];

type TreeNode = {
  value: number;
  depth: number;
  parentValue: number | null;
  left: TreeNode | null;
  right: TreeNode | null;
};

// Real BST insert followed by a real recursive inorder traversal, replayed as
// steps. Every node's x position is its rank in the FINISHED tree's inorder
// sequence, computed once — so nodes never shift position across steps, only
// their state changes (same "positions fixed up front" convention as the
// merge-sort recursion tree).
export function generateBstSteps(values: number[]): BstStep[] {
  let root: TreeNode | null = null;

  function insert(value: number): void {
    if (!root) {
      root = { value, depth: 0, parentValue: null, left: null, right: null };
      return;
    }
    let node = root;
    let depth = 0;
    for (;;) {
      depth++;
      if (value < node.value) {
        if (!node.left) {
          node.left = { value, depth, parentValue: node.value, left: null, right: null };
          return;
        }
        node = node.left;
      } else {
        if (!node.right) {
          node.right = { value, depth, parentValue: node.value, left: null, right: null };
          return;
        }
        node = node.right;
      }
    }
  }
  values.forEach(insert);

  const finalOrder: TreeNode[] = [];
  (function walk(n: TreeNode | null) {
    if (!n) return;
    walk(n.left);
    finalOrder.push(n);
    walk(n.right);
  })(root);
  const xByValue = new Map(
    finalOrder.map((n, i) => [n.value, finalOrder.length > 1 ? (i / (finalOrder.length - 1)) * 100 : 50])
  );
  const nodeByValue = new Map(finalOrder.map((n) => [n.value, n]));

  const steps: BstStep[] = [];

  const insertedSoFar = new Set<number>();
  values.forEach((value) => {
    insertedSoFar.add(value);
    const node = nodeByValue.get(value)!;
    const nodes: BstStepNode[] = Array.from(insertedSoFar).map((v) => {
      const n = nodeByValue.get(v)!;
      return {
        value: v,
        depth: n.depth,
        parentValue: n.parentValue,
        x: xByValue.get(v)!,
        state: v === value ? "active" : "settled",
      };
    });
    const narration =
      node.parentValue === null
        ? `Inserted root ${value}.`
        : `${value} ${value < node.parentValue ? "<" : ">="} ${node.parentValue}, so it becomes ${node.parentValue}'s ${
            value < node.parentValue ? "left" : "right"
          } child.`;
    steps.push({ nodes, narration, traversalSoFar: [], phase: "insert" });
  });

  const traversalSoFar: number[] = [];
  const visited = new Set<number>();
  function snapshotTraverse(activeValue: number, narration: string) {
    const nodes: BstStepNode[] = finalOrder.map((n) => ({
      value: n.value,
      depth: n.depth,
      parentValue: n.parentValue,
      x: xByValue.get(n.value)!,
      state: n.value === activeValue ? "active" : visited.has(n.value) ? "visited" : "settled",
    }));
    steps.push({ nodes, narration, traversalSoFar: [...traversalSoFar], phase: "traverse" });
  }
  (function inorder(n: TreeNode | null) {
    if (!n) return;
    inorder(n.left);
    snapshotTraverse(n.value, `Visit ${n.value} — its left subtree is done, so it's next in sorted order.`);
    traversalSoFar.push(n.value);
    visited.add(n.value);
    inorder(n.right);
  })(root);

  return steps;
}
