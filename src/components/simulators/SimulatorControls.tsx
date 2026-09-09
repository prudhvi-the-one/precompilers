"use client";

import { useEffect, useRef } from "react";

export default function SimulatorControls({
  currentStep,
  totalSteps,
  onStepChange,
  playing,
  onPlayToggle,
}: {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  playing: boolean;
  onPlayToggle: (playing: boolean) => void;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      onStepChange(Math.min(currentStep + 1, totalSteps - 1));
    }, 900);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentStep, totalSteps]);

  useEffect(() => {
    if (currentStep >= totalSteps - 1) onPlayToggle(false);
  }, [currentStep, totalSteps, onPlayToggle]);

  return (
    <div>
      <div className="flex items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
          disabled={currentStep === 0}
          className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-line bg-surface text-ink-muted disabled:opacity-40"
          aria-label="Previous step"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5 9 12l10 7V5Z" />
            <path d="M5 5v14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onPlayToggle(!playing)}
          disabled={currentStep >= totalSteps - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
          ) : (
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7L7 5Z" /></svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => onStepChange(Math.min(currentStep + 1, totalSteps - 1))}
          disabled={currentStep >= totalSteps - 1}
          className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-line bg-surface text-ink-muted disabled:opacity-40"
          aria-label="Next step"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 5l10 7-10 7V5Z" />
            <path d="M19 5v14" />
          </svg>
        </button>
      </div>
      <div className="mt-3.5 flex justify-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onStepChange(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 w-1.5 rounded-full ${i <= currentStep ? "bg-accent" : "bg-line-soft"}`}
          />
        ))}
      </div>
    </div>
  );
}
