import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import LogApplicationButton from "@/components/career/LogApplicationButton";

const STATUS_STYLE: Record<string, string> = {
  APPLIED: "bg-[#F1F0FE] text-indigo-600",
  INTERVIEWING: "bg-[#FEF6E7] text-[#B45309]",
  OFFER: "bg-[#E7F7F0] text-[#059669]",
  REJECTED: "bg-[#FDEBEC] text-[#DC2626]",
  WITHDRAWN: "bg-[#F2F2F7] text-[#55556B]",
};

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function CareerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const now = new Date();
  const [allDrives, applications] = await Promise.all([
    prisma.drive.findMany({ orderBy: { driveDate: "asc" } }),
    prisma.application.findMany({ where: { userId: user.id, driveId: { not: null } } }),
  ]);
  const drives = allDrives.filter(
    (d) => d.driveDate >= now || (d.applyDeadline && d.applyDeadline >= now)
  );
  const applicationByDriveId = new Map(applications.map((a) => [a.driveId, a]));

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Career
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Campus drives curated by the PreCompilers team.
        </p>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white">
        {drives.length ? (
          <div className="divide-y divide-[#F2F2F7]">
            {drives.map((drive) => {
              const application = applicationByDriveId.get(drive.id);
              return (
                <div key={drive.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#0F1020]">
                        {drive.companyName} · {drive.roleTitle}
                      </p>
                      <p className="text-xs text-[#8A8AA0]">
                        {formatDate(drive.driveDate)}
                        {drive.location ? ` · ${drive.location}` : ""}
                        {drive.applyDeadline
                          ? ` · apply by ${formatDate(drive.applyDeadline)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {drive.applyUrl ? (
                        <a
                          href={drive.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md bg-[#0F1020] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Apply
                        </a>
                      ) : null}
                      {application ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[application.status]}`}
                        >
                          {STATUS_LABEL[application.status]}
                        </span>
                      ) : (
                        <LogApplicationButton driveId={drive.id} />
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[#55556B]">{drive.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-[#8A8AA0]">No upcoming drives right now.</p>
        )}
      </div>
    </div>
  );
}
