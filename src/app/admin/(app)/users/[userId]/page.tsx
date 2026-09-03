import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import EditStudentForm from "@/components/admin/EditStudentForm";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const actor = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!actor) {
    redirect("/login");
  }

  const { userId } = await params;
  const [target, vendors] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!target) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          {target.name ?? target.email}
        </h1>
        <p className="text-sm text-ink-faint">
          {target.role.replaceAll("_", " ")} · Joined {formatDateTime(target.createdAt)}
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Edit profile</h2>
        <EditStudentForm
          userId={target.id}
          initialName={target.name ?? ""}
          initialEmail={target.email}
          initialCollege={target.college ?? ""}
          initialBranch={target.branch ?? ""}
          initialGradYear={target.gradYear}
          initialCgpa={target.cgpa}
          initialBacklogCount={target.backlogCount}
          initialPhoneNumber={target.phoneNumber ?? ""}
          initialWhatsappOptIn={target.whatsappOptIn}
          initialVendorId={target.vendorId ?? ""}
          initialWeeklyHours={target.weeklyHours ?? ""}
          initialTargetRole={target.targetRole ?? ""}
          initialRollNumber={target.rollNumber ?? ""}
          vendorOptions={vendors}
        />
      </section>
    </div>
  );
}
