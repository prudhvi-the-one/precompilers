export type GraphNodeState = "unvisited" | "frontier" | "active" | "visited";

export type GraphNode = { id: string; x: number; y: number };
export type GraphEdge = { from: string; to: string };

export type GraphStep = {
  nodeStates: Record<string, GraphNodeState>;
  queue: string[];
  activeNode: string | null;
  narration: string;
};

// Fixed layout (percentage coordinates), same "fixed representative input"
// convention as RACE_INPUT — one cross-edge (E-F) so BFS isn't just a clean
// binary tree.
export const GRAPH_NODES: GraphNode[] = [
  { id: "A", x: 50, y: 8 },
  { id: "B", x: 22, y: 36 },
  { id: "C", x: 78, y: 36 },
  { id: "D", x: 8, y: 68 },
  { id: "E", x: 36, y: 68 },
  { id: "F", x: 64, y: 68 },
  { id: "G", x: 92, y: 68 },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "A", to: "B" },
  { from: "A", to: "C" },
  { from: "B", to: "D" },
  { from: "B", to: "E" },
  { from: "C", to: "F" },
  { from: "C", to: "G" },
  { from: "E", to: "F" },
];

function neighbors(id: string): string[] {
  const out: string[] = [];
  for (const e of GRAPH_EDGES) {
    if (e.from === id) out.push(e.to);
    if (e.to === id) out.push(e.from);
  }
  return out;
}

// A real BFS — a real queue, real dequeue/enqueue, real visited-set — over
// GRAPH_NODES/GRAPH_EDGES, replayed as one step per queue operation.
export function generateBfsSteps(startId: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startId];
  const nodeStates: Record<string, GraphNodeState> = {};
  GRAPH_NODES.forEach((n) => (nodeStates[n.id] = "unvisited"));
  nodeStates[startId] = "frontier";

  function snapshot(activeNode: string | null, narration: string) {
    steps.push({ nodeStates: { ...nodeStates }, queue: [...queue], activeNode, narration });
  }

  snapshot(null, `Start at ${startId} — added to the queue.`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    nodeStates[current] = "active";
    snapshot(current, `Dequeue ${current} — mark it visited.`);

    const next = neighbors(current).filter((n) => !visited.has(n) && nodeStates[n] !== "frontier");
    for (const n of next) {
      queue.push(n);
      nodeStates[n] = "frontier";
    }
    nodeStates[current] = "visited";
    if (next.length > 0) {
      snapshot(current, `${current}'s unvisited neighbor${next.length === 1 ? "" : "s"} (${next.join(", ")}) join${next.length === 1 ? "s" : ""} the queue.`);
    }
  }

  snapshot(null, "Queue empty — every reachable node has been visited.");
  return steps;
}
