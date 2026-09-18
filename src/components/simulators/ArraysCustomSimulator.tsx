"use client";

import { useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import {
  DEFAULT_ARRAY,
  MAX_ARRAY_LENGTH,
  formatAddress,
  complexityFor,
  generateInsertSteps,
  generateDeleteSteps,
  generateSearchSteps,
  generateTraverseSteps,
  type ArrayOp,
  type ArrayOpStep,
} from "@/lib/simulators/arrayOpsSteps";

const OPS: { key: ArrayOp; label: string }[] = [
  { key: "insert", label: "Insert" },
  { key: "delete", label: "Delete" },
  { key: "search", label: "Search" },
  { key: "traverse", label: "Traverse" },
];

function cellClass(cell: number | null, index: number, marks: ArrayOpStep["marks"]): string {
  if (cell === null) return "border border-dashed border-line-soft text-ink-faintest";
  if (marks.remove?.includes(index)) return "border-2 border-error bg-error-soft text-error";
  if (marks.found?.includes(index)) return "border-2 border-success bg-success-soft text-success";
  if (marks.target?.includes(index)) return "border-2 border-accent bg-accent-soft text-accent";
  if (marks.shift?.includes(index)) return "bg-warn-soft text-warn";
  return "bg-line-soft text-ink";
}

export default function ArraysCustomSimulator() {
  const [arr, setArr] = useState<number[]>(DEFAULT_ARRAY);
  const [loadInput, setLoadInput] = useState(DEFAULT_ARRAY.join(", "));
  const [op, setOp] = useState<ArrayOp>("insert");
  const [valueInput, setValueInput] = useState("4");
  const [indexInput, setIndexInput] = useState("2");
  const [steps, setSteps] = useState<ArrayOpStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [opCounts, setOpCounts] = useState<Record<ArrayOp, number>>({
    insert: 0,
    delete: 0,
    search: 0,
    traverse: 0,
  });

  const clearSteps = () => {
    setSteps(null);
    setStepIndex(0);
    setPlaying(false);
  };

  function runOp() {
    const parsedIndex = indexInput.trim() === "" ? null : Number.parseInt(indexInput, 10);
    const parsedValue = Number.parseInt(valueInput, 10) || 0;
    const safeIndex = parsedIndex !== null && !Number.isNaN(parsedIndex) ? parsedIndex : null;

    let result;
    if (op === "insert") {
      result = generateInsertSteps(arr, safeIndex, parsedValue);
    } else if (op === "delete") {
      result = generateDeleteSteps(arr, safeIndex);
    } else if (op === "search") {
      result = generateSearchSteps(arr, parsedValue);
    } else {
      result = generateTraverseSteps(arr);
    }

    setSteps(result.steps);
    setStepIndex(0);
    setPlaying(false);
    setArr(result.finalArr);
    setOpCounts((prev) => ({ ...prev, [op]: prev[op] + 1 }));
  }

  function loadArray() {
    const parsed = loadInput
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
      .slice(0, MAX_ARRAY_LENGTH);
    setArr(parsed.length ? parsed : [0]);
    clearSteps();
  }

  function resetArray() {
    setArr(DEFAULT_ARRAY);
    setLoadInput(DEFAULT_ARRAY.join(", "));
    clearSteps();
  }

  const current = steps ? steps[stepIndex] : null;
  const displayCells = current ? current.cells : arr;
  const marks = current?.marks ?? {};
  const parsedIndexForBadge = indexInput.trim() === "" ? null : Number.parseInt(indexInput, 10);
  const complexity = complexityFor(op, arr.length, Number.isNaN(parsedIndexForBadge ?? NaN) ? null : parsedIndexForBadge);
  const showValueField = op === "insert" || op === "search";
  const showIndexField = op === "insert" || op === "delete";
  const maxCount = Math.max(1, ...OPS.map((o) => opCounts[o.key]));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Array (base address {formatAddress(0)})</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              complexity === "O(1)" ? "bg-success-soft text-success" : "bg-error-soft text-error"
            }`}
          >
            {complexity}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayCells.map((v, i) => (
            <div key={i} className="w-14 shrink-0 text-center">
              <div className="mb-1 font-mono text-[10px] text-ink-faint">idx {i}</div>
              <div className={`flex h-11 items-center justify-center rounded-md font-mono text-sm font-semibold ${cellClass(v, i, marks)}`}>
                {v === null ? "·" : v}
              </div>
              <div className="mt-1 font-mono text-[9.5px] text-ink-faint">{formatAddress(i)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm text-ink-secondary">
          {current
            ? current.narration
            : "Load a starting array or run an operation below to see it animated here, step by step."}
        </div>

        {steps ? (
          <div className="mt-4">
            <SimulatorControls
              currentStep={stepIndex}
              totalSteps={steps.length}
              onStepChange={setStepIndex}
              playing={playing}
              onPlayToggle={setPlaying}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {OPS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                setOp(o.key);
                clearSteps();
              }}
              className={`rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold ${
                op === o.key ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-faint hover:text-ink-secondary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {showValueField ? (
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-faint">value</div>
              <input
                value={valueInput}
                onChange={(e) => {
                  setValueInput(e.target.value);
                  clearSteps();
                }}
                className="w-[74px] rounded-md border border-line bg-surface-sunk px-2.5 py-2 font-mono text-[12.5px] text-ink"
              />
            </div>
          ) : null}
          {showIndexField ? (
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-faint">index</div>
              <input
                value={indexInput}
                onChange={(e) => {
                  setIndexInput(e.target.value);
                  clearSteps();
                }}
                className="w-[74px] rounded-md border border-line bg-surface-sunk px-2.5 py-2 font-mono text-[12.5px] text-ink"
              />
            </div>
          ) : null}
          <button
            type="button"
            onClick={runOp}
            className="rounded-lg bg-accent px-4.5 py-2.5 text-[12.5px] font-semibold text-surface hover:bg-accent-hover"
          >
            Run {OPS.find((o) => o.key === op)?.label}
          </button>
          <button
            type="button"
            onClick={resetArray}
            className="rounded-lg border border-line px-3.5 py-2.5 text-[12px] text-ink-secondary"
          >
            Reset array
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line-soft pt-3.5">
          <span className="font-mono text-[10.5px] text-ink-faint">start from:</span>
          <input
            value={loadInput}
            onChange={(e) => setLoadInput(e.target.value)}
            className="w-[200px] rounded-md border border-line bg-surface-sunk px-2.5 py-2 font-mono text-[12.5px] text-ink"
          />
          <button type="button" onClick={loadArray} className="rounded-lg border border-line px-3.5 py-2 text-[12px] text-ink-secondary">
            Load
          </button>
          <span className="text-[11px] text-ink-faint">comma-separated, up to {MAX_ARRAY_LENGTH} values</span>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2.5 text-[12.5px] font-semibold text-ink">Operation mastery (this session)</div>
        <div className="flex flex-col gap-2.5">
          {OPS.map((o) => (
            <div key={o.key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[11.5px] text-ink-secondary">{o.label}</span>
              <div className="h-1.5 flex-grow overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.round((opCounts[o.key] / maxCount) * 100)}%` }}
                />
              </div>
              <span className="w-7 shrink-0 text-right font-mono text-[11px] text-ink-faint">{opCounts[o.key]}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-ink-faintest">
          Counts how many times you&apos;ve run each op this session — the real Progress tab (per-topic, persisted) is still on the roadmap.
        </p>
      </div>
    </div>
  );
}
