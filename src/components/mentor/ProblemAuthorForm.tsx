"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExampleDraft = { input: string; output: string; explanation: string };
type TestCaseDraft = { input: string; expectedOutput: string; isSample: boolean };

export type ProblemAuthorInitialData = {
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  tags: string;
  companies: string;
  statement: string;
  examples: ExampleDraft[];
  constraints: string;
  hints: string;
  solutionExplanation: string;
  requiredEntitlement: "FREE" | "INDIVIDUAL" | "INSTITUTION";
  testCases: TestCaseDraft[];
};

export default function ProblemAuthorForm({
  mode,
  problemId,
  initialData,
  variant = "mentor",
}: {
  mode: "create" | "edit";
  problemId?: string;
  initialData?: ProblemAuthorInitialData;
  variant?: "mentor" | "admin";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    initialData?.difficulty ?? "EASY"
  );
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? "");
  const [companies, setCompanies] = useState(initialData?.companies ?? "");
  const [statement, setStatement] = useState(initialData?.statement ?? "");
  const [examples, setExamples] = useState<ExampleDraft[]>(
    initialData?.examples ?? [{ input: "", output: "", explanation: "" }]
  );
  const [constraints, setConstraints] = useState(initialData?.constraints ?? "");
  const [hints, setHints] = useState(initialData?.hints ?? "");
  const [solutionExplanation, setSolutionExplanation] = useState(
    initialData?.solutionExplanation ?? ""
  );
  const [requiredEntitlement, setRequiredEntitlement] = useState<
    "FREE" | "INDIVIDUAL" | "INSTITUTION"
  >(initialData?.requiredEntitlement ?? "FREE");
  const [testCases, setTestCases] = useState<TestCaseDraft[]>(
    initialData?.testCases ?? [{ input: "", expectedOutput: "", isSample: true }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExample(index: number, patch: Partial<ExampleDraft>) {
    setExamples((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  function addExample() {
    setExamples((prev) => [...prev, { input: "", output: "", explanation: "" }]);
  }
  function removeExample(index: number) {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTestCase(index: number, patch: Partial<TestCaseDraft>) {
    setTestCases((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }
  function addTestCase() {
    setTestCases((prev) => [...prev, { input: "", expectedOutput: "", isSample: false }]);
  }
  function removeTestCase(index: number) {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  }

  const canSubmitForReview =
    title.trim().length > 0 &&
    category.trim().length > 0 &&
    statement.trim().length > 0 &&
    testCases.length > 0 &&
    testCases.some((t) => t.isSample) &&
    testCases.every((t) => t.input.trim().length > 0 && t.expectedOutput.trim().length > 0);

  async function handleSave(submit: boolean) {
    setSubmitting(true);
    setError(null);
    const payload = {
      title: title.trim(),
      difficulty,
      category: category.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      companies: companies
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      statement: statement.trim(),
      examples: examples
        .filter((e) => e.input.trim() || e.output.trim())
        .map((e) => ({ input: e.input.trim(), output: e.output.trim(), explanation: e.explanation.trim() })),
      constraints: constraints.trim(),
      hints: hints.trim(),
      solutionExplanation: solutionExplanation.trim(),
      requiredEntitlement,
      order: 0,
      submit,
      testCases: testCases.map((t) => ({
        input: t.input,
        expectedOutput: t.expectedOutput,
        isSample: t.isSample,
      })),
    };

    const basePath = variant === "admin" ? "/api/admin/problems" : "/api/mentor/problems";
    const url = mode === "create" ? basePath : `${basePath}/${problemId}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/content");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Longest Subarray with Sum K"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Arrays"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Required plan</label>
          <select
            value={requiredEntitlement}
            onChange={(e) => setRequiredEntitlement(e.target.value as typeof requiredEntitlement)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          >
            <option value="FREE">Free</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="INSTITUTION">Institution</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. array, sliding-window"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Companies (comma-separated)</label>
          <input
            value={companies}
            onChange={(e) => setCompanies(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Amazon, Google"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Statement</label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={6}
          className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="Describe the problem in full."
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Examples</p>
        {examples.map((example, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-line-soft bg-surface-sunk p-3 sm:grid-cols-3">
            <input
              value={example.input}
              onChange={(e) => updateExample(index, { input: e.target.value })}
              className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Input"
            />
            <input
              value={example.output}
              onChange={(e) => updateExample(index, { output: e.target.value })}
              className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Output"
            />
            <div className="flex gap-2">
              <input
                value={example.explanation}
                onChange={(e) => updateExample(index, { explanation: e.target.value })}
                className="flex-1 rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Explanation (optional)"
              />
              {examples.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addExample}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          + Add example
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-ink">Constraints</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Hints</label>
          <textarea
            value={hints}
            onChange={(e) => setHints(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Solution explanation</label>
          <textarea
            value={solutionExplanation}
            onChange={(e) => setSolutionExplanation(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Test cases</p>
        {testCases.map((testCase, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-line-soft bg-surface-sunk p-3 sm:grid-cols-4">
            <input
              value={testCase.input}
              onChange={(e) => updateTestCase(index, { input: e.target.value })}
              className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Input"
            />
            <input
              value={testCase.expectedOutput}
              onChange={(e) => updateTestCase(index, { expectedOutput: e.target.value })}
              className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Expected output"
            />
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={testCase.isSample}
                onChange={(e) => updateTestCase(index, { isSample: e.target.checked })}
              />
              Visible sample
            </label>
            {testCases.length > 1 ? (
              <button
                type="button"
                onClick={() => removeTestCase(index)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={addTestCase}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          + Add test case
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        {variant === "mentor" ? (
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={submitting || title.trim().length === 0}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink-secondary disabled:opacity-50"
          >
            Save as draft
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting || !canSubmitForReview}
          className="flex-1 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-50"
        >
          {submitting
            ? variant === "admin"
              ? "Publishing…"
              : "Saving…"
            : variant === "admin"
              ? "Publish"
              : "Submit for review"}
        </button>
      </div>
    </div>
  );
}
