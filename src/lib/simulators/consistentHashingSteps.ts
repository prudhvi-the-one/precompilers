export type RingNode = { id: string; label: string; position: number };
export type RingKey = { id: string; label: string; position: number; nodeId: string | null };

export type HashRingStep = {
  kind: "place-node" | "place-key" | "remove-node";
  nodes: RingNode[];
  keys: RingKey[];
  narration: string;
  remappedKeyIds: string[];
};

const RING_SIZE = 360;

// FNV-1a plus a Murmur3-style avalanche finalizer — genuinely spreads even
// near-identical short strings (e.g. "key1".."key8") around the ring,
// unlike a bare djb2/FNV hash which clusters them.
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function avalanche(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function hashToPosition(label: string): number {
  return avalanche(fnv1a(label)) % RING_SIZE;
}

function firstNodeClockwiseFrom(position: number, nodes: RingNode[]): RingNode | null {
  if (nodes.length === 0) return null;
  const sorted = [...nodes].sort((a, b) => a.position - b.position);
  const next = sorted.find((n) => n.position >= position);
  return next ?? sorted[0];
}

export function generateHashRingSteps(): HashRingStep[] {
  const steps: HashRingStep[] = [];
  const nodeLabels = ["Node A", "Node B", "Node C", "Node D"];
  const keyLabels = ["key1", "key2", "key3", "key4", "key5", "key6", "key7", "key8"];

  const nodes: RingNode[] = [];
  const keys: RingKey[] = [];

  for (const label of nodeLabels) {
    const node: RingNode = { id: label, label, position: hashToPosition(label) };
    nodes.push(node);
    steps.push({
      kind: "place-node",
      nodes: [...nodes],
      keys: [...keys],
      narration: `${label} placed on the ring at position ${node.position} (hash of its own id).`,
      remappedKeyIds: [],
    });
  }

  for (const label of keyLabels) {
    const position = hashToPosition(label);
    const owner = firstNodeClockwiseFrom(position, nodes);
    const key: RingKey = { id: label, label, position, nodeId: owner?.id ?? null };
    keys.push(key);
    steps.push({
      kind: "place-key",
      nodes: [...nodes],
      keys: [...keys],
      narration: `${label} hashes to position ${position} — the first node clockwise is ${owner?.label}, so ${label} is assigned there.`,
      remappedKeyIds: [],
    });
  }

  // Remove a real node and recompute — only keys that were assigned to it move.
  const removed = nodes.find((n) => n.id === "Node B")!;
  const remainingNodes = nodes.filter((n) => n.id !== removed.id);
  const affectedKeyIds = keys.filter((k) => k.nodeId === removed.id).map((k) => k.id);

  const reassignedKeys = keys.map((k) => {
    if (k.nodeId !== removed.id) return k;
    const owner = firstNodeClockwiseFrom(k.position, remainingNodes);
    return { ...k, nodeId: owner?.id ?? null };
  });

  steps.push({
    kind: "remove-node",
    nodes: remainingNodes,
    keys: reassignedKeys,
    narration: `${removed.label} removed. Only its ${affectedKeyIds.length} key(s) (${affectedKeyIds.join(", ") || "none"}) remap to the next node clockwise — the other ${keys.length - affectedKeyIds.length} keys are untouched.`,
    remappedKeyIds: affectedKeyIds,
  });

  return steps;
}
