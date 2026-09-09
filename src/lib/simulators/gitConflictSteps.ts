export type LineDecision = "unchanged" | "ours-only" | "theirs-only" | "both-same" | "conflict";

export type ConflictStep = {
  lineIndex: number;
  base: string;
  ours: string;
  theirs: string;
  decision: LineDecision;
  resolvedLines: (string | null)[];
  narration: string;
  done: boolean;
};

// One small fixed file, deliberately covering all four real three-way-merge
// outcomes plus a genuine conflict, line by line.
export const BASE = [
  "function checkout(cart) {",
  "  let total = subtotal(cart)",
  "  total = applyDiscount(total)",
  "  total = round(applyTax(total))",
  "  return total",
  "}",
];
export const OURS = [
  "function checkout(cart) {",
  "  let total = subtotal(cart)",
  "  total = applyMemberDiscount(total)",
  "  total = Math.round(applyTax(total))",
  "  return Math.round(total)",
  "}",
];
export const THEIRS = [
  "function checkout(cart) {",
  "  let total = subtotal(cart) - couponAmount",
  "  total = applyDiscount(total)",
  "  total = Math.round(applyTax(total))",
  "  return total.toFixed(2)",
  "}",
];

// The real per-line three-way-merge decision — the same rule a real merge
// applies per hunk, just simplified to whole-line alignment for a small,
// honest example rather than a full LCS diff.
function decideLine(base: string, ours: string, theirs: string): LineDecision {
  if (ours === base && theirs === base) return "unchanged";
  if (ours !== base && theirs === base) return "ours-only";
  if (ours === base && theirs !== base) return "theirs-only";
  if (ours === theirs) return "both-same";
  return "conflict";
}

export function generateConflictSteps(base: string[], ours: string[], theirs: string[]): ConflictStep[] {
  const steps: ConflictStep[] = [];
  const resolved: (string | null)[] = new Array(base.length).fill(null);

  base.forEach((baseLine, i) => {
    const oursLine = ours[i];
    const theirsLine = theirs[i];
    const decision = decideLine(baseLine, oursLine, theirsLine);

    let narration: string;
    if (decision === "unchanged") {
      resolved[i] = baseLine;
      narration = `Line ${i + 1}: neither side changed it — kept as-is.`;
    } else if (decision === "ours-only") {
      resolved[i] = oursLine;
      narration = `Line ${i + 1}: only OURS changed it — auto-merges cleanly to our version.`;
    } else if (decision === "theirs-only") {
      resolved[i] = theirsLine;
      narration = `Line ${i + 1}: only THEIRS changed it — auto-merges cleanly to their version.`;
    } else if (decision === "both-same") {
      resolved[i] = oursLine;
      narration = `Line ${i + 1}: both sides made the identical change — auto-merges cleanly, no conflict.`;
    } else {
      resolved[i] = null;
      narration = `Line ${i + 1}: both sides changed it differently — CONFLICT. Git can't pick automatically.`;
    }

    steps.push({
      lineIndex: i,
      base: baseLine,
      ours: oursLine,
      theirs: theirsLine,
      decision,
      resolvedLines: [...resolved],
      narration,
      done: i === base.length - 1,
    });
  });

  return steps;
}
