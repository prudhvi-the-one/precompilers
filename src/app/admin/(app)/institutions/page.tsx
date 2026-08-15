import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateInstitutionForm from "@/components/admin/CreateInstitutionForm";
import ProvisionUserForm from "@/components/admin/ProvisionUserForm";

function formatDate(date: Date | null): string {
  if (!date) return "no renewal date set";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function InstitutionsPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: { where: { role: "STUDENT" } } } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Institutions
        </h1>
        <p className="text-sm text-ink-faint">Create institutions and invite their admins.</p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">New institution</h2>
        <CreateInstitutionForm />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Invite institution admin</h2>
        {institutions.length ? (
          <ProvisionUserForm
            role="INSTITUTION_ADMIN"
            roleLabel="institution admin"
            institutionOptions={institutions.map((i) => ({ id: i.id, name: i.name }))}
          />
        ) : (
          <p className="text-sm text-ink-faint">Create an institution first.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">All institutions</h2>
        </div>
        {institutions.length ? (
          <div className="divide-y divide-line-soft">
            {institutions.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{inst.name}</p>
                  <p className="text-xs text-ink-faint">
                    {inst._count.users} / {inst.seatCount} seats used · renews{" "}
                    {formatDate(inst.renewsAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No institutions yet.</p>
        )}
      </section>
    </div>
  );
}
