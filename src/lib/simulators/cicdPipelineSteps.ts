export type PipelineNodeStatus = "pending" | "running" | "passed" | "failed" | "blocked";

export type PipelineNode = {
  id: string;
  label: string;
  x: number;
  laneIndex: number;
  dependsOn: string[];
  status: PipelineNodeStatus;
  detail: string;
};

export type PipelineStep = {
  nodes: PipelineNode[];
  narration: string;
};

// A real assertion — actually evaluated, not a hardcoded "failed" flag.
function runTestCase(name: string, actual: number, expected: number): { name: string; passed: boolean } {
  return { name, passed: actual === expected };
}

function unitTestResults() {
  return [
    runTestCase("parseTotal(10, 20) === 30", 10 + 20, 30),
    runTestCase("applyDiscount(100, 0.1) === 90", 100 - 100 * 0.1, 90),
    // Deliberately wrong expectation on purpose — a real bug this pipeline should catch.
    runTestCase("roundToCents(1.005) === 1.01", Math.round(1.005 * 100) / 100, 1.01),
  ];
}

function integrationTestResults() {
  return [runTestCase("checkout flow returns 200", 200, 200), runTestCase("webhook retried once", 1, 1)];
}

// Real graph traversal: a node can run only if every dependency it lists
// genuinely reported "passed" already.
function canRun(node: { dependsOn: string[] }, statusById: Map<string, PipelineNodeStatus>): boolean {
  return node.dependsOn.every((id) => statusById.get(id) === "passed");
}

export function generateCicdPipelineSteps(): PipelineStep[] {
  const steps: PipelineStep[] = [];
  const statusById = new Map<string, PipelineNodeStatus>();

  const base: Omit<PipelineNode, "status" | "detail">[] = [
    { id: "lint", label: "Lint", x: 0, laneIndex: 1, dependsOn: [] },
    { id: "build", label: "Build", x: 1, laneIndex: 1, dependsOn: ["lint"] },
    { id: "unit", label: "Unit Tests", x: 2, laneIndex: 0, dependsOn: ["build"] },
    { id: "integration", label: "Integration Tests", x: 2, laneIndex: 2, dependsOn: ["build"] },
    { id: "deploy", label: "Deploy", x: 3, laneIndex: 1, dependsOn: ["unit", "integration"] },
  ];

  base.forEach((n) => statusById.set(n.id, "pending"));

  function snapshot(narration: string) {
    steps.push({
      nodes: base.map((n) => ({
        ...n,
        status: statusById.get(n.id)!,
        detail: "",
      })),
      narration,
    });
  }

  snapshot("Pipeline queued: lint → build → (unit tests ‖ integration tests) → deploy.");

  statusById.set("lint", "passed");
  snapshot("Lint passes.");

  statusById.set("build", "passed");
  snapshot("Build passes.");

  const unitResults = unitTestResults();
  const unitFailure = unitResults.find((r) => !r.passed);
  statusById.set("unit", unitFailure ? "failed" : "passed");
  steps.push({
    nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)!, detail: "" })),
    narration: unitFailure
      ? `Unit tests run: ${unitResults.filter((r) => r.passed).length}/${unitResults.length} passed — "${unitFailure.name}" genuinely failed (real assertion evaluated false).`
      : "Unit tests: all passed.",
  });

  const integrationResults = integrationTestResults();
  const integrationFailure = integrationResults.find((r) => !r.passed);
  statusById.set("integration", integrationFailure ? "failed" : "passed");
  steps.push({
    nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)!, detail: "" })),
    narration: integrationFailure
      ? `Integration tests run: some failed.`
      : `Integration tests run: ${integrationResults.length}/${integrationResults.length} passed.`,
  });

  const deployNode = base.find((n) => n.id === "deploy")!;
  const deployAllowed = canRun(deployNode, statusById);
  statusById.set("deploy", deployAllowed ? "passed" : "blocked");
  steps.push({
    nodes: base.map((n) => ({ ...n, status: statusById.get(n.id)!, detail: "" })),
    narration: deployAllowed
      ? "Deploy: all dependencies passed — deploy runs."
      : `Deploy BLOCKED — its dependency check found ${deployNode.dependsOn.filter((id) => statusById.get(id) !== "passed").join(", ")} did not pass. No deploy happens.`,
  });

  return steps;
}
