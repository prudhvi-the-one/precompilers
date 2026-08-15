import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import {
  computeReadinessPillars,
  computeOverallReadiness,
  computeReadinessDelta,
  computeActivityCounts,
  computeReadinessRecommendations,
  summarizeReadiness,
} from "@/lib/readiness";
import ReadinessReportView from "@/components/career/ReadinessReportView";
import ShareReportControls from "@/components/career/ShareReportControls";

export default async function MyReportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const [pillars, overall, delta, activity] = await Promise.all([
    computeReadinessPillars(user.id),
    computeOverallReadiness(user.id),
    computeReadinessDelta(user.id),
    computeActivityCounts(user.id),
  ]);
  const recommendations = computeReadinessRecommendations(pillars);
  const narrative = summarizeReadiness(pillars);

  const collegeLine = [user.college, user.branch, user.gradYear ? `Class of ${user.gradYear}` : null]
    .filter(Boolean)
    .join(" · ");
  const activityLine = `${activity.lessonsCompleted} lessons · ${activity.problemsSolved} problems · ${activity.mocksCompleted} mocks`;

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Readiness report
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Your live job-readiness snapshot — share it with a recruiter or your placement cell.
        </p>
      </div>

      <ReadinessReportView
        name={user.name ?? user.email}
        collegeLine={collegeLine || null}
        targetRole={user.targetRole}
        overall={overall}
        pillars={pillars}
        delta={delta}
        activityLine={activityLine}
        narrative={narrative}
        recommendations={recommendations}
        mockNotes={null}
      />

      <ShareReportControls
        initialToken={user.reportShareToken}
        initialShowCollege={user.reportShowCollege}
        initialShowMockNotes={user.reportShowMockNotes}
      />
    </div>
  );
}
