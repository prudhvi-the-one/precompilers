"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CompanyQuestionInitialData = {
  companyName: string;
  category: "BEHAVIORAL" | "TECHNICAL" | "HR";
  question: string;
  guidance: string;
};

export default function CompanyQuestionForm({
  mode,
  companyQuestionId,
  initialData,
  variant = "mentor",
}: {
  mode: "create" | "edit";
  companyQuestionId?: string;
  initialData?: CompanyQuestionInitialData;
  variant?: "mentor" | "admin";
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "");
  const [category, setCategory] = useState<"BEHAVIORAL" | "TECHNICAL" | "HR">(
    initialData?.category ?? "BEHAVIORAL"
  );
  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [guidance, setGuidance] = useState(initialData?.guidance ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmitForReview =
    companyName.trim().length > 0 && question.trim().length > 0 && guidance.trim().length > 0;

  async function handleSave(submit: boolean) {
    setSubmitting(true);
    setError(null);
    const payload = {
      companyName: companyName.trim(),
      category,
      question: question.trim(),
      guidance: guidance.trim(),
      submit,
    };

    const basePath =
      variant === "admin" ? "/api/admin/company-questions" : "/api/mentor/company-questions";
    const url = mode === "create" ? basePath : `${basePath}/${companyQuestionId}`;
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
          <label className="text-sm font-medium text-gray-900">Company name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. TCS"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="mt-1.5 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
          >
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="TECHNICAL">Technical</option>
            <option value="HR">HR</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="e.g. Tell me about a time you handled conflict in a team."
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900">Guidance</label>
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          rows={5}
          className="mt-1.5 w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="How should a student approach answering this?"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        {variant === "mentor" ? (
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={submitting || companyName.trim().length === 0}
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            Save as draft
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting || !canSubmitForReview}
          className="flex-1 rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
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
