import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/career/ApplicationForm";
import ApplicationStatusSelect from "@/components/career/ApplicationStatusSelect";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const { filter = "all" } = await searchParams;

  const allApplications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "desc" },
  });

  const applications =
    filter === "all"
      ? allApplications
      : allApplications.filter((a) => a.status === filter.toUpperCase());

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Application tracker
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            {allApplications.length} application{allApplications.length === 1 ? "" : "s"} logged.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/career/applications" : `/career/applications?filter=${f.key}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                filter === f.key
                  ? "bg-ink text-surface"
                  : "border border-line text-ink-secondary hover:bg-surface"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <ApplicationForm />

      <div className="rounded-xl border border-line bg-surface">
        {applications.length ? (
          <div className="divide-y divide-line-soft">
            {applications.map((application) => (
              <div key={application.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {application.companyName} · {application.roleTitle}
                  </p>
                  <p className="text-xs text-ink-faint">
                    Applied {formatDate(application.appliedAt)}
                    {application.deadline ? ` · deadline ${formatDate(application.deadline)}` : ""}
                  </p>
                  {application.notes ? (
                    <p className="mt-1.5 text-sm text-ink-muted">{application.notes}</p>
                  ) : null}
                </div>
                <ApplicationStatusSelect applicationId={application.id} status={application.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">
            No applications logged yet — use the form above or log one directly from a drive on the Career page.
          </p>
        )}
      </div>
    </div>
  );
}
