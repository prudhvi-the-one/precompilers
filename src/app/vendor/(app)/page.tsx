import { redirect } from "next/navigation";
import { Users, TrendingUp, Award, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import RetryTrackingButton from "@/components/admin/RetryTrackingButton";
import { computeVendorCompletionPercent, parseCertificateCriteria } from "@/lib/vendorCompletion";
import StatChip from "@/components/vendor/StatChip";
import StatusPill from "@/components/vendor/StatusPill";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function VendorDashboardPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const [vendor, students] = await Promise.all([
    prisma.vendor.findUnique({ where: { id: user.vendorId } }),
    prisma.user.findMany({
      where: { vendorId: user.vendorId, role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        createdAt: true,
        externalJudgeAccounts: {
          where: { platform: "LEETCODE" },
          select: { handle: true, trackingStatus: true },
        },
        certificates: { where: { vendorId: user.vendorId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!vendor) {
    redirect("/login");
  }

  const certificateCriteria = parseCertificateCriteria(vendor.certificateCriteria);
  const completionByStudent = new Map(
    await Promise.all(
      students.map(async (student) => {
        const percent = await computeVendorCompletionPercent(vendor.id, student.id);
        return [student.id, percent] as const;
      })
    )
  );

  const LEETCODE_STATUS_LABEL: Record<string, string> = {
    ACTIVE: "LeetCode linked",
    UNVERIFIED: "LeetCode not verified",
    BLOCKED_OR_PRIVATE: "LeetCode tracking lost",
  };
  const LEETCODE_STATUS_TONE: Record<string, "success" | "neutral" | "warn"> = {
    ACTIVE: "success",
    UNVERIFIED: "neutral",
    BLOCKED_OR_PRIVATE: "warn",
  };

  const avgCompletion = students.length
    ? Math.round([...completionByStudent.values()].reduce((s, v) => s + v, 0) / students.length)
    : 0;
  const certificatesIssued = students.filter((s) => s.certificates.length > 0).length;
  const needsAttention = students.filter(
    (s) => s.externalJudgeAccounts[0]?.trackingStatus === "BLOCKED_OR_PRIVATE"
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">
          {vendor.name}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          {students.length} student{students.length === 1 ? "" : "s"} · ₹
          {(vendor.ratePaisePerStudent / 100).toFixed(0)}/student/month
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatChip icon={Users} label="Students" value={students.length} />
        <StatChip icon={TrendingUp} label="Avg. completion" value={`${avgCompletion}%`} />
        <StatChip icon={Award} label="Certificates issued" value={certificatesIssued} tone="success" />
        <StatChip
          icon={AlertTriangle}
          label="Needs attention"
          value={needsAttention}
          tone={needsAttention > 0 ? "warn" : "neutral"}
        />
      </div>

      <section className="rounded-2xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Roster</h2>
        </div>
        {students.length ? (
          <div className="divide-y divide-line-soft">
            {students.map((student) => {
              const leetcode = student.externalJudgeAccounts[0];
              const completionPercent = completionByStudent.get(student.id) ?? 0;
              const hasCertificate = student.certificates.length > 0;
              return (
                <div key={student.id} className="flex items-center gap-3.5 px-5 py-3.5">
                  <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-brand text-[13px] font-bold text-accent">
                    {initials(student.name, student.email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {student.name ?? student.email}
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      {student.email}
                      {student.rollNumber ? ` · Roll no. ${student.rollNumber}` : ""}
                      {leetcode ? ` · ${leetcode.handle}` : ""}
                    </p>
                  </div>
                  {certificateCriteria ? (
                    <div className="hidden w-27 shrink-0 flex-col gap-1 sm:flex">
                      <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${Math.max(2, completionPercent)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-ink-faint">{completionPercent}%</span>
                    </div>
                  ) : null}
                  <div className="flex shrink-0 items-center gap-2">
                    {hasCertificate ? (
                      <a
                        href={`/api/admin/vendors/${vendor.id}/students/${student.id}/certificate/pdf`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Certificate
                      </a>
                    ) : null}
                    <StatusPill tone={leetcode ? LEETCODE_STATUS_TONE[leetcode.trackingStatus] : "neutral"}>
                      {leetcode ? LEETCODE_STATUS_LABEL[leetcode.trackingStatus] : "LeetCode not linked"}
                    </StatusPill>
                    {leetcode?.trackingStatus === "BLOCKED_OR_PRIVATE" ? (
                      <RetryTrackingButton vendorId={vendor.id} userId={student.id} />
                    ) : null}
                    <p className="hidden text-xs text-ink-faint lg:block">
                      Added {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No students yet.</p>
        )}
      </section>
    </div>
  );
}
