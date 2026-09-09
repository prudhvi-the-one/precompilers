export type NodeState = { id: string; value: number | null; reachableMajority: boolean };

export type CapStep = {
  phase: "initial" | "partition" | "write" | "heal";
  lane: "cp" | "ap";
  nodeA: NodeState;
  nodeB: NodeState;
  narration: string;
  writeRejected: boolean;
  diverged: boolean;
};

export type CapLanes = {
  cp: CapStep[];
  ap: CapStep[];
};

// The real per-lane rule: given whether a side has majority and whether this
// lane enforces quorum, decide if its write is accepted, and to what value.
function attemptWrite(
  enforceQuorum: boolean,
  hasMajority: boolean,
  currentValue: number,
  proposedValue: number
): { accepted: boolean; value: number } {
  if (enforceQuorum && !hasMajority) {
    return { accepted: false, value: currentValue };
  }
  return { accepted: true, value: proposedValue };
}

function runLane(lane: "cp" | "ap"): CapStep[] {
  const enforceQuorum = lane === "cp";
  const steps: CapStep[] = [];

  const initialA: NodeState = { id: "Node A", value: 1, reachableMajority: true };
  const initialB: NodeState = { id: "Node B", value: 1, reachableMajority: true };
  steps.push({
    phase: "initial",
    lane,
    nodeA: initialA,
    nodeB: initialB,
    narration: "Both replicas agree: value = 1.",
    writeRejected: false,
    diverged: initialA.value !== initialB.value,
  });

  const partitionedA: NodeState = { id: "Node A", value: 1, reachableMajority: true };
  const partitionedB: NodeState = { id: "Node B", value: 1, reachableMajority: false };
  steps.push({
    phase: "partition",
    lane,
    nodeA: partitionedA,
    nodeB: partitionedB,
    narration: enforceQuorum
      ? "Network partition. Under CP, the side that can't confirm a majority (Node B, alone) must refuse writes to stay consistent."
      : "Network partition. Under AP, neither side checks for a majority before accepting writes — both stay available.",
    writeRejected: false,
    diverged: partitionedA.value !== partitionedB.value,
  });

  const resultA = attemptWrite(enforceQuorum, partitionedA.reachableMajority, partitionedA.value!, 2);
  const resultB = attemptWrite(enforceQuorum, partitionedB.reachableMajority, partitionedB.value!, 3);
  const writtenA: NodeState = { ...partitionedA, value: resultA.value };
  const writtenB: NodeState = { ...partitionedB, value: resultB.value };

  steps.push({
    phase: "write",
    lane,
    nodeA: writtenA,
    nodeB: writtenB,
    narration: resultB.accepted
      ? `Node A accepts write value=${resultA.value}. Node B ALSO accepts a write, value=${resultB.value} — both succeed locally, but the replicas now genuinely disagree.`
      : `Node A (has majority) accepts write value=${resultA.value}. Node B's write is REJECTED — no majority, so it refuses rather than risk an inconsistent value.`,
    writeRejected: !resultB.accepted,
    diverged: writtenA.value !== writtenB.value,
  });

  const healedA: NodeState = { ...writtenA, reachableMajority: true };
  const healedB: NodeState = resultB.accepted
    ? { ...writtenB, reachableMajority: true }
    : { ...writtenB, value: writtenA.value, reachableMajority: true }; // catches up, no conflict
  steps.push({
    phase: "heal",
    lane,
    nodeA: healedA,
    nodeB: healedB,
    narration:
      healedA.value === healedB.value
        ? "Partition heals. Node B never accepted a conflicting write, so it simply catches up — no conflict to resolve."
        : `Partition heals. Node A says ${healedA.value}, Node B says ${healedB.value} — a real, unresolved conflict that needs application-level reconciliation (e.g. last-write-wins or a merge rule).`,
    writeRejected: false,
    diverged: healedA.value !== healedB.value,
  });

  return steps;
}

export function generateCapLanes(): CapLanes {
  return { cp: runLane("cp"), ap: runLane("ap") };
}
