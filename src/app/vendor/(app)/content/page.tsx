import { redirect } from "next/navigation";
import { BookOpen, Code2 } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeReleaseEngagement } from "@/lib/vendorContent";
import StatusPill from "@/components/vendor/StatusPill";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default async function VendorContentPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const [releases, students] = await Promise.all([
    prisma.scheduledRelease.findMany({
      where: { vendorId: user.vendorId },
      orderBy: { releasedAt: "desc" },
      include: {
        quiz: { select: { title: true } },
        problem: { select: { title: true } },
      },
    }),
    prisma.user.findMany({
      where: { vendorId: user.vendorId, role: "STUDENT" },
      select: { id: true },
    }),
  ]);

  const studentIds = students.map((s) => s.id);
  const scored = await Promise.all(
    releases.map(async (release) => ({
      release,
      engagement: await computeReleaseEngagement(release, studentIds),
    }))
  );
  scored.sort((a, b) => b.engagement.percent - a.engagement.percent);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Content</h1>
        <p className="mt-1 text-sm text-ink-faint">
          What you&rsquo;ve assigned, ranked by how many students actually engaged
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {scored.length ? (
          <div className="divide-y divide-line-soft">
            {scored.map(({ release, engagement }) => {
              const title = release.quiz?.title ?? release.problem?.title ?? release.externalProblemTitle ?? "Unknown";
              const kind = release.quizId ? "Quiz" : release.problemId ? "Problem" : "LeetCode";
              const Icon = release.quizId ? BookOpen : Code2;
              const barColor =
                engagement.percent >= 70 ? "var(--success)" : engagement.percent < 30 ? "var(--warn)" : "var(--accent)";
              return (
                <div key={release.id} className="flex items-center gap-3.5 px-5 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{title}</p>
                    <p className="text-[11.5px] text-ink-faint">
                      {kind} · released {formatDate(release.releasedAt)} · closed{" "}
                      {formatDate(release.closesAt)}
                    </p>
                  </div>
                  <div className="w-40 shrink-0">
                    <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="animate-grow-bar-x h-full rounded-full"
                        style={{ width: `${Math.max(2, engagement.percent)}%`, background: barColor }}
                      />
                    </div>
                    <p className="mt-1 text-right font-mono text-[11px] text-ink-muted">
                      {engagement.completedCount} / {engagement.totalCount} · {engagement.percent}%
                    </p>
                  </div>
                  {engagement.percent >= 70 ? (
                    <StatusPill tone="success">Hit</StatusPill>
                  ) : engagement.percent < 30 ? (
                    <StatusPill tone="warn">Flopped</StatusPill>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No content released yet.</p>
        )}
      </div>
    </div>
  );
}
