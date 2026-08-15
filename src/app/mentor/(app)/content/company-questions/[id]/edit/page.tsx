import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CompanyQuestionForm from "@/components/mentor/CompanyQuestionForm";

export default async function EditCompanyQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const { id } = await params;
  const companyQuestion = await prisma.companyQuestion.findUnique({ where: { id } });

  if (
    !companyQuestion ||
    companyQuestion.authorId !== mentor.id ||
    (companyQuestion.status !== "DRAFT" && companyQuestion.status !== "REJECTED")
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
        Edit company question
      </h1>
      {companyQuestion.status === "REJECTED" && companyQuestion.rejectionReason ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejected: {companyQuestion.rejectionReason}
        </p>
      ) : null}
      <CompanyQuestionForm
        mode="edit"
        companyQuestionId={companyQuestion.id}
        initialData={{
          companyName: companyQuestion.companyName,
          category: companyQuestion.category,
          question: companyQuestion.question,
          guidance: companyQuestion.guidance,
        }}
      />
    </div>
  );
}
