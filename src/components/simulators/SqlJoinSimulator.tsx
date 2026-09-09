"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { generateJoinSteps, CUSTOMERS, ORDERS, type JoinedRow } from "@/lib/simulators/sqlJoinSteps";

function ResultTable({ name, rows, dotColor }: { name: string; rows: JoinedRow[]; dotColor: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-sm font-semibold text-ink">{name}</span>
        <span className="ml-auto rounded bg-line-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-faintest">
          {rows.length} row{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md bg-surface-sunk px-2 py-1 font-mono text-[11px]">
            <span className={r.customer ? "text-ink-secondary" : "text-ink-faintest"}>
              {r.customer ? r.customer.name : "NULL"}
            </span>
            <span className="text-ink-faintest">↔</span>
            <span className={r.order ? "text-ink-secondary" : "text-ink-faintest"}>
              {r.order ? `#${r.order.id} ${r.order.item}` : "NULL"}
            </span>
          </div>
        ))}
        {rows.length === 0 ? <p className="text-[11px] text-ink-faintest">no rows yet</p> : null}
      </div>
    </div>
  );
}

export default function SqlJoinSimulator() {
  const steps = useMemo(() => generateJoinSteps(CUSTOMERS, ORDERS), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">INNER vs. LEFT vs. RIGHT vs. FULL join</span>
          <span className="font-mono text-xs text-ink-faint">
            step {step + 1} of {steps.length}
          </span>
        </div>
        {current.comparingCustomer || current.comparingOrder ? (
          <div className="mb-3 rounded-lg bg-accent-soft px-3.5 py-2 font-mono text-xs text-accent">
            Comparing {current.comparingCustomer?.name ?? "—"} ↔ order{" "}
            {current.comparingOrder ? `#${current.comparingOrder.id}` : "—"}
            {current.isMatch ? " → MATCH" : ""}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ResultTable name="INNER JOIN" rows={current.inner} dotColor="var(--accent)" />
          <ResultTable name="LEFT JOIN" rows={current.left} dotColor="#c9925a" />
          <ResultTable name="RIGHT JOIN" rows={current.right} dotColor="var(--success)" />
          <ResultTable name="FULL OUTER JOIN" rows={current.full} dotColor="var(--error)" />
        </div>
        <p className="mt-3 rounded-lg bg-surface-sunk px-3.5 py-2.5 text-sm text-ink-secondary">
          {current.narration}
        </p>
      </div>
      <SimulatorControls
        currentStep={step}
        totalSteps={steps.length}
        onStepChange={setStep}
        playing={playing}
        onPlayToggle={setPlaying}
      />
    </div>
  );
}
