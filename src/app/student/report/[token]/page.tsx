import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  computeReadinessPillars,
  computeOverallReadiness,
  computeReadinessDelta,
  computeActivityCounts,
  computeReadinessRecommendations,
  summarizeReadiness,
} from "@/lib/readiness";
import ReadinessReportView from "@/components/career/ReadinessReportView";

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { reportShareToken: token } });
  if (!user) {
    notFound();
  }

  const [pillars, overall, delta, activity, mockScorecards] = await Promise.all([
    computeReadinessPillars(user.id),
    computeOverallReadiness(user.id),
    computeReadinessDelta(user.id),
    computeActivityCounts(user.id),
    user.reportShowMockNotes
      ? prisma.mentorScorecard.findMany({
          where: { session: { studentId: user.id, kind: { in: ["MOCK", "HR_ROUND"] } } },
          orderBy: { submittedAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ]);
  const recommendations = computeReadinessRecommendations(pillars);
  const narrative = summarizeReadiness(pillars);

  const collegeLine = user.reportShowCollege
    ? [user.college, user.branch, user.gradYear ? `Class of ${user.gradYear}` : null]
        .filter(Boolean)
        .join(" · ")
    : "";
  const activityLine = `${activity.lessonsCompleted} lessons · ${activity.problemsSolved} problems · ${activity.mocksCompleted} mocks`;
  const mockNotes = user.reportShowMockNotes
    ? mockScorecards.map((s) => s.writtenFeedback).filter(Boolean)
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-6 py-10">
      <div className="text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-accent">
          PreCompilers · Job readiness report
        </p>
      </div>

      <ReadinessReportView
        name={user.name ?? "PreCompilers student"}
        collegeLine={collegeLine || null}
        targetRole={user.targetRole}
        overall={overall}
        pillars={pillars}
        delta={delta}
        activityLine={activityLine}
        narrative={narrative}
        recommendations={recommendations}
        mockNotes={mockNotes}
      />

      <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4">
        <p className="text-xs text-ink-faint">
          This is a live, verified snapshot from PreCompilers — generated{" "}
          {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.
        </p>
        <a
          href={`/api/report/${token}/pdf`}
          className="shrink-0 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
