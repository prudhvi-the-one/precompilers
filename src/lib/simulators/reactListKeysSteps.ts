export type ListItem = { id: string; label: string };
export type DomNode = { nodeRef: number; localValue: string };

export type ReconciledSlot = {
  itemId: string;
  itemLabel: string;
  domNode: DomNode;
};

export type ListKeysStep = {
  order: ListItem[];
  keyed: ReconciledSlot[];
  indexed: ReconciledSlot[];
  narration: string;
  mismatchIds: string[];
};

const INITIAL_ORDER: ListItem[] = [
  { id: "A", label: "Apple" },
  { id: "B", label: "Banana" },
  { id: "C", label: "Cherry" },
];

// Each item's uncontrolled input carries its own real, distinct draft text.
const INITIAL_VALUES: Record<string, string> = { A: "draft-Apple", B: "draft-Banana", C: "draft-Cherry" };

let nodeRefCounter = 0;
function freshNode(localValue: string): DomNode {
  nodeRefCounter += 1;
  return { nodeRef: nodeRefCounter, localValue };
}

// Real keyed reconciliation: look up the DOM node by matching id — the node
// (and its real localValue) travels with its logical item.
function reconcileByKey(prevSlots: ReconciledSlot[], newOrder: ListItem[]): ReconciledSlot[] {
  const byId = new Map(prevSlots.map((s) => [s.itemId, s.domNode]));
  return newOrder.map((item) => {
    const existing = byId.get(item.id);
    const domNode = existing ?? freshNode(INITIAL_VALUES[item.id]);
    return { itemId: item.id, itemLabel: item.label, domNode };
  });
}

// Real index reconciliation: look up the DOM node by its old position slot —
// nodes get reused by position, not identity.
function reconcileByIndex(prevSlots: ReconciledSlot[], newOrder: ListItem[]): ReconciledSlot[] {
  return newOrder.map((item, i) => {
    const existing = prevSlots[i]?.domNode;
    const domNode = existing ?? freshNode(INITIAL_VALUES[item.id]);
    return { itemId: item.id, itemLabel: item.label, domNode };
  });
}

export function generateListKeysSteps(): ListKeysStep[] {
  const steps: ListKeysStep[] = [];

  let keyedSlots = INITIAL_ORDER.map((item) => ({
    itemId: item.id,
    itemLabel: item.label,
    domNode: freshNode(INITIAL_VALUES[item.id]),
  }));
  let indexedSlots = INITIAL_ORDER.map((item) => ({
    itemId: item.id,
    itemLabel: item.label,
    domNode: freshNode(INITIAL_VALUES[item.id]),
  }));

  steps.push({
    order: INITIAL_ORDER,
    keyed: keyedSlots,
    indexed: indexedSlots,
    narration: "Initial render: Apple, Banana, Cherry — each with its own draft text typed into an uncontrolled input.",
    mismatchIds: [],
  });

  // Reorder: move Cherry to the front.
  const reordered: ListItem[] = [
    { id: "C", label: "Cherry" },
    { id: "A", label: "Apple" },
    { id: "B", label: "Banana" },
  ];

  keyedSlots = reconcileByKey(keyedSlots, reordered);
  indexedSlots = reconcileByIndex(indexedSlots, reordered);

  const mismatchIds = reordered
    .filter((item) => {
      const indexedSlot = indexedSlots.find((s) => s.itemId === item.id)!;
      return indexedSlot.domNode.localValue !== INITIAL_VALUES[item.id];
    })
    .map((item) => item.id);

  steps.push({
    order: reordered,
    keyed: keyedSlots,
    indexed: indexedSlots,
    narration:
      mismatchIds.length > 0
        ? `Cherry moves to the front. Keyed lane: each item's DOM node (and real draft text) moved with it — correct. Index lane: nodes stayed in their old slots, so ${mismatchIds
            .map((id) => reordered.find((r) => r.id === id)!.label)
            .join(", ")} now show the WRONG draft text — a real, computed mismatch.`
        : "Cherry moves to the front. Both lanes show correct draft text (no mismatch found).",
    mismatchIds,
  });

  return steps;
}
