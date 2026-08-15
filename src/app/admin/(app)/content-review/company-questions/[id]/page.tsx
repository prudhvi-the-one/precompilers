import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ApproveRejectActions from "@/components/admin/ApproveRejectActions";

export default async function ReviewCompanyQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const { id } = await params;
  const companyQuestion = await prisma.companyQuestion.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!companyQuestion || companyQuestion.status !== "PENDING_REVIEW") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          {companyQuestion.companyName}
        </h1>
        <p className="text-sm text-gray-500">
          {companyQuestion.category} · by{" "}
          {companyQuestion.author?.name ?? companyQuestion.author?.email ?? "Unknown mentor"}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Question</p>
          <p className="mt-1 text-sm text-gray-900">{companyQuestion.question}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Guidance</p>
          <p className="mt-1 text-sm text-gray-900">{companyQuestion.guidance}</p>
        </div>
      </div>

      <ApproveRejectActions type="company-questions" id={companyQuestion.id} />
    </div>
  );
}
