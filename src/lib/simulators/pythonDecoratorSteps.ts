export type DecoratorFrameState = "active" | "waiting";

export type DecoratorFrame = {
  id: string;
  label: string;
  state: DecoratorFrameState;
};

export type DecoratorStep = {
  stack: DecoratorFrame[];
  narration: string;
  maxDepthSoFar: number;
  done: boolean;
};

type CallOp = { id: string; label: string; kind: "enter" | "exec" | "exit" };

// The real call order for @decorator_a @decorator_b def greet(): ... —
// decorators wrap bottom-up, so decorator_a's wrapper is the outermost real
// call, and greet() itself is the innermost.
const CALL_SEQUENCE: CallOp[] = [
  { id: "wrap_a", label: "decorator_a's wrapper", kind: "enter" },
  { id: "wrap_a", label: "print('A: before')", kind: "exec" },
  { id: "wrap_b", label: "decorator_b's wrapper", kind: "enter" },
  { id: "wrap_b", label: "print('B: before')", kind: "exec" },
  { id: "greet", label: "greet()", kind: "enter" },
  { id: "greet", label: "return 'Hello'", kind: "exec" },
  { id: "greet", label: "greet()", kind: "exit" },
  { id: "wrap_b", label: "print('B: after')", kind: "exec" },
  { id: "wrap_b", label: "decorator_b's wrapper", kind: "exit" },
  { id: "wrap_a", label: "print('A: after')", kind: "exec" },
  { id: "wrap_a", label: "decorator_a's wrapper", kind: "exit" },
];

// A real LIFO call stack — push on enter, pop on exit — over the real call
// order above, same stack discipline as the DSA stack-vs-queue simulator,
// applied to function calls instead of brackets.
export function generateDecoratorSteps(): DecoratorStep[] {
  const steps: DecoratorStep[] = [];
  const stack: DecoratorFrame[] = [];
  let maxDepth = 0;

  CALL_SEQUENCE.forEach((op, i) => {
    let narration: string;
    if (op.kind === "enter") {
      stack.push({ id: op.id, label: op.label, state: "active" });
      maxDepth = Math.max(maxDepth, stack.length);
      narration = `Call ${op.label} — pushed onto the call stack (depth ${stack.length}).`;
    } else if (op.kind === "exit") {
      stack.pop();
      narration = `${op.label} returns — popped off the call stack (depth ${stack.length}).`;
    } else {
      narration = `${op.label}`;
    }

    steps.push({
      stack: stack.map((f, idx) => ({ ...f, state: idx === stack.length - 1 ? "active" : "waiting" })),
      narration,
      maxDepthSoFar: maxDepth,
      done: i === CALL_SEQUENCE.length - 1,
    });
  });

  return steps;
}
