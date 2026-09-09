export type BracketScanStep = {
  tokenIndex: number;
  token: string;
  stackContents: string[]; // top of stack = last element
  queueContents: string[]; // front of queue = first element
  stackValid: boolean;
  queueValid: boolean;
  narration: string;
};

const CLOSER_FOR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
const isOpen = (t: string) => t === "(" || t === "[" || t === "{";
const isClose = (t: string) => t in CLOSER_FOR;

export const BRACKET_TOKENS = ["{", "[", "a", "+", "(", "b", "*", "c", ")", "]", "}"];

// Runs a REAL trace of both a stack-based and a queue-based bracket check
// over the same token sequence, so wherever they diverge is found by the
// simulation, not hand-picked to match a story decided in advance.
export function generateBracketScanSteps(tokens: string[]): BracketScanStep[] {
  const stack: string[] = [];
  const queue: string[] = [];
  let stackValid = true;
  let queueValid = true;
  const steps: BracketScanStep[] = [];

  tokens.forEach((token, i) => {
    let narration: string;
    if (isOpen(token)) {
      stack.push(token);
      queue.push(token);
      narration = `Push "${token}" onto both structures — an open bracket.`;
    } else if (isClose(token)) {
      if (stackValid) {
        const top = stack.pop();
        if (top !== CLOSER_FOR[token]) stackValid = false;
      }
      if (queueValid) {
        const front = queue.shift();
        if (front !== CLOSER_FOR[token]) queueValid = false;
      }
      narration = !stackValid
        ? `"${token}" — the stack already failed earlier.`
        : stackValid && !queueValid
          ? `Stack: "${token}" correctly matches the most recent open bracket. Queue: it just returned the OLDEST open bracket instead — wrong match.`
          : `"${token}" correctly matches the most recent open bracket on both.`;
    } else {
      narration = `"${token}" — not a bracket, ignored by both.`;
    }
    steps.push({
      tokenIndex: i,
      token,
      stackContents: [...stack],
      queueContents: [...queue],
      stackValid,
      queueValid,
      narration,
    });
  });

  return steps;
}
