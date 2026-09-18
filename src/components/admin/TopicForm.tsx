"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopicForm({
  subjectId,
  nextOrder,
  quizOptions,
}: {
  subjectId: string;
  nextOrder: number;
  quizOptions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [xpReward, setXpReward] = useState(100);
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [linkedQuizId, setLinkedQuizId] = useState("");
  const [simulatorKey, setSimulatorKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        name,
        description,
        unitLabel: unitLabel || undefined,
        order,
        xpReward,
        difficulty,
        linkedQuizId: linkedQuizId || null,
        simulatorKey: simulatorKey || null,
        submit: true,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setDescription("");
    setUnitLabel("");
    setOrder(order + 1);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Topic name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="e.g. Joins"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Unit label</label>
          <input
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="e.g. Unit 1 · Foundations"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Description</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
          placeholder="Shown on the path node's detail card"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Simulator</label>
        <select
          value={simulatorKey}
          onChange={(e) => setSimulatorKey(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="">None yet</option>
          <option value="array-ops-custom">Arrays: custom insert/delete/search/traverse</option>
          <option value="sorting-comparison">Sorting comparison + deep dive</option>
          <option value="array-vs-list-insert">Array vs. linked list insert</option>
          <option value="stack-vs-queue">Stack vs. queue</option>
          <option value="bst-traversal">BST insert + inorder traversal</option>
          <option value="graph-bfs-dfs">Graph BFS traversal</option>
          <option value="recursion-and-dp">Recursion tree + naive vs. memoized</option>
          <option value="sql-join-comparison">SQL: INNER/LEFT/RIGHT/FULL join</option>
          <option value="sql-query-plan-deepdive">SQL: index seek vs. full scan</option>
          <option value="sql-isolation-comparison">SQL: isolation level comparison</option>
          <option value="git-commit-graph">Git: commit graph</option>
          <option value="git-merge-vs-rebase">Git: merge vs. rebase</option>
          <option value="git-conflict-detection">Git: merge conflict detection</option>
          <option value="python-mutability">Python: mutable vs. immutable</option>
          <option value="python-generator-vs-list">Python: list comprehension vs. generator</option>
          <option value="python-decorator-stack">Python: decorator call stack</option>
          <option value="api-auth-flow">API: OAuth authorization-code flow</option>
          <option value="api-rate-limit-pagination">API: rate limiting + pagination</option>
          <option value="api-idempotency">API: idempotency key dedup</option>
          <option value="sd-consistent-hashing">System Design: consistent hashing ring</option>
          <option value="sd-caching-comparison">System Design: caching (LRU vs. none)</option>
          <option value="sd-cap-theorem">System Design: CAP theorem (CP vs. AP)</option>
          <option value="containers-vs-vms">Cloud: containers vs. VMs boot cost</option>
          <option value="cicd-pipeline">Cloud: CI/CD pipeline DAG</option>
          <option value="k8s-scheduling">Cloud: Kubernetes scheduling + self-healing</option>
          <option value="react-rerender-tree">React: re-render propagation tree</option>
          <option value="react-list-keys">React: keyed vs. index-keyed list reorder</option>
          <option value="react-store-reducer">React: reducer vs. mutation (reference equality)</option>
          <option value="gradient-descent">AI/ML: gradient descent (converge vs. diverge)</option>
          <option value="nn-forward-pass">AI/ML: neural network forward pass</option>
          <option value="overfitting-comparison">AI/ML: underfit vs. good fit vs. overfit</option>
          <option value="ml-data-pipeline">MLOps: ETL pipeline (train → validate → deploy)</option>
          <option value="ml-drift-detection">MLOps: model drift detection</option>
          <option value="ml-canary-rollout">MLOps: canary rollout + rollback</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Order</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">XP reward</label>
          <input
            type="number"
            min={1}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Linked quiz</label>
          <select
            value={linkedQuizId}
            onChange={(e) => setLinkedQuizId(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          >
            <option value="">None yet</option>
            {quizOptions.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create topic"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
