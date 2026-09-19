"use client";

import { useArraysSimulator } from "@/components/simulators/ArraysSimulatorContext";
import { SIMULATOR_PROGRESS_CONTENT, rankForXp } from "@/lib/simulators/progressConfig";

const SIMULATOR_KEY = "array-ops-custom";
const CONTENT = SIMULATOR_PROGRESS_CONTENT[SIMULATOR_KEY];

const OP_LABELS: Record<string, string> = {
  insert: "Insert",
  delete: "Delete",
  search: "Search",
  traverse: "Traverse",
};

function levelBadge(attempts: number, correct: number, mastered: boolean) {
  if (mastered) return { label: "Mastered", cls: "bg-success-soft text-success" };
  if (attempts > 0) return { label: "Practicing", cls: "bg-warn-soft text-warn" };
  return { label: "Not started", cls: "bg-line-soft text-ink-faintest" };
}

export default function ArraysProgress() {
  const { progress } = useArraysSimulator();
  const { name: rankName, currentThreshold, next } = rankForXp(SIMULATOR_KEY, progress.simulatorXp);
  const tierPct = next
    ? Math.max(4, Math.min(100, Math.round(((progress.simulatorXp - currentThreshold) / (next.threshold - currentThreshold)) * 100)))
    : 100;

  const totalAttempts = Object.values(progress.operations).reduce((s, o) => s + o.attempts, 0);
  const totalCorrect = Object.values(progress.operations).reduce((s, o) => s + o.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const masteredCount = Object.values(progress.operations).filter((o) => o.mastered).length;

  const questList = CONTENT.quests.map((q) => ({ ...q, done: progress.quests[q.key] }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-accent/35 bg-gradient-to-br from-accent-soft to-transparent p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10.5px] font-bold tracking-wide text-ink-faint uppercase">Simulator Rank</div>
            <div className="mt-1 font-brand text-xl font-extrabold text-accent">{rankName}</div>
          </div>
          {next ? (
            <div className="text-right font-mono text-xs text-ink-faint">
              {progress.simulatorXp} / {next.threshold} XP
              <div className="text-[10.5px]">to {next.name}</div>
            </div>
          ) : (
            <div className="text-right font-mono text-xs text-ink-faint">{progress.simulatorXp} XP · max rank</div>
          )}
        </div>
        <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-line-soft">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400" style={{ width: `${tierPct}%` }} />
        </div>
        <p className="mt-3 text-[11px] text-ink-faintest">
          Its own world, earned entirely inside this simulator. Ladder: {CONTENT.ranks.map((r) => r.name).join(" → ")}.
        </p>
      </div>

      <div className="flex gap-7 rounded-xl border border-line bg-surface p-5">
        <div>
          <div className="font-mono text-lg font-bold text-ink">{totalAttempts}</div>
          <div className="text-[11px] text-ink-faint">Challenges attempted</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold text-success">{accuracy}%</div>
          <div className="text-[11px] text-ink-faint">Overall accuracy</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold text-accent">
            {masteredCount} / {CONTENT.operations.length}
          </div>
          <div className="text-[11px] text-ink-faint">Operations mastered</div>
        </div>
      </div>

      <div className="rounded-xl border border-warn/35 bg-gradient-to-r from-warn-soft to-transparent p-4.5">
        <p className="text-[12.5px] font-semibold text-ink">
          {progress.globalXpEarned} XP also credited to your real Level
        </p>
        <p className="mt-1 text-[11.5px] text-ink-muted">
          10% of Simulator XP trickles up to the topbar Level — grinding here can&apos;t inflate your real XP.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[12.5px] font-bold text-ink">Quests</div>
          <span className="text-[11px] text-ink-faint">
            {questList.filter((q) => q.done).length} of {questList.length} complete
          </span>
        </div>
        <p className="mb-4 text-[11px] text-ink-faintest">One-time objectives, separate from operation mastery.</p>
        <div className="flex flex-col gap-2.5">
          {questList.map((q) => (
            <div key={q.key} className="flex items-center gap-3.5 rounded-lg border border-line-soft bg-surface-sunk p-3.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                  q.done ? "bg-success-soft text-success" : "bg-line-soft text-ink-faintest"
                }`}
              >
                {q.done ? "✓" : "○"}
              </span>
              <div className="flex-grow">
                <div className="text-[13px] font-semibold text-ink">{q.title}</div>
                <div className="text-[11.5px] text-ink-faint">{q.description}</div>
              </div>
              <span className="shrink-0 rounded-md bg-warn-soft px-2 py-1 font-mono text-[11px] font-bold text-warn">+{q.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 text-[12.5px] font-bold text-ink">Operation mastery</div>
        <div className="flex flex-col gap-4">
          {CONTENT.operations.map((op) => {
            const stat = progress.operations[op] ?? { attempts: 0, correct: 0, mastered: false };
            const badge = levelBadge(stat.attempts, stat.correct, stat.mastered);
            const pct = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
            return (
              <div key={op}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">{OP_LABELS[op]}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-grow overflow-hidden rounded-full bg-line-soft">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-[11px] text-ink-faint">
                    {stat.correct}/{stat.attempts}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[10.5px] text-ink-faintest">
          Mastered = 3+ attempts at 80%+ accuracy · Practicing = attempted, below threshold · Not started = no attempts yet.
        </p>
      </div>
    </div>
  );
}
