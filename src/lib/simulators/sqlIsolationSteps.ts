export type IsolationLevel = "READ_UNCOMMITTED" | "READ_COMMITTED";

export type IsolationStep = {
  narration: string;
  uncommittedSees: number;
  committedSees: number;
  dirtyRead: boolean;
  done: boolean;
};

type Op =
  | { actor: "T1" | "T2"; kind: "BEGIN" }
  | { actor: "T1"; kind: "READ" }
  | { actor: "T2"; kind: "WRITE"; value: number }
  | { actor: "T2"; kind: "COMMIT" };

// A fixed, real operation interleaving over one shared row. The dirty-read
// divergence isn't scripted — it falls out of applying each isolation
// level's real visibility rule to the same sequence.
const OPERATIONS: Op[] = [
  { actor: "T2", kind: "BEGIN" },
  { actor: "T1", kind: "BEGIN" },
  { actor: "T1", kind: "READ" },
  { actor: "T2", kind: "WRITE", value: 150 },
  { actor: "T1", kind: "READ" },
  { actor: "T2", kind: "COMMIT" },
  { actor: "T1", kind: "READ" },
];

const STARTING_BALANCE = 100;

// READ_UNCOMMITTED always returns whatever the latest write is, committed or
// not. READ_COMMITTED only ever returns the last value a COMMIT actually
// landed. Both rules are applied to the identical operation sequence.
export function generateIsolationSteps(): IsolationStep[] {
  const steps: IsolationStep[] = [];
  let committedValue = STARTING_BALANCE;
  let latestValue = STARTING_BALANCE;

  OPERATIONS.forEach((op, i) => {
    let narration: string;
    let dirtyRead = false;

    if (op.kind === "BEGIN") {
      narration = `${op.actor} begins a transaction.`;
    } else if (op.kind === "WRITE") {
      latestValue = op.value;
      narration = `T2 writes balance = ${op.value} (not committed yet).`;
    } else if (op.kind === "COMMIT") {
      committedValue = latestValue;
      narration = "T2 commits — its write is now permanent.";
    } else {
      dirtyRead = latestValue !== committedValue;
      narration = dirtyRead
        ? `T1 reads balance: READ UNCOMMITTED sees ${latestValue} (T2's uncommitted write) — a dirty read. READ COMMITTED still sees ${committedValue}.`
        : `T1 reads balance: both isolation levels see ${committedValue}.`;
    }

    steps.push({
      narration,
      uncommittedSees: latestValue,
      committedSees: committedValue,
      dirtyRead,
      done: i === OPERATIONS.length - 1,
    });
  });

  return steps;
}
