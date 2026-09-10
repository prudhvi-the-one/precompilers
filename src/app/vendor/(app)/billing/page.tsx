import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeActiveStudentCount, currentPeriodMonth } from "@/lib/vendorBilling";
import StatusPill from "@/components/vendor/StatusPill";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatPeriod(periodMonth: string): string {
  const [year, month] = periodMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function VendorBillingPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: user.vendorId } });
  if (!vendor) {
    redirect("/login");
  }

  const thisMonth = currentPeriodMonth();
  const [activeThisMonth, records] = await Promise.all([
    computeActiveStudentCount(vendor.id, thisMonth),
    prisma.vendorBillingRecord.findMany({
      where: { vendorId: vendor.id },
      orderBy: { periodMonth: "desc" },
    }),
  ]);

  const liveTotalPaise = activeThisMonth * vendor.ratePaisePerStudent;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Billing</h1>
        <p className="mt-1 text-sm text-ink-faint">
          {vendor.name} · ₹{(vendor.ratePaisePerStudent / 100).toFixed(0)}/student/month
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-gradient-to-b from-accent-soft to-surface p-7">
        <div className="text-xs font-bold uppercase tracking-wide text-accent">
          {formatPeriod(thisMonth)} · so far
        </div>
        <div className="mt-2 font-mono text-4xl font-bold text-ink">{formatPaise(liveTotalPaise)}</div>
        <p className="mt-1.5 text-sm text-ink-muted">
          {activeThisMonth} active student{activeThisMonth === 1 ? "" : "s"} × ₹
          {(vendor.ratePaisePerStudent / 100).toFixed(0)}/student — live estimate, not yet finalized
        </p>
        <p className="mt-3 text-xs text-ink-faint">
          PreCompilers finalizes and invoices each month shortly after it closes. This number updates
          daily until then.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Invoice history</h2>
        </div>
        {records.length ? (
          <div className="divide-y divide-line-soft">
            {records.map((record) => (
              <div key={record.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-20 shrink-0 font-brand text-sm font-bold text-ink">
                  {formatPeriod(record.periodMonth)}
                </div>
                <div className="flex-1 text-xs text-ink-faint">
                  {record.activeStudentCount} active student{record.activeStudentCount === 1 ? "" : "s"}{" "}
                  × ₹{(record.ratePaisePerStudent / 100).toFixed(0)}
                </div>
                <div className="w-24 shrink-0 text-right font-mono text-sm font-semibold text-ink">
                  {formatPaise(record.totalAmountPaise)}
                </div>
                <StatusPill tone={record.status === "INVOICED" ? "success" : "warn"}>
                  {record.status === "INVOICED" ? "Invoiced" : "Finalized"}
                </StatusPill>
                <a
                  href={`/api/admin/vendors/${vendor.id}/billing/${record.id}/invoice`}
                  className="shrink-0 text-xs font-medium text-accent hover:underline"
                >
                  Download
                </a>
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
