import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ReleaseContentForm from "@/components/admin/ReleaseContentForm";
import FinalizeBillingForm from "@/components/admin/FinalizeBillingForm";
import MarkInvoicedButton from "@/components/admin/MarkInvoicedButton";
import CertificateCriteriaForm from "@/components/admin/CertificateCriteriaForm";
import BulkRosterUploadForm from "@/components/admin/BulkRosterUploadForm";
import SelfSignupLinkForm from "@/components/admin/SelfSignupLinkForm";
import { computeActiveStudentCount, currentPeriodMonth, previousPeriodMonth } from "@/lib/vendorBilling";
import { parseCertificateCriteria } from "@/lib/vendorCompletion";
import { getStudentPortalBaseUrl } from "@/lib/url";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const { vendorId } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    notFound();
  }

  const thisMonth = currentPeriodMonth();
  const [quizzes, problems, releases, billingRecords, activeThisMonth] = await Promise.all([
    prisma.quiz.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.problem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.scheduledRelease.findMany({
      where: { vendorId },
      orderBy: { releasedAt: "desc" },
      include: {
        quiz: { select: { title: true } },
        problem: { select: { title: true } },
      },
    }),
    prisma.vendorBillingRecord.findMany({
      where: { vendorId },
      orderBy: { periodMonth: "desc" },
    }),
    computeActiveStudentCount(vendorId, thisMonth),
  ]);

  const now = new Date();
  const certificateCriteria = parseCertificateCriteria(vendor.certificateCriteria);
  const studentBaseUrl = await getStudentPortalBaseUrl();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          {vendor.name}
        </h1>
        <p className="text-sm text-ink-faint">
          {vendor.contactEmail} · ₹{(vendor.ratePaisePerStudent / 100).toFixed(0)}/student/month
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5 space-y-5">
        <h2 className="font-brand text-base font-bold text-ink">Student onboarding</h2>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-ink">Bulk upload roster</h3>
          <BulkRosterUploadForm vendorId={vendorId} />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-ink">Self-signup link</h3>
          <p className="mb-2 text-xs text-ink-faint">
            Give this link to the vendor to let their students register themselves.
          </p>
          <SelfSignupLinkForm
            vendorId={vendorId}
            initialEnabled={vendor.selfSignupEnabled}
            initialSignupSlug={vendor.signupSlug}
            studentBaseUrl={studentBaseUrl}
          />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Release content</h2>
        <ReleaseContentForm vendorId={vendorId} quizzes={quizzes} problems={problems} />
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Releases</h2>
        </div>
        {releases.length ? (
          <div className="divide-y divide-line-soft">
            {releases.map((release) => {
              const isOpen = release.closesAt > now;
              const title =
                release.quiz?.title ?? release.problem?.title ?? release.externalProblemTitle ?? "Unknown";
              const kind = release.quizId ? "Quiz" : release.problemId ? "Problem" : "LeetCode";
              return (
                <div key={release.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {title} <span className="text-xs text-ink-faint">({kind})</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      Released {formatDateTime(release.releasedAt)} · closes{" "}
                      {formatDateTime(release.closesAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOpen ? "bg-green-50 text-green-700" : "bg-line-soft text-ink-muted"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No releases yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-1 font-brand text-base font-bold text-ink">Completion certificate</h2>
        <p className="mb-3 text-xs text-ink-faint">
          {certificateCriteria
            ? `Students at or above ${certificateCriteria.minCompletionPercent}% completion of this vendor's assigned items are eligible.`
            : "Not configured yet — students can't earn a certificate until a threshold is set."}
        </p>
        <CertificateCriteriaForm
          vendorId={vendorId}
          defaultMinCompletionPercent={certificateCriteria?.minCompletionPercent ?? 80}
        />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-1 font-brand text-base font-bold text-ink">Billing</h2>
        <p className="mb-3 text-xs text-ink-faint">
          {thisMonth} so far (live, not yet finalized): {activeThisMonth} active student
          {activeThisMonth === 1 ? "" : "s"}.
        </p>
        <FinalizeBillingForm vendorId={vendorId} defaultPeriodMonth={previousPeriodMonth()} />
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Invoices</h2>
        </div>
        {billingRecords.length ? (
          <div className="divide-y divide-line-soft">
            {billingRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {record.periodMonth} — {record.activeStudentCount} student
                    {record.activeStudentCount === 1 ? "" : "s"} × ₹
                    {(record.ratePaisePerStudent / 100).toFixed(0)} ={" "}
                    ₹{(record.totalAmountPaise / 100).toLocaleString("en-IN")}
                  </p>
                  <a
                    href={`/api/admin/vendors/${vendorId}/billing/${record.id}/invoice`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Download invoice
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      record.status === "INVOICED"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {record.status === "INVOICED" ? "Invoiced" : "Finalized"}
                  </span>
                  {record.status === "FINALIZED" ? (
                    <MarkInvoicedButton vendorId={vendorId} recordId={record.id} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No invoices finalized yet.</p>
        )}
      </section>
    </div>
  );
}
