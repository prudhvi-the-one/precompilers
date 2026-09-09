"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generatePaginationLanes, type PaginationLane, type ListItem } from "@/lib/simulators/apiPaginationSteps";

function ItemChip({ item, isDuplicate }: { item: ListItem; isDuplicate: boolean }) {
  return (
    <span
      className={`rounded-md border px-2 py-1 font-mono text-[11px] font-semibold ${
        isDuplicate ? "border-error bg-error-soft text-error" : "border-line bg-surface-sunk text-ink-secondary"
      }`}
    >
      #{item.id}
    </span>
  );
}

function Lane({ name, lane, upToPage }: { name: string; lane: PaginationLane; upToPage: number }) {
  const visiblePages = lane.pages.slice(0, upToPage + 1);
  const seenBeforeLastPage = new Set(
    visiblePages.slice(0, -1).flatMap((p) => p.items.map((i) => i.id))
  );
  const lastPage = visiblePages[visiblePages.length - 1];

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{name}</span>
        {upToPage === lane.pages.length - 1 ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              lane.anomaly.kind === "none" ? "bg-success-soft text-success" : "bg-error-soft text-error"
            }`}
          >
            {lane.anomaly.kind === "none" ? "no anomaly" : lane.anomaly.kind}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        {visiblePages.map((p) => (
          <div key={p.pageNumber}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-faint">page {p.pageNumber}</span>
              {p.hadInsertBeforeThisPage ? (
                <span className="rounded-full bg-warn-soft px-1.5 py-0.5 text-[10px] font-semibold text-warn">
                  new item inserted before this fetch
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.items.map((item) => (
                <ItemChip
                  key={`${p.pageNumber}-${item.id}`}
                  item={item}
                  isDuplicate={p === lastPage && seenBeforeLastPage.has(item.id)}
                />
              ))}
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-faint">{p.query}</p>
          </div>
        ))}
      </div>
      {upToPage === lane.pages.length - 1 ? (
        <p className="mt-2.5 text-xs text-ink-muted">{lane.anomaly.detail}</p>
      ) : null}
    </div>
  );
}

export default function PaginationSimulator() {
  const lanes = useMemo(() => generatePaginationLanes(), []);
  const totalSteps = lanes.offset.pages.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
        A 10-item feed, 3 items per page. A new item is inserted at the front between page 1 and page 2.
      </p>
      <Lane name="Offset-based (LIMIT / OFFSET)" lane={lanes.offset} upToPage={step} />
      <Lane name="Cursor-based (WHERE id &lt; lastSeenId)" lane={lanes.cursor} upToPage={step} />
      <SimulatorControls
        currentStep={step}
        totalSteps={totalSteps}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
