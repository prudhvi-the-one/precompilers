export type InsertFrontStep = {
  label: string;
  arrayValues: (number | null)[]; // null = not-yet-filled slot, shown as an empty box
  shiftedIndices: number[];
  listNodes: number[]; // current linked-list node order, front to back
  narration: string;
};

// A real insert-at-front is genuinely a single atomic operation for both
// structures — there's no meaningful sub-step to animate within it. What IS
// real and worth stepping through is the three-part story: before, mid
// (every existing element moves for the array; nothing moves for the list),
// after. Three steps, each a real, reachable state.
export function generateInsertFrontSteps(existing: number[], newValue: number): InsertFrontStep[] {
  return [
    {
      label: "Before",
      arrayValues: [...existing],
      shiftedIndices: [],
      listNodes: [...existing],
      narration: `Starting state: ${existing.length} elements, inserting ${newValue} at the front.`,
    },
    {
      label: "Mid-operation",
      arrayValues: [null, ...existing],
      shiftedIndices: existing.map((_, i) => i + 1),
      listNodes: [...existing],
      narration: "Array: every existing element copies one slot to the right. Linked list: nothing moves yet — only the new node is being created.",
    },
    {
      label: "After",
      arrayValues: [newValue, ...existing],
      shiftedIndices: [],
      listNodes: [newValue, ...existing],
      narration: `Array: ${existing.length} writes just to make room. Linked list: 2 pointer writes (new node's next, and head) — nothing else moved.`,
    },
  ];
}

export const LINKED_LIST_EXISTING = [3, 5, 8];
export const LINKED_LIST_NEW_VALUE = 0;
