import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateBatchForm from "@/components/admin/CreateBatchForm";

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
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Batches
        </h1>
        <p className="text-sm text-gray-500">
          Cohorts sharing a track and live-class schedule, optionally scoped to an institution.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-gray-900">New batch</h2>
        <CreateBatchForm
          tracks={tracks.map((t) => ({ id: t.id, name: t.name }))}
          institutions={institutions.map((i) => ({ id: i.id, name: i.name }))}
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">All batches</h2>
        </div>
        {batches.length ? (
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {batch.name} · {batch.track.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(batch.startsAt)} · {batch._count.enrollments} enrolled
                    {batch.institution ? ` · ${batch.institution.name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No batches yet.</p>
        )}
      </section>
    </div>
  );
}
