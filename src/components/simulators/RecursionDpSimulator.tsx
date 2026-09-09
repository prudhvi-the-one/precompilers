"use client";

import { useState } from "react";
import RecursionTreeSimulator from "@/components/simulators/RecursionTreeSimulator";
import DpComparisonSimulator from "@/components/simulators/DpComparisonSimulator";

const TABS = [
  { key: "tree", label: "Naive recursion tree" },
  { key: "compare", label: "Naive vs memoized" },
] as const;

export default function RecursionDpSimulator() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("tree");

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
      {tab === "tree" ? <RecursionTreeSimulator /> : <DpComparisonSimulator />}
    </div>
  );
}
