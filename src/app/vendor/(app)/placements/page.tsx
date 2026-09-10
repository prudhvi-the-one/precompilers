import { redirect } from "next/navigation";
import { Briefcase, Users, CheckCircle2, XCircle } from "lucide-react";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StatChip from "@/components/vendor/StatChip";
import StatusPill from "@/components/vendor/StatusPill";
import Funnel from "@/components/charts/Funnel";

const STATUS_TONE: Record<string, "neutral" | "accent" | "success" | "warn"> = {
  APPLIED: "neutral",
  INTERVIEWING: "accent",
  OFFER: "success",
  REJECTED: "warn",
  WITHDRAWN: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function VendorPlacementsPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { user: { vendorId: user.vendorId, role: "STUDENT" } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const total = applications.length;
  const interviewing = applications.filter((a) => a.status === "INTERVIEWING").length;
  const offers = applications.filter((a) => a.status === "OFFER").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Placements</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Where your students&rsquo; job search actually stands, end to end
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatChip icon={Briefcase} label="Applications sent" value={total} />
        <StatChip icon={Users} label="In interviews" value={interviewing} />
        <StatChip icon={CheckCircle2} label="Offers" value={offers} tone="success" />
        <StatChip icon={XCircle} label="Rejected" value={rejected} tone={rejected > 0 ? "warn" : "neutral"} />
      </div>

      {total > 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-brand text-[15px] font-bold text-ink">Application funnel</h2>
          <p className="mb-6 text-xs text-ink-faint">Every stage a student&rsquo;s application has reached</p>
          <Funnel
            stages={[
              { label: "Applied", count: total, color: "var(--accent)" },
              { label: "Interviewing", count: interviewing, color: "var(--accent-hover)" },
              { label: "Offer", count: offers, color: "var(--success)" },
            ]}
          />
        </div>
      ) : null}

      <section className="rounded-2xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Recent activity</h2>
        </div>
        {applications.length ? (
          <div className="divide-y divide-line-soft">
            {applications.slice(0, 12).map((app) => (
              <div key={app.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex-1 truncate text-sm font-medium text-ink">
                  {app.user.name ?? app.user.email}
                </span>
                <span className="w-56 shrink-0 truncate text-xs text-ink-faint">
                  {app.companyName} · {app.roleTitle}
                </span>
                <StatusPill tone={STATUS_TONE[app.status]}>{STATUS_LABEL[app.status]}</StatusPill>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">
            No applications tracked yet for your students.
          </p>
        )}
      </section>
    </div>
  );
}
