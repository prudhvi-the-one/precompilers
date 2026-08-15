import { daysBefore, toISTDateKey } from "@/lib/streak";

const WEEKS = 14;
const DAYS_PER_WEEK = 7;

function levelClass(count: number): string {
  if (count === 0) return "bg-line-soft";
  if (count === 1) return "bg-accent-soft";
  if (count <= 3) return "bg-accent/60";
  return "bg-accent";
}

export default function StreakHeatmap({
  activityByDay,
}: {
  activityByDay: Map<string, number>;
}) {
  const todayKey = toISTDateKey(new Date());
  const totalDays = WEEKS * DAYS_PER_WEEK;

  // Oldest day first, so columns read left (oldest) to right (today) like GitHub's graph.
  const dayKeys = Array.from({ length: totalDays }, (_, i) =>
    daysBefore(todayKey, totalDays - 1 - i)
  );

  const weeks: string[][] = [];
  for (let i = 0; i < dayKeys.length; i += DAYS_PER_WEEK) {
    weeks.push(dayKeys.slice(i, i + DAYS_PER_WEEK));
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((dayKey) => {
              const count = activityByDay.get(dayKey) ?? 0;
              return (
                <div
                  key={dayKey}
                  title={`${dayKey}: ${count} ${count === 1 ? "activity" : "activities"}`}
                  className={`h-2.5 w-2.5 rounded-[2px] ${levelClass(count)}`}
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
