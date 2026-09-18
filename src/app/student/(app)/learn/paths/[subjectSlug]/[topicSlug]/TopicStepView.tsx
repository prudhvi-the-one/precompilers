"use client";

import { useState, type ReactNode } from "react";
import { SimulateStepContext } from "./SimulateStepContext";

type Step = "learn" | "simulate" | "quiz";

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "learn", label: "Learn", number: 1 },
  { key: "simulate", label: "Simulate", number: 2 },
  { key: "quiz", label: "Quiz", number: 3 },
];

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
  const goNext = () => setStep(STEPS[Math.min(index + 1, STEPS.length - 1)].key);
  const content = step === "learn" ? learnContent : step === "simulate" ? simulateContent : quizContent;

  return (
    <SimulateStepContext.Provider value={{ goToSimulate: () => setStep("simulate") }}>

      {/* Step rail: reuses the path-tree's own connected-node visual language,
          since Learn -> Simulate -> Quiz genuinely is a sequence. */}
      <div className="flex max-w-[480px] items-start">
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
                    ? "border-2 border-transparent bg-success text-surface"
                    : i === index
                      ? "border-2 border-accent bg-accent-soft text-accent"
                      : "border-2 border-line bg-surface text-ink-faintest"
                }`}
              >
                {s.number}
              </span>
              <span className={`text-xs font-semibold ${i <= index ? "text-ink-secondary" : "text-ink-faintest"}`}>
                {s.label}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-7">{content}</div>

      <div className="mt-6 flex justify-end">
        {isLast ? (
          <a
            href={pathHref}
            className="rounded-lg bg-accent px-6 py-2.5 font-brand text-sm font-semibold text-surface hover:bg-accent-hover"
          >
            Finish
          </a>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 font-brand text-sm font-semibold text-surface hover:bg-accent-hover"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </SimulateStepContext.Provider>
  );
}
