import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateDriveForm from "@/components/admin/CreateDriveForm";

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

export default async function DrivesPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const drives = await prisma.drive.findMany({ orderBy: { driveDate: "asc" } });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Drives
        </h1>
        <p className="text-sm text-ink-faint">
          The centrally-curated campus drive calendar every student sees on their Career page.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">New drive</h2>
        <CreateDriveForm />
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">All drives</h2>
        </div>
        {drives.length ? (
          <div className="divide-y divide-line-soft">
            {drives.map((drive) => (
              <div key={drive.id} className="px-5 py-3.5">
                <p className="text-sm font-medium text-ink">
                  {drive.companyName} · {drive.roleTitle}
                </p>
                <p className="text-xs text-ink-faint">
                  {formatDate(drive.driveDate)}
                  {drive.location ? ` · ${drive.location}` : ""}
                  {drive.applyDeadline ? ` · apply by ${formatDate(drive.applyDeadline)}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No drives yet.</p>
        )}
      </section>
    </div>
  );
}
