import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { computeReadinessPillars, computeOverallReadiness } from "@/lib/readiness";
import ReadinessPillarGrid from "@/components/career/ReadinessPillarGrid";
import ShareReportControls from "@/components/career/ShareReportControls";

const TARGET_ROLE_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEER: "Software engineer",
  DATA_ML_ENGINEER: "Data / ML engineer",
  FRONTEND_ENGINEER: "Frontend engineer",
  CLOUD_DEVOPS: "Cloud / DevOps",
  HIGHER_STUDIES: "Higher studies",
  NOT_SURE: "Not sure yet",
};

export default async function MyReportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const [pillars, overall] = await Promise.all([
    computeReadinessPillars(user.id),
    computeOverallReadiness(user.id),
  ]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          My report
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Your live job-readiness snapshot — share it with a recruiter or your placement cell.
        </p>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-brand text-lg font-bold text-[#0F1020]">
              {user.name ?? user.email}
            </p>
            <p className="text-sm text-[#55556B]">
              {[user.college, user.branch, user.gradYear ? `Class of ${user.gradYear}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {user.targetRole ? (
              <p className="mt-1 text-xs text-[#8A8AA0]">
                Targeting {TARGET_ROLE_LABELS[user.targetRole] ?? user.targetRole}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-brand text-3xl font-extrabold text-[#4F46E5]">
              {overall !== null ? overall : "—"}
            </p>
            <p className="text-xs text-[#8A8AA0]">Overall readiness</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-[#0F1020]">Readiness by pillar</h2>
        <ReadinessPillarGrid pillars={pillars} />
      </div>

      <ShareReportControls initialToken={user.reportShareToken} />
    </div>
  );
}
