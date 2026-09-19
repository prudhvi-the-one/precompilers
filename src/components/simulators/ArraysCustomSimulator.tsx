"use client";

import { useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { useArraysSimulator } from "@/components/simulators/ArraysSimulatorContext";
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

function stepsFor(op: ArrayOp, arr: number[], index: number | null, value: number) {
  if (op === "insert") return generateInsertSteps(arr, index, value);
  if (op === "delete") return generateDeleteSteps(arr, index);
  if (op === "search") return generateSearchSteps(arr, value);
  return generateTraverseSteps(arr);
}

// The parent (ArraysSimulateShell) remounts this component with a fresh
// `key` on every new replay request, so a pending replay is only ever read
// here as an INITIAL value (lazy useState initializers) — never copied in
// via an effect, which would just be re-deriving state from a prop change.
export default function ArraysCustomSimulator() {
  const { replay } = useArraysSimulator();
  const [arr, setArr] = useState<number[]>(() => replay?.arr ?? DEFAULT_ARRAY);
  const [loadInput, setLoadInput] = useState(() => (replay?.arr ?? DEFAULT_ARRAY).join(", "));
  const [op, setOp] = useState<ArrayOp>(() => replay?.op ?? "insert");
  const [valueInput, setValueInput] = useState(() => (replay?.value !== undefined ? String(replay.value) : "4"));
  const [indexInput, setIndexInput] = useState(() => (replay?.index !== undefined ? String(replay.index) : "2"));
  const [steps, setSteps] = useState<ArrayOpStep[] | null>(() =>
    replay ? stepsFor(replay.op, replay.arr, replay.index ?? null, replay.value ?? 0).steps : null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [replayBanner, setReplayBanner] = useState(() => Boolean(replay));

  const clearSteps = () => {
    setSteps(null);
    setStepIndex(0);
    setPlaying(false);
  };

  function runOp() {
    const parsedIndex = indexInput.trim() === "" ? null : Number.parseInt(indexInput, 10);
    const parsedValue = Number.parseInt(valueInput, 10) || 0;
    const safeIndex = parsedIndex !== null && !Number.isNaN(parsedIndex) ? parsedIndex : null;
    const result = stepsFor(op, arr, safeIndex, parsedValue);
    setSteps(result.steps);
    setStepIndex(0);
    setPlaying(false);
    setArr(result.finalArr);
  }

  function loadArray() {
    const parsed = loadInput
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
      .slice(0, MAX_ARRAY_LENGTH);
    setArr(parsed.length ? parsed : [0]);
    clearSteps();
    setReplayBanner(false);
  }

  function resetArray() {
    setArr(DEFAULT_ARRAY);
    setLoadInput(DEFAULT_ARRAY.join(", "));
    clearSteps();
    setReplayBanner(false);
  }

  const current = steps ? steps[stepIndex] : null;
  const displayCells = current ? current.cells : arr;
  const marks = current?.marks ?? {};
  const parsedIndexForBadge = indexInput.trim() === "" ? null : Number.parseInt(indexInput, 10);
  const complexity = complexityFor(op, arr.length, Number.isNaN(parsedIndexForBadge ?? NaN) ? null : parsedIndexForBadge);
  const showValueField = op === "insert" || op === "search";
  const showIndexField = op === "insert" || op === "delete";

  return (
    <div className="space-y-4">
      {replayBanner ? (
        <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent-soft px-3.5 py-2.5 text-[12.5px] text-accent">
          <span>Replaying the exact scenario from that Challenge — step through it below.</span>
          <button type="button" onClick={() => setReplayBanner(false)} className="text-ink-faintest hover:text-ink-secondary">
            ✕
          </button>
        </div>
      ) : null}

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
            onClick={() => {
              runOp();
              setReplayBanner(false);
            }}
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
    </div>
  );
}
