"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OptionDraft = { label: string; text: string; isCorrect: boolean };
type QuestionDraft = { text: string; marks: number; options: OptionDraft[] };
type SectionDraft = { name: string; durationMinutes: number; questions: QuestionDraft[] };

const OPTION_LABELS = ["A", "B", "C", "D"];

function emptyOptions(): OptionDraft[] {
  return OPTION_LABELS.map((label) => ({ label, text: "", isCorrect: false }));
}

function emptyQuestion(): QuestionDraft {
  return { text: "", marks: 1, options: emptyOptions() };
}

function emptySection(): SectionDraft {
  return { name: "", durationMinutes: 10, questions: [emptyQuestion()] };
}

export type QuizAuthorInitialData = {
  title: string;
  topic: string;
  kind: "TOPIC_QUIZ" | "APTITUDE_PAPER";
  requiredEntitlement: "FREE" | "INDIVIDUAL" | "INSTITUTION";
  sections: SectionDraft[];
};

export default function QuizAuthorForm({
  mode,
  quizId,
  initialData,
  variant = "mentor",
}: {
  mode: "create" | "edit";
  quizId?: string;
  initialData?: QuizAuthorInitialData;
  variant?: "mentor" | "admin";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [topic, setTopic] = useState(initialData?.topic ?? "");
  const [kind, setKind] = useState<"TOPIC_QUIZ" | "APTITUDE_PAPER">(
    initialData?.kind ?? "TOPIC_QUIZ"
  );
  const [requiredEntitlement, setRequiredEntitlement] = useState<
    "FREE" | "INDIVIDUAL" | "INSTITUTION"
  >(initialData?.requiredEntitlement ?? "FREE");
  const [sections, setSections] = useState<SectionDraft[]>(
    initialData?.sections ?? [emptySection()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSection(index: number, patch: Partial<SectionDraft>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateQuestion(sIndex: number, qIndex: number, patch: Partial<QuestionDraft>) {
    setSections((prev) =>
      prev.map((s, i) =>
        i !== sIndex
          ? s
          : { ...s, questions: s.questions.map((q, j) => (j === qIndex ? { ...q, ...patch } : q)) }
      )
    );
  }

  function updateOption(sIndex: number, qIndex: number, oIndex: number, text: string) {
    setSections((prev) =>
      prev.map((s, i) =>
        i !== sIndex
          ? s
          : {
              ...s,
              questions: s.questions.map((q, j) =>
                j !== qIndex
                  ? q
                  : {
                      ...q,
                      options: q.options.map((o, k) => (k === oIndex ? { ...o, text } : o)),
                    }
              ),
            }
      )
    );
  }

  function setCorrectOption(sIndex: number, qIndex: number, oIndex: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i !== sIndex
          ? s
          : {
              ...s,
              questions: s.questions.map((q, j) =>
                j !== qIndex
                  ? q
                  : { ...q, options: q.options.map((o, k) => ({ ...o, isCorrect: k === oIndex })) }
              ),
            }
      )
    );
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addQuestion(sIndex: number) {
    setSections((prev) =>
      prev.map((s, i) => (i !== sIndex ? s : { ...s, questions: [...s.questions, emptyQuestion()] }))
    );
  }

  function removeQuestion(sIndex: number, qIndex: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i !== sIndex ? s : { ...s, questions: s.questions.filter((_, j) => j !== qIndex) }
      )
    );
  }

  const canSubmitForReview =
    title.trim().length > 0 &&
    topic.trim().length > 0 &&
    sections.length > 0 &&
    sections.every(
      (s) =>
        s.name.trim().length > 0 &&
        s.durationMinutes > 0 &&
        s.questions.length > 0 &&
        s.questions.every(
          (q) =>
            q.text.trim().length > 0 &&
            q.options.length === 4 &&
            q.options.every((o) => o.text.trim().length > 0) &&
            q.options.filter((o) => o.isCorrect).length === 1
        )
    );

  async function handleSave(submit: boolean) {
    setSubmitting(true);
    setError(null);
    const payload = {
      title: title.trim(),
      topic: topic.trim(),
      kind,
      requiredEntitlement,
      order: 0,
      submit,
      sections: sections.map((s, sIndex) => ({
        name: s.name.trim(),
        durationMinutes: s.durationMinutes,
        order: sIndex,
        questions: s.questions.map((q, qIndex) => ({
          text: q.text.trim(),
          marks: q.marks,
          order: qIndex,
          options: q.options.map((o) => ({ label: o.label, text: o.text.trim(), isCorrect: o.isCorrect })),
        })),
      })),
    };

    const basePath = variant === "admin" ? "/api/admin/quizzes" : "/api/mentor/quizzes";
    const url = mode === "create" ? basePath : `${basePath}/${quizId}`;
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
            placeholder="e.g. Operating Systems — Core Concepts"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Operating Systems"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Kind</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          >
            <option value="TOPIC_QUIZ">Topic quiz</option>
            <option value="APTITUDE_PAPER">Aptitude paper</option>
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
      </div>

      <div className="space-y-5">
        {sections.map((section, sIndex) => (
          <div key={sIndex} className="rounded-xl border border-line bg-surface p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={section.name}
                  onChange={(e) => updateSection(sIndex, { name: e.target.value })}
                  className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
                  placeholder={`Section ${sIndex + 1} name`}
                />
                <input
                  type="number"
                  min={1}
                  value={section.durationMinutes}
                  onChange={(e) =>
                    updateSection(sIndex, { durationMinutes: Number(e.target.value) || 0 })
                  }
                  className="rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Duration (minutes)"
                />
              </div>
              {sections.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeSection(sIndex)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove section
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              {section.questions.map((question, qIndex) => (
                <div key={qIndex} className="rounded-lg border border-line-soft bg-surface-sunk p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(sIndex, qIndex, { text: e.target.value })}
                      rows={2}
                      className="flex-1 rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
                      placeholder={`Question ${qIndex + 1}`}
                    />
                    <input
                      type="number"
                      min={1}
                      value={question.marks}
                      onChange={(e) =>
                        updateQuestion(sIndex, qIndex, { marks: Number(e.target.value) || 1 })
                      }
                      className="w-20 rounded-md border border-line p-2 text-sm focus:border-black focus:outline-none"
                      title="Marks"
                    />
                    {section.questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeQuestion(sIndex, qIndex)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {question.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className="flex items-center gap-2 rounded-md border border-line bg-surface p-2"
                      >
                        <input
                          type="radio"
                          name={`correct-${sIndex}-${qIndex}`}
                          checked={option.isCorrect}
                          onChange={() => setCorrectOption(sIndex, qIndex, oIndex)}
                        />
                        <span className="text-xs font-semibold text-ink-faint">{option.label}</span>
                        <input
                          value={option.text}
                          onChange={(e) => updateOption(sIndex, qIndex, oIndex, e.target.value)}
                          className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                          placeholder={`Option ${option.label}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addQuestion(sIndex)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Add question
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addSection}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          + Add section
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
