"use client";

import { useState } from "react";
import { generateRandomChallenge, type Challenge } from "@/lib/simulators/arrayChallenges";
import { SIMULATOR_PROGRESS_CONTENT } from "@/lib/simulators/progressConfig";
import { useArraysSimulator } from "@/components/simulators/ArraysSimulatorContext";

const SIMULATOR_KEY = "array-ops-custom";
const OPERATIONS = SIMULATOR_PROGRESS_CONTENT[SIMULATOR_KEY].operations;

type AnswerEvents = {
  xpGained: number;
  justMasteredOperation: string | null;
  completedQuests: string[];
  rankedUp: { from: string; to: string } | null;
};

export default function ArraysChallenges() {
  const { topicId, setProgress, requestReplay } = useArraysSimulator();
  const [challenge, setChallenge] = useState<Challenge>(() => generateRandomChallenge(OPERATIONS));
  const [picked, setPicked] = useState<number | null>(null);
  const [events, setEvents] = useState<AnswerEvents | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function pick(index: number) {
    if (picked !== null || submitting) return;
    setPicked(index);
    setSubmitting(true);
    const correct = index === challenge.correctIndex;
    try {
      const res = await fetch("/api/simulator-progress/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, operation: challenge.op, correct }),
      });
      if (res.ok) {
        const data = await res.json();
        setProgress({
          simulatorXp: data.simulatorXp,
          globalXpEarned: data.globalXpEarned,
          currentCorrectStreak: data.currentCorrectStreak,
          operations: data.operations,
          quests: data.quests,
          rank: data.rank,
        });
        setEvents(data.events);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setChallenge(generateRandomChallenge(OPERATIONS));
    setPicked(null);
    setEvents(null);
  }

  const wasCorrect = picked !== null && picked === challenge.correctIndex;
  const opLabel = challenge.op.charAt(0).toUpperCase() + challenge.op.slice(1);

  return (
    <div className="space-y-4">
      <p className="text-[11.5px] text-ink-faintest">
        Procedurally generated from the same engine as the Simulator — unlimited retries, no gate.
      </p>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-accent uppercase">
            {opLabel}
          </span>
        </div>

        <p className="mb-5 text-[14.5px] leading-relaxed text-ink">{challenge.prompt}</p>

        <div className="flex flex-col gap-2.5">
          {challenge.options.map((text, i) => {
            let cls = "border-line bg-surface-sunk text-ink-secondary hover:border-line-soft";
            if (picked !== null) {
              if (i === challenge.correctIndex) cls = "border-success bg-success-soft text-success";
              else if (i === picked) cls = "border-error bg-error-soft text-error";
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                className={`rounded-lg border-[1.5px] px-4 py-3 text-left font-mono text-[13px] ${cls}`}
              >
                {text}
              </button>
            );
          })}
        </div>

        {picked !== null ? (
          <div className={`mt-4 rounded-lg px-3.5 py-3 text-[12.5px] ${wasCorrect ? "bg-success-soft text-success" : "bg-error-soft text-error"}`}>
            <p className="font-semibold">{wasCorrect ? "Correct!" : "Not quite."}</p>
            <p className="mt-1 text-ink-secondary">
              {wasCorrect
                ? "Nice work — try the next one, or open the Simulator to explore variations yourself."
                : "That's OK — jump into the Simulator with this exact array and operation to see step by step where it actually goes."}
            </p>
            {!wasCorrect ? (
              <button
                type="button"
                onClick={() => requestReplay(challenge.replay)}
                className="mt-2.5 font-semibold text-accent hover:text-accent-hover"
              >
                ⚙ Try this exact scenario in the Simulator →
              </button>
            ) : null}
            {events && (events.xpGained > 0 || events.completedQuests.length > 0 || events.justMasteredOperation) ? (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line-soft pt-2.5">
                {events.xpGained > 0 ? (
                  <span className="rounded-md bg-warn-soft px-2 py-1 font-mono text-[11px] font-bold text-warn">
                    +{events.xpGained} Sim XP
                  </span>
                ) : null}
                {events.justMasteredOperation ? (
                  <span className="rounded-md bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent">
                    {events.justMasteredOperation} mastered!
                  </span>
                ) : null}
                {events.completedQuests.map((q) => (
                  <span key={q} className="rounded-md bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent">
                    Quest complete: {q}
                  </span>
                ))}
                {events.rankedUp ? (
                  <span className="rounded-md bg-success-soft px-2 py-1 text-[11px] font-bold text-success">
                    Rank up! {events.rankedUp.from} → {events.rankedUp.to}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-accent px-4.5 py-2.5 text-[12.5px] font-semibold text-surface hover:bg-accent-hover"
          >
            Next Challenge →
          </button>
        </div>
      </div>
    </div>
  );
}
