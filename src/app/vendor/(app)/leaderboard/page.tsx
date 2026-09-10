import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeTotalXp, levelForXp } from "@/lib/skillTree";
import { computeCurrentStreak } from "@/lib/streak";

const PODIUM_COLOR = ["var(--accent)", "var(--ink-faint)", "var(--pillar-pink)"];
const PODIUM_RANK_BG = ["#b45309", "#6b7280", "#9a5b3a"];
const PODIUM_HEIGHT = [88, 64, 44];

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function VendorLeaderboardPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const students = await prisma.user.findMany({
    where: { vendorId: user.vendorId, role: "STUDENT" },
    select: { id: true, name: true, email: true },
  });

  const ranked = (
    await Promise.all(
      students.map(async (student) => {
        const xp = await computeTotalXp(student.id);
        const streak = await computeCurrentStreak(student.id);
        return { ...student, xp, level: levelForXp(xp), streak };
      })
    )
  ).sort((a, b) => b.xp - a.xp);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  // Podium display order is 2nd, 1st, 3rd so the tallest block sits in the middle.
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Internal only — a motivator for your own roster, not a public ranking
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-5 py-6 text-center text-sm text-ink-faint">
          No students yet.
        </p>
      ) : (
        <>
          <div className="flex items-end justify-center gap-5 pt-2">
            {podiumOrder.map((entry) => {
              const rank = ranked.indexOf(entry);
              return (
                <div key={entry.id} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <span
                      className="animate-fade-scale flex h-13 w-13 items-center justify-center rounded-full font-brand text-base font-bold text-white"
                      style={{ background: PODIUM_COLOR[rank], animationDelay: `${rank * 0.1}s` }}
                    >
                      {initials(entry.name, entry.email)}
                    </span>
                    <span
                      className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface font-mono text-[10px] font-bold text-white"
                      style={{ background: PODIUM_RANK_BG[rank] }}
                    >
                      {rank + 1}
                    </span>
                  </div>
                  <div
                    className="animate-grow-bar-y flex w-20 items-start justify-center rounded-t-lg pt-2 font-mono text-[13px] font-bold text-white"
                    style={{
                      height: PODIUM_HEIGHT[rank],
                      background: PODIUM_RANK_BG[rank],
                      animationDelay: `${rank * 0.1 + 0.05}s`,
                    }}
                  >
                    {entry.xp}
                  </div>
                  <div className="text-center">
                    <p className="text-[12.5px] font-semibold text-ink">{entry.name ?? entry.email}</p>
                    <p className="font-mono text-[11px] text-ink-faint">Level {entry.level}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {rest.length ? (
            <div className="rounded-2xl border border-line bg-surface">
              {rest.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3.5 border-b border-line-soft px-5 py-3 last:border-b-0"
                >
                  <span className="w-5 font-mono text-sm text-ink-faint">{i + 4}</span>
                  <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-brand text-[12px] font-bold text-accent">
                    {initials(entry.name, entry.email)}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-ink">
                    {entry.name ?? entry.email}
                  </span>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
                    Lvl {entry.level}
                  </span>
                  <span className="flex w-14 items-center gap-1 font-mono text-xs text-warn">
                    <Flame className="h-3.5 w-3.5" />
                    {entry.streak}d
                  </span>
                  <span className="w-16 text-right font-mono text-[12.5px] font-semibold text-ink">
                    {entry.xp} XP
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
