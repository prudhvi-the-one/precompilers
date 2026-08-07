"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  {
    value: "SOFTWARE_ENGINEER",
    label: "Software engineer",
    description: "DSA, backend, system basics",
  },
  {
    value: "DATA_ML_ENGINEER",
    label: "Data / ML engineer",
    description: "Python, SQL, ML pipelines",
  },
  {
    value: "FRONTEND_ENGINEER",
    label: "Frontend engineer",
    description: "React, Angular, JS depth",
  },
  {
    value: "CLOUD_DEVOPS",
    label: "Cloud / DevOps",
    description: "AWS, Azure, CI/CD",
  },
  {
    value: "HIGHER_STUDIES",
    label: "Higher studies",
    description: "Fundamentals and research",
  },
  {
    value: "NOT_SURE",
    label: "Not sure yet",
    description: "A mentor will help you pick",
  },
] as const;

const HOURS_OPTIONS = ["Under 5", "5–10", "10–20", "20+"];

const currentYear = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 4 }, (_, i) => currentYear + i);

export default function OnboardingForm({
  initialGradYear,
  initialWeeklyHours,
}: {
  initialGradYear: number | null;
  initialWeeklyHours: string | null;
}) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState<string | null>(null);
  const [gradYear, setGradYear] = useState<number | null>(
    initialGradYear ?? null
  );
  const [weeklyHours, setWeeklyHours] = useState<string | null>(
    initialWeeklyHours ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetRole) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/enrollment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, gradYear, weeklyHours }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(
      data.enrolledTrackSlug
        ? `/learn?enrolled=${data.enrolledTrackSlug}`
        : "/learn"
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-brand text-[32px] font-bold tracking-[-0.02em] text-[#0F1020]">
        What are you working towards?
      </h1>
      <p className="mt-2 text-[15px] text-[#55556B]">
        This sets your track and what your mentor sees. You can change it any
        time.
      </p>

      <p className="mt-8 font-mono text-[10px] tracking-[0.1em] text-[#8A8AA0] uppercase">
        Target role
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map((role) => {
          const selected = targetRole === role.value;
          return (
            <button
              type="button"
              key={role.value}
              onClick={() => setTargetRole(role.value)}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-indigo-600 bg-[#F6F5FF]"
                  : "border-[#E6E6EF] hover:border-[#DDD9FB]"
              }`}
            >
              <div className="font-brand text-[15px] font-bold text-[#0F1020]">
                {role.label}
              </div>
              <div className="mt-0.5 text-[13px] text-[#8A8AA0]">
                {role.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-[#8A8AA0] uppercase">
            Graduating in
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GRAD_YEARS.map((year) => (
              <button
                type="button"
                key={year}
                onClick={() => setGradYear(year)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  gradYear === year
                    ? "border-indigo-600 text-indigo-600"
                    : "border-[#E6E6EF] text-[#2A2A38] hover:border-[#DDD9FB]"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-[#8A8AA0] uppercase">
            Hours you can give per week
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {HOURS_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setWeeklyHours(option)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  weeklyHours === option
                    ? "border-indigo-600 text-indigo-600"
                    : "border-[#E6E6EF] text-[#2A2A38] hover:border-[#DDD9FB]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 flex items-center gap-4 border-t border-[#EDEDF3] pt-6">
        <button
          type="submit"
          disabled={!targetRole || loading}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 font-brand text-sm font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
        <span className="text-[13px] text-[#8A8AA0]">
          You can update this anytime from your profile.
        </span>
      </div>
    </form>
  );
}
