import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/career/ApplicationForm";
import ApplicationStatusSelect from "@/components/career/ApplicationStatusSelect";
import AngularBorder from "@/components/ui/AngularBorder";

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
          {FILTERS.map((f) => {
            const href = f.key === "all" ? "/career/applications" : `/career/applications?filter=${f.key}`;
            return filter === f.key ? (
              <a key={f.key} href={href} className="clip-chip bg-ink px-3.5 py-1.5 text-[13px] font-medium text-surface">
                {f.label}
              </a>
            ) : (
              <AngularBorder key={f.key} clip="clip-chip" color="var(--line)" className="bg-surface">
                <a href={href} className="block px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunk">
                  {f.label}
                </a>
              </AngularBorder>
            );
          })}
        </div>
      </div>

      <ApplicationForm />

      <AngularBorder color="var(--line)" className="bg-surface">
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
      </AngularBorder>
    </div>
  );
}
