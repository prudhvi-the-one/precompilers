import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateBatchForm from "@/components/admin/CreateBatchForm";
import CreateLiveClassForm from "@/components/admin/CreateLiveClassForm";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BatchesPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const [batches, tracks, institutions] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { startsAt: "desc" },
      include: {
        track: true,
        institution: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.track.findMany({ orderBy: { order: "asc" } }),
    prisma.institution.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Batches
        </h1>
        <p className="text-sm text-ink-faint">
          Cohorts sharing a track and live-class schedule, optionally scoped to an institution.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">New batch</h2>
        <CreateBatchForm
          tracks={tracks.map((t) => ({ id: t.id, name: t.name }))}
          institutions={institutions.map((i) => ({ id: i.id, name: i.name }))}
        />
      </section>

      {batches.length ? (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-brand text-base font-bold text-ink">
            Schedule live class
          </h2>
          <CreateLiveClassForm batches={batches.map((b) => ({ id: b.id, name: b.name }))} />
        </section>
      ) : null}

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">All batches</h2>
        </div>
        {batches.length ? (
          <div className="divide-y divide-line-soft">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {batch.name} · {batch.track.name}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatDate(batch.startsAt)} · {batch._count.enrollments} enrolled
                    {batch.institution ? ` · ${batch.institution.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No batches yet.</p>
        )}
      </section>
    </div>
  );
}
