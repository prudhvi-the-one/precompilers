import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProvisionUserForm from "@/components/admin/ProvisionUserForm";

export default async function FacultyPage() {
  const user = await requireRole("INSTITUTION_ADMIN");
  if (!user) {
    redirect("/login");
  }

  const [batches, faculty] = await Promise.all([
    prisma.batch.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { institutionId: user.institutionId, role: "FACULTY" },
      include: { facultyBatch: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Faculty
        </h1>
        <p className="text-sm text-ink-faint">
          Each faculty account sees only their assigned batch — no other batch, no individual submissions.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Invite faculty</h2>
        {batches.length ? (
          <ProvisionUserForm
            role="FACULTY"
            roleLabel="faculty"
            batchOptions={batches.map((b) => ({ id: b.id, name: b.name }))}
          />
        ) : (
          <p className="text-sm text-ink-faint">
            No batches exist for your institution yet — ask an admin to create one.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">All faculty</h2>
        </div>
        {faculty.length ? (
          <div className="divide-y divide-line-soft">
            {faculty.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{f.name ?? f.email}</p>
                  <p className="text-xs text-ink-faint">
                    {f.facultyBatch?.name ?? "No batch assigned"}
                  </p>
                </div>
                <span
                  className={
                    f.emailVerifiedAt
                      ? "rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success"
                      : "rounded-full bg-line-soft px-2.5 py-0.5 text-xs font-semibold text-ink-faint"
                  }
                >
                  {f.emailVerifiedAt ? "ACTIVE" : "PENDING"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No faculty invited yet.</p>
        )}
      </section>
    </div>
  );
}
