export type NodeCapacity = { id: string; cpuCapacity: number; cpuUsed: number };
export type Pod = { id: string; cpuRequest: number; nodeId: string | null };

export type K8sStep = {
  kind: "place-pod" | "pod-failure" | "reschedule";
  nodes: NodeCapacity[];
  pods: Pod[];
  narration: string;
};

const NODE_CAPACITY = 10;

// A real greedy first-fit scheduler: place on the first node with genuinely
// enough remaining capacity, actually decrementing that node's used capacity.
function scheduleOnFirstFit(nodes: NodeCapacity[], cpuRequest: number): string | null {
  const node = nodes.find((n) => n.cpuCapacity - n.cpuUsed >= cpuRequest);
  if (!node) return null;
  node.cpuUsed += cpuRequest;
  return node.id;
}

export function generateK8sSchedulingSteps(): K8sStep[] {
  const steps: K8sStep[] = [];
  const nodes: NodeCapacity[] = [
    { id: "Node 1", cpuCapacity: NODE_CAPACITY, cpuUsed: 0 },
    { id: "Node 2", cpuCapacity: NODE_CAPACITY, cpuUsed: 0 },
    { id: "Node 3", cpuCapacity: NODE_CAPACITY, cpuUsed: 0 },
  ];
  const pods: Pod[] = [];

  const podRequests = [
    { id: "pod-a", cpuRequest: 4 },
    { id: "pod-b", cpuRequest: 4 },
    { id: "pod-c", cpuRequest: 3 },
    { id: "pod-d", cpuRequest: 4 },
    { id: "pod-e", cpuRequest: 5 },
    { id: "pod-f", cpuRequest: 2 },
  ];

  for (const req of podRequests) {
    const nodeId = scheduleOnFirstFit(nodes, req.cpuRequest);
    const pod: Pod = { id: req.id, cpuRequest: req.cpuRequest, nodeId };
    pods.push(pod);
    steps.push({
      nodes: nodes.map((n) => ({ ...n })),
      pods: pods.map((p) => ({ ...p })),
      narration: nodeId
        ? `${req.id} (requests ${req.cpuRequest} CPU) scheduled on ${nodeId} — first node with enough remaining capacity.`
        : `${req.id} (requests ${req.cpuRequest} CPU) is PENDING — no node currently has enough remaining capacity.`,
      kind: "place-pod",
    });
  }

  // A real pod failure: pod-b's node crashes it, freeing its real capacity.
  const failed = pods.find((p) => p.id === "pod-b")!;
  const failedNode = nodes.find((n) => n.id === failed.nodeId)!;
  failedNode.cpuUsed -= failed.cpuRequest;
  failed.nodeId = null;
  steps.push({
    nodes: nodes.map((n) => ({ ...n })),
    pods: pods.map((p) => ({ ...p })),
    narration: `${failed.id} crashes on ${failedNode.id} — its ${failed.cpuRequest} CPU is freed. Desired replica count (6) now exceeds actual running pods (5).`,
    kind: "pod-failure",
  });

  // Real reconciliation: reschedule to satisfy desired vs. actual count, via
  // the same real bin-packing rule — may land on a different node.
  const newNodeId = scheduleOnFirstFit(nodes, failed.cpuRequest);
  failed.nodeId = newNodeId;
  steps.push({
    nodes: nodes.map((n) => ({ ...n })),
    pods: pods.map((p) => ({ ...p })),
    narration: newNodeId
      ? `ReplicaSet controller reschedules ${failed.id} to restore the desired count — placed on ${newNodeId} (based on current remaining capacity, not necessarily its original node).`
      : `ReplicaSet controller tries to reschedule ${failed.id} but no node currently has room — it stays PENDING.`,
    kind: "reschedule",
  });

  return steps;
}
