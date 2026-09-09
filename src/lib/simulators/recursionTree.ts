export type RecursionNodeState = "pending" | "active" | "done";

export type RecursionStepNode = {
  id: number;
  n: number;
  depth: number;
  x: number;
  state: RecursionNodeState;
  result: number | null;
};

export type RecursionStep = {
  nodes: RecursionStepNode[];
  narration: string;
  callCount: number;
};

// Small enough to stay readable: naive fib(5) makes exactly 15 calls.
export const FIB_N = 5;

type CallNode = {
  id: number;
  n: number;
  depth: number;
  parentId: number | null;
  children: CallNode[];
  result: number | null;
};

export function generateNaiveFibSteps(n: number): RecursionStep[] {
  // Pass 1: build the real call tree via the real recursive algorithm.
  let nextId = 0;
  const byId = new Map<number, CallNode>();

  function build(value: number, depth: number, parent: CallNode | null): CallNode {
    const id = nextId++;
    const node: CallNode = { id, n: value, depth, parentId: parent?.id ?? null, children: [], result: null };
    byId.set(id, node);
    if (parent) parent.children.push(node);
    if (value <= 1) {
      node.result = value;
      return node;
    }
    const left = build(value - 1, depth + 1, node);
    const right = build(value - 2, depth + 1, node);
    node.result = left.result! + right.result!;
    return node;
  }
  const root = build(n, 0, null);

  // Pass 2: static x position — each leaf gets the next slot, internal nodes
  // center over their children — computed once so nodes never shift as more
  // of the tree gets revealed.
  let nextLeafX = 0;
  const xById = new Map<number, number>();
  (function assignX(node: CallNode) {
    if (node.children.length === 0) {
      xById.set(node.id, nextLeafX);
      nextLeafX += 1;
      return;
    }
    node.children.forEach(assignX);
    const xs = node.children.map((c) => xById.get(c.id)!);
    xById.set(node.id, (Math.min(...xs) + Math.max(...xs)) / 2);
  })(root);
  const maxX = Math.max(...Array.from(xById.values()), 1);

  // Pass 3: real replay of the same recursion, one step per call-start and
  // one per return, using the static positions from pass 2.
  const steps: RecursionStep[] = [];
  const stateById = new Map<number, RecursionNodeState>();
  byId.forEach((_, id) => stateById.set(id, "pending"));

  function snapshot(activeId: number, narration: string, callsSoFar: number) {
    const nodes: RecursionStepNode[] = Array.from(byId.values())
      .filter((node) => stateById.get(node.id) !== "pending" || node.id === activeId)
      .map((node) => ({
        id: node.id,
        n: node.n,
        depth: node.depth,
        x: (xById.get(node.id)! / maxX) * 100,
        state: stateById.get(node.id)!,
        result: stateById.get(node.id) === "done" ? node.result : null,
      }));
    steps.push({ nodes, narration, callCount: callsSoFar });
  }

  let calls = 0;
  function replay(node: CallNode): void {
    calls++;
    stateById.set(node.id, "active");
    snapshot(node.id, `Call fib(${node.n}) — call #${calls}.`, calls);
    if (node.n <= 1) {
      stateById.set(node.id, "done");
      snapshot(node.id, `fib(${node.n}) is a base case — returns ${node.n}.`, calls);
      return;
    }
    replay(node.children[0]);
    replay(node.children[1]);
    stateById.set(node.id, "done");
    snapshot(
      node.id,
      `fib(${node.n}) = fib(${node.n - 1}) + fib(${node.n - 2}) = ${node.children[0].result} + ${node.children[1].result} = ${node.result}.`,
      calls
    );
  }
  replay(root);

  return steps;
}
