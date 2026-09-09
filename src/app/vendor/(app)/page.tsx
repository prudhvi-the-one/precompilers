import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import RetryTrackingButton from "@/components/admin/RetryTrackingButton";
import { computeVendorCompletionPercent, parseCertificateCriteria } from "@/lib/vendorCompletion";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
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
  const LEETCODE_STATUS_STYLE: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    UNVERIFIED: "bg-line-soft text-ink-muted",
    BLOCKED_OR_PRIVATE: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          {vendor.name}
        </h1>
        <p className="text-sm text-ink-faint">
          {students.length} student{students.length === 1 ? "" : "s"} · ₹
          {(vendor.ratePaisePerStudent / 100).toFixed(0)}/student/month
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface">
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
                <div key={student.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{student.name ?? student.email}</p>
                    <p className="text-xs text-ink-faint">
                      {student.email}
                      {student.rollNumber ? ` · Roll no. ${student.rollNumber}` : ""}
                      {leetcode ? ` · ${leetcode.handle}` : ""}
                      {certificateCriteria ? ` · ${completionPercent}% complete` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {hasCertificate ? (
                      <a
                        href={`/api/admin/vendors/${vendor.id}/students/${student.id}/certificate/pdf`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Certificate
                      </a>
                    ) : null}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        leetcode
                          ? LEETCODE_STATUS_STYLE[leetcode.trackingStatus]
                          : "bg-line-soft text-ink-muted"
                      }`}
                    >
                      {leetcode ? LEETCODE_STATUS_LABEL[leetcode.trackingStatus] : "LeetCode not linked"}
                    </span>
                    {leetcode?.trackingStatus === "BLOCKED_OR_PRIVATE" ? (
                      <RetryTrackingButton vendorId={vendor.id} userId={student.id} />
                    ) : null}
                    <p className="text-xs text-ink-faint">Added {formatDate(student.createdAt)}</p>
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
