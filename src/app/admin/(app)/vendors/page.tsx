import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateVendorForm from "@/components/admin/CreateVendorForm";
import ProvisionUserForm from "@/components/admin/ProvisionUserForm";

export default async function VendorsPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!user) {
    redirect("/login");
  }

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: { where: { role: "STUDENT" } } } } },
  });

  const vendorOptions = vendors.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Vendors
        </h1>
        <p className="text-sm text-ink-faint">
          Training partners reselling PreCompilers to their own student cohorts.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">New vendor</h2>
        <CreateVendorForm />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Invite vendor admin</h2>
        {vendors.length ? (
          <ProvisionUserForm role="VENDOR_ADMIN" roleLabel="vendor admin" vendorOptions={vendorOptions} />
        ) : (
          <p className="text-sm text-ink-faint">Create a vendor first.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Add student to vendor</h2>
        {vendors.length ? (
          <ProvisionUserForm
            role="STUDENT"
            roleLabel="student"
            vendorOptions={vendorOptions}
            showRollNumber
          />
        ) : (
          <p className="text-sm text-ink-faint">Create a vendor first.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">All vendors</h2>
        </div>
        {vendors.length ? (
          <div className="divide-y divide-line-soft">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{vendor.name}</p>
                  <p className="text-xs text-ink-faint">
                    {vendor.contactEmail} · {vendor._count.users} student
                    {vendor._count.users === 1 ? "" : "s"} · ₹
                    {(vendor.ratePaisePerStudent / 100).toFixed(0)}/student/month
                  </p>
                </div>
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Manage releases
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No vendors yet.</p>
        )}
      </section>
    </div>
  );
}
