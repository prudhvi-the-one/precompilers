import { generateCommitGraphSteps, type GitCommitNode, type GitOp } from "@/lib/simulators/gitCommitGraph";

export type MergeRebaseNode = GitCommitNode & { abandoned?: boolean };

export type MergeRebaseStep = {
  mergeNodes: MergeRebaseNode[];
  rebaseNodes: MergeRebaseNode[];
  narration: string;
  done: boolean;
};

// The shared starting history both approaches diverge from: main has
// C1→C2→C3, feature branched at C2 and has F1→F2.
const SHARED_OPERATIONS: GitOp[] = [
  { type: "commit", branch: "main", message: "C1" },
  { type: "commit", branch: "main", message: "C2" },
  { type: "branch", name: "feature", from: "main" },
  { type: "commit", branch: "feature", message: "F1" },
  { type: "commit", branch: "main", message: "C3" },
  { type: "commit", branch: "feature", message: "F2" },
];

// Builds the identical shared history once (reusing the real commit-graph
// mechanics), then computes two genuinely different, real outcomes from that
// same starting point — a merge commit with two real parents vs. real new
// commits replayed on top of main, not two pre-drawn pictures.
export function generateMergeRebaseSteps(): MergeRebaseStep[] {
  const sharedSteps = generateCommitGraphSteps(SHARED_OPERATIONS);
  const shared = sharedSteps[sharedSteps.length - 1];
  const mainHead = shared.branchHeads.main;
  const featureHead = shared.branchHeads.feature;
  const sharedNodes: MergeRebaseNode[] = shared.nodes;

  const steps: MergeRebaseStep[] = [];

  steps.push({
    mergeNodes: [...sharedNodes],
    rebaseNodes: [...sharedNodes],
    narration: "Shared starting point: main has C1→C2→C3, feature branched at C2 with F1→F2.",
    done: false,
  });

  const mergeCommit: MergeRebaseNode = {
    id: "M",
    branch: "main",
    message: "Merge feature into main",
    parentIds: [mainHead, featureHead],
    x: sharedNodes.length,
    laneIndex: 0,
  };
  const f1Prime: MergeRebaseNode = {
    id: "F1'",
    branch: "feature",
    message: "F1 (replayed)",
    parentIds: [mainHead],
    x: sharedNodes.length,
    laneIndex: 0,
  };
  // Rebase abandons every original commit on the feature branch (its real
  // ids, not the F1/F2 labels — the generator assigns sequential C-ids
  // regardless of message) and replaces them with newly replayed commits.
  const rebaseAfterFirst: MergeRebaseNode[] = sharedNodes.map((n) =>
    n.branch === "feature" ? { ...n, abandoned: true } : n
  );

  steps.push({
    mergeNodes: [...sharedNodes, mergeCommit],
    rebaseNodes: [...rebaseAfterFirst, f1Prime],
    narration: "MERGE creates M with two real parents (C3 and F2). REBASE replays F1 on top of C3 as a new commit F1′ — the original F1 is now abandoned.",
    done: false,
  });

  const f2Prime: MergeRebaseNode = {
    id: "F2'",
    branch: "feature",
    message: "F2 (replayed)",
    parentIds: [f1Prime.id],
    x: sharedNodes.length + 1,
    laneIndex: 0,
  };

  steps.push({
    mergeNodes: [...sharedNodes, mergeCommit],
    rebaseNodes: [...rebaseAfterFirst, f1Prime, f2Prime],
    narration: "Done. MERGE: 6 commits total, one merge commit with two real parents. REBASE: 5 commits in a straight line (F1/F2 replayed as F1′/F2′, the originals abandoned) — no merge commit at all.",
    done: true,
  });

  return steps;
}
