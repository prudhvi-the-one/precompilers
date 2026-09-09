"use client";

import { useState } from "react";
import RateLimitSimulator from "@/components/simulators/RateLimitSimulator";
import PaginationSimulator from "@/components/simulators/PaginationSimulator";

const TABS = [
  { key: "rate-limit", label: "Rate limiting" },
  { key: "pagination", label: "Pagination" },
] as const;

export default function ApiRateLimitAndPaginationSimulator() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("rate-limit");

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
      {tab === "rate-limit" ? <RateLimitSimulator /> : <PaginationSimulator />}
    </div>
  );
}
