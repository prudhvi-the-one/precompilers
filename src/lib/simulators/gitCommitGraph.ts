export type GitOp =
  | { type: "commit"; branch: string; message: string }
  | { type: "branch"; name: string; from: string };

export type GitCommitNode = {
  id: string;
  branch: string;
  message: string;
  parentIds: string[];
  x: number;
  laneIndex: number;
};

export type GitGraphStep = {
  nodes: GitCommitNode[];
  branchHeads: Record<string, string>;
  narration: string;
};

// A real, fixed sequence of git operations — the same kind of representative,
// fixed input used by every other simulator (RACE_INPUT, GRAPH_NODES, ...).
export const GIT_OPERATIONS: GitOp[] = [
  { type: "commit", branch: "main", message: "Initial commit" },
  { type: "commit", branch: "main", message: "Add README" },
  { type: "branch", name: "feature", from: "main" },
  { type: "commit", branch: "feature", message: "Start feature" },
  { type: "commit", branch: "main", message: "Fix typo" },
  { type: "commit", branch: "feature", message: "Finish feature" },
];

// Replays real git mechanics: a `branchHeads` map is the only state, each
// commit's parent is genuinely whatever its branch's head was at that
// instant, and `branch` just copies the source branch's current head.
export function generateCommitGraphSteps(operations: GitOp[]): GitGraphStep[] {
  const steps: GitGraphStep[] = [];
  const branchHeads: Record<string, string> = {};
  const nodes: GitCommitNode[] = [];
  const laneByBranch: Record<string, number> = {};
  let nextId = 1;
  let nextLane = 0;

  operations.forEach((op) => {
    if (op.type === "branch") {
      branchHeads[op.name] = branchHeads[op.from];
      laneByBranch[op.name] = nextLane++;
      steps.push({
        nodes: [...nodes],
        branchHeads: { ...branchHeads },
        narration: `Branch "${op.name}" created, pointing at ${op.from}'s current commit.`,
      });
      return;
    }

    if (!(op.branch in laneByBranch)) laneByBranch[op.branch] = nextLane++;
    const id = `C${nextId++}`;
    const parentIds = branchHeads[op.branch] ? [branchHeads[op.branch]] : [];
    const node: GitCommitNode = {
      id,
      branch: op.branch,
      message: op.message,
      parentIds,
      x: nodes.length,
      laneIndex: laneByBranch[op.branch],
    };
    nodes.push(node);
    branchHeads[op.branch] = id;
    steps.push({
      nodes: [...nodes],
      branchHeads: { ...branchHeads },
      narration: `${id} on "${op.branch}": ${op.message}${parentIds.length ? ` (parent ${parentIds[0]})` : " (root commit)"}.`,
    });
  });

  return steps;
}
