"use client";

import { useMemo, useState } from "react";
import SimulatorControls from "@/components/simulators/SimulatorControls";
import { RACE_INPUT, generateBubbleSortSteps, generateInsertionSortSteps, summarizeMergeSort } from "@/lib/simulators/sortSteps";

const MAX_VALUE = 8;
const barHeight = (v: number) => Math.round((v / MAX_VALUE) * 64) + 12;

function Lane({
  name,
  complexity,
  dotColor,
  array,
  highlightIndices,
  comparisons,
  writes,
  done,
  narration,
}: {
  name: string;
  complexity: string;
  dotColor: string;
  array: number[];
  highlightIndices: number[];
  comparisons: number;
  writes: number;
  done: boolean;
  narration: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <span className="text-sm font-semibold text-ink">{name}</span>
          <span className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-faintest">
            {complexity}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-muted">{comparisons} compares</span>
          <span className="font-mono text-xs text-ink-muted">{writes} writes</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              done ? "bg-success-soft text-success" : "bg-warn-soft text-warn"
            }`}
          >
            {done ? "FINISHED" : "RUNNING"}
          </span>
        </div>
      </div>
      <div className="flex h-20 items-end gap-1.5">
        {array.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${highlightIndices.includes(i) ? "bg-accent" : "bg-accent-soft"}`}
            style={{ height: barHeight(v) }}
          />
        ))}
      </div>
      <p className="mt-2.5 text-xs text-ink-muted">{narration}</p>
    </div>
  );
}

export default function SortRaceSimulator() {
  const bubbleSteps = useMemo(() => generateBubbleSortSteps(RACE_INPUT), []);
  const insertionSteps = useMemo(() => generateInsertionSortSteps(RACE_INPUT), []);
  const mergeSummary = useMemo(() => summarizeMergeSort(RACE_INPUT), []);

  const totalSteps = Math.max(bubbleSteps.length, insertionSteps.length);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const bubble = bubbleSteps[Math.min(step, bubbleSteps.length - 1)];
  const insertion = insertionSteps[Math.min(step, insertionSteps.length - 1)];

  return (
    <div className="space-y-3">
      <Lane
        name="Merge Sort"
        complexity="O(n log n)"
        dotColor="var(--accent)"
        array={mergeSummary.array}
        highlightIndices={[]}
        comparisons={mergeSummary.comparisons}
        writes={mergeSummary.writes}
        done
        narration="Finished — every element only ever gets compared against its immediate merge partner. See the Merge sort deep dive tab for how."
      />
      <Lane
        name="Insertion Sort"
        complexity="O(n²)"
        dotColor="#c9925a"
        array={insertion.array}
        highlightIndices={insertion.highlightIndices}
        comparisons={insertion.comparisons}
        writes={insertion.writes}
        done={insertion.done}
        narration={insertion.narration}
      />
      <Lane
        name="Bubble Sort"
        complexity="O(n²)"
        dotColor="var(--error)"
        array={bubble.array}
        highlightIndices={bubble.highlightIndices}
        comparisons={bubble.comparisons}
        writes={bubble.writes}
        done={bubble.done}
        narration={bubble.narration}
      />
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
