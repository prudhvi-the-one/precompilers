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
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Institutions
        </h1>
        <p className="text-sm text-gray-500">Create institutions and invite their admins.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-gray-900">New institution</h2>
        <CreateInstitutionForm />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-gray-900">Invite institution admin</h2>
        {institutions.length ? (
          <ProvisionUserForm
            role="INSTITUTION_ADMIN"
            roleLabel="institution admin"
            institutionOptions={institutions.map((i) => ({ id: i.id, name: i.name }))}
          />
        ) : (
          <p className="text-sm text-gray-500">Create an institution first.</p>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">All institutions</h2>
        </div>
        {institutions.length ? (
          <div className="divide-y divide-gray-100">
            {institutions.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inst.name}</p>
                  <p className="text-xs text-gray-500">
                    {inst._count.users} / {inst.seatCount} seats used · renews{" "}
                    {formatDate(inst.renewsAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No institutions yet.</p>
        )}
      </section>
    </div>
  );
}
