"use client";

import { useState, type ReactNode } from "react";

type Step = "learn" | "simulate" | "quiz";

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "learn", label: "Learn", number: 1 },
  { key: "simulate", label: "Simulate", number: 2 },
  { key: "quiz", label: "Quiz", number: 3 },
];

const CONTENT_WIDTH: Record<Step, string> = {
  learn: "max-w-[620px]",
  simulate: "",
  quiz: "max-w-[480px]",
};

export default function TopicStepView({
  pathHref,
  learnContent,
  simulateContent,
  quizContent,
}: {
  pathHref: string;
  learnContent: ReactNode;
  simulateContent: ReactNode;
  quizContent: ReactNode;
}) {
  const [step, setStep] = useState<Step>("learn");
  const index = STEPS.findIndex((s) => s.key === step);
  const isLast = index === STEPS.length - 1;
  const content = step === "learn" ? learnContent : step === "simulate" ? simulateContent : quizContent;

  return (
    <>
      {/* Step rail: reuses the path-tree's own connected-node visual language,
          since Learn -> Simulate -> Quiz genuinely is a sequence. */}
      <div className="mt-7 flex max-w-[480px] items-center">
        {STEPS.map((s, i) => (
          <div key={s.key} className="contents">
            {i > 0 ? (
              <div className={`mx-[-6px] mb-[22px] h-0.5 min-w-6 flex-1 ${i <= index ? "bg-success" : "bg-line"}`} />
            ) : null}
            <button
              type="button"
              onClick={() => setStep(s.key)}
              className="flex w-[92px] shrink-0 cursor-pointer flex-col items-center gap-1.5 bg-transparent"
            >
              <span
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full font-brand text-[13px] font-bold ${
                  i < index
                    ? "border-2 border-transparent bg-success text-white"
                    : i === index
                      ? "border-2 border-accent bg-accent-soft text-accent"
                      : "border-2 border-line bg-surface text-ink-faint"
                }`}
              >
                {s.number}
              </span>
              <span className={`text-xs font-semibold ${i <= index ? "text-ink" : "text-ink-faint"}`}>
                {s.label}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-7 ${CONTENT_WIDTH[step]}`}>{content}</div>

      <div className="mt-6 flex justify-end">
        {isLast ? (
          <a
            href={pathHref}
            className="rounded-lg bg-ink px-6 py-2.5 font-brand text-sm font-semibold text-surface"
          >
            Finish
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setStep(STEPS[index + 1].key)}
            className="cursor-pointer rounded-lg bg-ink px-6 py-2.5 font-brand text-sm font-semibold text-surface"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </>
  );
}
