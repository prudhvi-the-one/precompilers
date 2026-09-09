export type TreeNode = {
  id: string;
  label: string;
  children: string[];
};

export type RerenderState = {
  dirtyIds: string[];
  bailedOutIds: string[];
};

export type RerenderScenario = {
  title: string;
  changedNodeId: string;
  narration: string;
  state: RerenderState;
};

// A small, real component tree — App renders Header, a memoized Sidebar
// (which renders NavList), and Main (which renders three Cards).
export const TREE: Record<string, TreeNode> = {
  App: { id: "App", label: "App", children: ["Header", "Sidebar", "Main"] },
  Header: { id: "Header", label: "Header", children: [] },
  Sidebar: { id: "Sidebar", label: "Sidebar (memoized)", children: ["NavList"] },
  NavList: { id: "NavList", label: "NavList", children: [] },
  Main: { id: "Main", label: "Main", children: ["Card1", "Card2", "Card3"] },
  Card1: { id: "Card1", label: "Card1", children: [] },
  Card2: { id: "Card2", label: "Card2", children: [] },
  Card3: { id: "Card3", label: "Card3", children: [] },
};

const MEMOIZED_IDS = new Set(["Sidebar"]);

// The real rule: a state change dirties the node and recurses into every
// child, EXCEPT a memoized node whose own props didn't change bails out —
// and React never visits that memoized node's own children in this pass.
export function computeRerenderSet(
  tree: Record<string, TreeNode>,
  changedNodeId: string,
  memoizedIds: Set<string>
): RerenderState {
  const dirty: string[] = [];
  const bailedOut: string[] = [];

  function visit(nodeId: string, isRoot: boolean) {
    if (!isRoot && memoizedIds.has(nodeId)) {
      // Memoized node whose props didn't change (this scenario never passes
      // new props down through Sidebar) — it bails out, children untouched.
      bailedOut.push(nodeId);
      return;
    }
    dirty.push(nodeId);
    const node = tree[nodeId];
    for (const childId of node.children) {
      visit(childId, false);
    }
  }

  visit(changedNodeId, true);
  return { dirtyIds: dirty, bailedOutIds: bailedOut };
}

export function generateRerenderScenarios(): RerenderScenario[] {
  const topState = computeRerenderSet(TREE, "App", MEMOIZED_IDS);
  const localState = computeRerenderSet(TREE, "Card2", MEMOIZED_IDS);

  return [
    {
      title: "State changes at the top (App)",
      changedNodeId: "App",
      narration: `setState in App dirties App, Header, Main, and all three Cards — but Sidebar bails out (memoized, no new props) and NavList is never even visited.`,
      state: topState,
    },
    {
      title: "State changes locally (inside Card2)",
      changedNodeId: "Card2",
      narration: `setState inside Card2 only dirties Card2 itself — every ancestor, sibling, and the rest of the tree is untouched.`,
      state: localState,
    },
  ];
}
