"use client";

import { useState, type ReactNode } from "react";

type SimTab = "simulator" | "challenges" | "progress";

const TABS: { key: SimTab; label: string }[] = [
  { key: "simulator", label: "Simulator" },
  { key: "challenges", label: "Challenges" },
  { key: "progress", label: "Progress" },
];

// The three sub-views living inside the Simulate step (see the Arrays
// mockup, https://claude.ai/artifact/Cj1LjCuQhik1pUvr5e3zo2): a topic's
// custom Simulator, auto-generated Challenges built from that same engine,
// and per-operation Progress. None of these are gated by the Quiz — they
// stay separate from topic mastery.
export default function SimulateShell({
  simulatorContent,
  challengesContent,
  progressContent,
}: {
  simulatorContent: ReactNode;
  challengesContent: ReactNode;
  progressContent: ReactNode;
}) {
  const [tab, setTab] = useState<SimTab>("simulator");

  const content =
    tab === "simulator" ? simulatorContent : tab === "challenges" ? challengesContent : progressContent;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg border px-4 py-2 font-brand text-[12.5px] font-bold ${
              tab === t.key
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-surface text-ink-faint hover:text-ink-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-1 text-[11px] text-ink-faintest">
          All three live inside Simulate — Quiz stays separate
        </span>
      </div>
      {content}
    </div>
  );
}
