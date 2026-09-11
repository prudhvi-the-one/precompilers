"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { daysBefore, toISTDateKey } from "@/lib/streak";

const DAYS_PER_WEEK = 7;
const CELL_SIZE = 12;
const CELL_GAP = 4;
const MIN_WEEKS = 14;

function levelClass(count: number): string {
  if (count === 0) return "bg-line-soft";
  if (count === 1) return "bg-accent-soft";
  if (count <= 3) return "bg-accent/60";
  return "bg-accent";
}

export default function StreakHeatmap({
  activityByDay,
  currentStreak,
  longestStreak,
}: {
  activityByDay: [string, number][];
  currentStreak: number;
  longestStreak: number;
}) {
  const activityMap = new Map(activityByDay);
  const containerRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState(MIN_WEEKS);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.getBoundingClientRect().width;
      setWeeks(Math.max(MIN_WEEKS, Math.floor(width / (CELL_SIZE + CELL_GAP))));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const todayKey = toISTDateKey(new Date());
  const totalDays = weeks * DAYS_PER_WEEK;

  // Oldest day first, so columns read left (oldest) to right (today) like GitHub's graph.
  const dayKeys = Array.from({ length: totalDays }, (_, i) =>
    daysBefore(todayKey, totalDays - 1 - i)
  );

  const weekColumns: string[][] = [];
  for (let i = 0; i < dayKeys.length; i += DAYS_PER_WEEK) {
    weekColumns.push(dayKeys.slice(i, i + DAYS_PER_WEEK));
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Image
          src="/student-home/streak-flame.png"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
        />
        <div>
          <div className="font-brand text-xl font-bold text-ink">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </div>
          <div className="text-xs text-ink-faint">Longest streak: {longestStreak} days</div>
        </div>
      </div>

      <div ref={containerRef} className="mt-4 flex gap-1 overflow-x-auto pb-1" style={{ gap: CELL_GAP }}>
        {weekColumns.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col" style={{ gap: CELL_GAP }}>
            {week.map((dayKey) => {
              const count = activityMap.get(dayKey) ?? 0;
              return (
                <div
                  key={dayKey}
                  title={`${dayKey}: ${count} ${count === 1 ? "activity" : "activities"}`}
                  className={`rounded-[2px] ${levelClass(count)}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-faintest">
        <span>Less</span>
        <div className="h-2.5 w-2.5 rounded-[2px] bg-line-soft" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-accent-soft" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-accent/60" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-accent" />
        <span>More</span>
      </div>
    </div>
  );
}
