export type CartItem = { id: string; label: string; price: number };
export type CartState = { items: CartItem[]; total: number };
export type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; id: string };

export type StoreStep = {
  lane: "reducer" | "mutation";
  action: CartAction;
  state: CartState;
  sameReferenceAsPrev: boolean;
  narration: string;
};

const REAL_ACTIONS: CartAction[] = [
  { type: "ADD_ITEM", item: { id: "apple", label: "Apple", price: 2 } },
  { type: "ADD_ITEM", item: { id: "banana", label: "Banana", price: 1 } },
  { type: "REMOVE_ITEM", id: "apple" },
];

// A real, pure reducer — always returns a genuinely new object.
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        items: [...state.items, action.item],
        total: state.items.reduce((sum, i) => sum + i.price, 0) + action.item.price,
      };
    case "REMOVE_ITEM": {
      const items = state.items.filter((i) => i.id !== action.id);
      return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
    }
    default:
      return state;
  }
}

// The anti-pattern: mutates the existing state object in place and returns
// the SAME reference — genuinely, not just described as such.
function cartMutator(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      state.items.push(action.item);
      state.total += action.item.price;
      return state;
    case "REMOVE_ITEM":
      state.items = state.items.filter((i) => i.id !== action.id);
      state.total = state.items.reduce((sum, i) => sum + i.price, 0);
      return state;
    default:
      return state;
  }
}

export function generateStoreReducerSteps(): { reducer: StoreStep[]; mutation: StoreStep[] } {
  const reducerSteps: StoreStep[] = [];
  let reducerState: CartState = { items: [], total: 0 };

  for (const action of REAL_ACTIONS) {
    const prevRef = reducerState;
    reducerState = cartReducer(reducerState, action);
    const sameRef = reducerState === prevRef;
    reducerSteps.push({
      lane: "reducer",
      action,
      state: reducerState,
      sameReferenceAsPrev: sameRef,
      narration: `${describeAction(action)} — reducer returns a NEW object (prevState === newState: ${sameRef}).`,
    });
  }

  const mutationSteps: StoreStep[] = [];
  let mutationState: CartState = { items: [], total: 0 };

  for (const action of REAL_ACTIONS) {
    const prevRef = mutationState;
    mutationState = cartMutator(mutationState, action);
    const sameRef = mutationState === prevRef;
    mutationSteps.push({
      lane: "mutation",
      action,
      state: { items: [...mutationState.items], total: mutationState.total },
      sameReferenceAsPrev: sameRef,
      narration: `${describeAction(action)} — mutator returns the SAME object (prevState === newState: ${sameRef}) even though the data changed.`,
    });
  }

  return { reducer: reducerSteps, mutation: mutationSteps };
}

function describeAction(action: CartAction): string {
  if (action.type === "ADD_ITEM") return `dispatch ADD_ITEM(${action.item.label})`;
  return `dispatch REMOVE_ITEM(${action.id})`;
}
