import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProvisionUserForm from "@/components/admin/ProvisionUserForm";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const { q = "" } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { institution: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Users
        </h1>
        <p className="text-sm text-ink-faint">Read-only — role changes and deletion are super admin only.</p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Invite mentor</h2>
        <ProvisionUserForm role="MENTOR" roleLabel="mentor" />
      </section>

      {user.role === "SUPER_ADMIN" ? (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-brand text-base font-bold text-ink">Invite admin</h2>
          <ProvisionUserForm role="ADMIN" roleLabel="admin" />
        </section>
      ) : null}

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name or email…"
              className="w-full max-w-xs rounded-md border border-line px-3 py-1.5 text-sm"
            />
            <button className="rounded-md border border-line px-3 py-1.5 text-sm font-medium">
              Search
            </button>
          </form>
        </div>
        <div className="divide-y divide-line-soft">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{u.name ?? u.email}</p>
                <p className="text-xs text-ink-faint">
                  {u.email}
                  {u.institution ? ` · ${u.institution.name}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-line-soft px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                {u.role.replaceAll("_", " ")}
              </span>
            </div>
          ))}
          {users.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-faint">No users match.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
