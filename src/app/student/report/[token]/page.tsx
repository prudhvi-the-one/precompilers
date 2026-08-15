import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeReadinessPillars, computeOverallReadiness } from "@/lib/readiness";
import ReadinessPillarGrid from "@/components/career/ReadinessPillarGrid";

const TARGET_ROLE_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEER: "Software engineer",
  DATA_ML_ENGINEER: "Data / ML engineer",
  FRONTEND_ENGINEER: "Frontend engineer",
  CLOUD_DEVOPS: "Cloud / DevOps",
  HIGHER_STUDIES: "Higher studies",
  NOT_SURE: "Not sure yet",
};

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

  const [pillars, overall] = await Promise.all([
    computeReadinessPillars(user.id),
    computeOverallReadiness(user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-6 py-10">
      <div className="text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#4F46E5]">
          PreCompilers · Job readiness report
        </p>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-brand text-lg font-bold text-[#0F1020]">
              {user.name ?? "PreCompilers student"}
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

      <div className="flex items-center justify-between rounded-xl border border-[#E6E6EF] bg-white px-5 py-4">
        <p className="text-xs text-[#8A8AA0]">
          This is a live, verified snapshot from PreCompilers — generated{" "}
          {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.
        </p>
        <a
          href={`/api/report/${token}/pdf`}
          className="shrink-0 rounded-md bg-[#0F1020] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
