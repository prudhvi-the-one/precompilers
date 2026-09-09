"use client";

import { useState } from "react";
import SortRaceSimulator from "@/components/simulators/SortRaceSimulator";
import MergeSortTreeSimulator from "@/components/simulators/MergeSortTreeSimulator";

const TABS = [
  { key: "race", label: "Algorithm race" },
  { key: "deep-dive", label: "Merge sort deep dive" },
] as const;

export default function SortingSimulator() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("race");

  return (
    <div>
      <div className="mb-3 flex w-fit gap-1 rounded-lg bg-line-soft p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              tab === t.key ? "bg-surface text-ink" : "text-ink-faint"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "race" ? <SortRaceSimulator /> : <MergeSortTreeSimulator />}
    </div>
  );
}
