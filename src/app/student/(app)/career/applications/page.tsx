import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
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
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
            Application tracker
          </h1>
          <p className="text-[14.5px] text-[#55556B]">
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
                  ? "bg-[#0F1020] text-white"
                  : "border border-[#E6E6EF] text-[#2A2A38] hover:bg-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <ApplicationForm />

      <div className="rounded-xl border border-[#E6E6EF] bg-white">
        {applications.length ? (
          <div className="divide-y divide-[#F2F2F7]">
            {applications.map((application) => (
              <div key={application.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-[#0F1020]">
                    {application.companyName} · {application.roleTitle}
                  </p>
                  <p className="text-xs text-[#8A8AA0]">
                    Applied {formatDate(application.appliedAt)}
                    {application.deadline ? ` · deadline ${formatDate(application.deadline)}` : ""}
                  </p>
                  {application.notes ? (
                    <p className="mt-1.5 text-sm text-[#55556B]">{application.notes}</p>
                  ) : null}
                </div>
                <ApplicationStatusSelect applicationId={application.id} status={application.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-[#8A8AA0]">
            No applications logged yet — use the form above or log one directly from a drive on the Career page.
          </p>
        )}
      </div>
    </div>
  );
}
