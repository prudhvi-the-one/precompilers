"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReleaseContentForm({
  vendorId,
  quizzes,
  problems,
}: {
  vendorId: string;
  quizzes: { id: string; title: string }[];
  problems: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [contentType, setContentType] = useState<"quiz" | "problem" | "external">("quiz");
  const [quizId, setQuizId] = useState(quizzes[0]?.id ?? "");
  const [problemId, setProblemId] = useState(problems[0]?.id ?? "");
  const [externalProblemSlug, setExternalProblemSlug] = useState("");
  const [windowMinutes, setWindowMinutes] = useState(720);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/vendors/${vendorId}/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: contentType === "quiz" ? quizId : undefined,
        problemId: contentType === "problem" ? problemId : undefined,
        externalProblemSlug: contentType === "external" ? externalProblemSlug : undefined,
        windowMinutes,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as "quiz" | "problem" | "external")}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="quiz">Quiz</option>
          <option value="problem">Problem</option>
          <option value="external">External (LeetCode)</option>
        </select>
      </div>
      {contentType === "external" ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">
            LeetCode problem slug
          </label>
          <input
            required
            placeholder="e.g. two-sum"
            value={externalProblemSlug}
            onChange={(e) => setExternalProblemSlug(e.target.value)}
            className="min-w-48 rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
      ) : contentType === "quiz" ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Quiz</label>
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="min-w-48 rounded-md border border-line px-3 py-2 text-sm"
          >
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Problem</label>
          <select
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
            className="min-w-48 rounded-md border border-line px-3 py-2 text-sm"
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">
          Solve window (minutes)
        </label>
        <input
          type="number"
          min={1}
          required
          value={windowMinutes}
          onChange={(e) => setWindowMinutes(Number(e.target.value))}
          className="w-28 rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Releasing…" : "Release now"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
