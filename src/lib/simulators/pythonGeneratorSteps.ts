export type GeneratorStep = {
  listValues: number[] | null;
  generatorValues: number[];
  generatorExhausted: boolean;
  narration: string;
  done: boolean;
};

export const RANGE_N = 5;

// A real trace of eager (list comprehension) vs. lazy (generator expression)
// evaluation over [x*x for x in range(N)] vs (x*x for x in range(N)). The
// list lane computes everything in one real pass at creation time; the
// generator lane computes exactly one value per step, only when asked.
export function generateGeneratorSteps(n: number): GeneratorStep[] {
  const steps: GeneratorStep[] = [];

  steps.push({
    listValues: null,
    generatorValues: [],
    generatorExhausted: false,
    narration: "Neither has run yet. `[x*x for x in range(5)]` and `(x*x for x in range(5))` are both about to be created.",
    done: false,
  });

  const listValues: number[] = [];
  for (let x = 0; x < n; x++) listValues.push(x * x);
  steps.push({
    listValues,
    generatorValues: [],
    generatorExhausted: false,
    narration: `The list comprehension is eager — creating it runs the whole loop immediately: [${listValues.join(", ")}].`,
    done: false,
  });

  const generatorValues: number[] = [];
  for (let x = 0; x < n; x++) {
    generatorValues.push(x * x);
    steps.push({
      listValues,
      generatorValues: [...generatorValues],
      generatorExhausted: false,
      narration: `next() called on the generator — it computes x=${x}, yields ${x * x}, and pauses. Nothing beyond this has run yet.`,
      done: false,
    });
  }

  steps.push({
    listValues,
    generatorValues: [...generatorValues],
    generatorExhausted: true,
    narration: "next() called again — StopIteration. The generator computed one value at a time, only when asked; the list computed everything up front.",
    done: true,
  });

  return steps;
}
