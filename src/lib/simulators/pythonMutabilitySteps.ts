export type PyObject = { id: string; kind: "list" | "tuple"; display: string };
export type PyVar = { name: string; objectId: string };

export type MutabilityStep = {
  laneVars: PyVar[];
  laneObjects: PyObject[];
  narration: string;
  done: boolean;
};

export type MutabilityLanes = { mutable: MutabilityStep[]; immutable: MutabilityStep[] };

// A real tiny memory model with genuine object identity, mirroring Python's
// own id()/is semantics — aliasing shares an id, mutation changes an
// object's display in place under the same id, rebinding creates a new id.
function generateLane(kind: "list" | "tuple"): MutabilityStep[] {
  const steps: MutabilityStep[] = [];
  let nextId = 1;
  const objects = new Map<string, PyObject>();
  const vars: PyVar[] = [];

  function snapshot(narration: string, done = false) {
    steps.push({
      laneVars: vars.map((v) => ({ ...v })),
      laneObjects: Array.from(objects.values()).map((o) => ({ ...o })),
      narration,
      done,
    });
  }

  const firstName = kind === "list" ? "a" : "x";
  const secondName = kind === "list" ? "b" : "y";
  const firstId = `O${nextId++}`;
  objects.set(firstId, { id: firstId, kind, display: kind === "list" ? "[1, 2, 3]" : "(1, 2, 3)" });
  vars.push({ name: firstName, objectId: firstId });
  snapshot(`${firstName} = ${objects.get(firstId)!.display} — a new ${kind} object is created.`);

  vars.push({ name: secondName, objectId: firstId });
  snapshot(`${secondName} = ${firstName} — ${secondName} points at the *same* object, not a copy.`);

  if (kind === "list") {
    const obj = objects.get(firstId)!;
    obj.display = "[1, 2, 3, 4]";
    snapshot(`${secondName}.append(4) — mutates the shared object in place. ${firstName} sees the change too, since it's the same object.`, true);
  } else {
    const newId = `O${nextId++}`;
    objects.set(newId, { id: newId, kind, display: "(1, 2, 3, 4)" });
    const yIndex = vars.findIndex((v) => v.name === secondName);
    vars[yIndex] = { name: secondName, objectId: newId };
    snapshot(`${secondName} = ${secondName} + (4,) — tuples can't be mutated, so this creates a *new* object and rebinds ${secondName}. ${firstName} still points at the original.`, true);
  }

  return steps;
}

export function generateMutabilitySteps(): MutabilityLanes {
  return {
    mutable: generateLane("list"),
    immutable: generateLane("tuple"),
  };
}
