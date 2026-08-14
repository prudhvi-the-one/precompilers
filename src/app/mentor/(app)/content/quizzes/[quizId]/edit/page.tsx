import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import QuizAuthorForm from "@/components/mentor/QuizAuthorForm";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (
    !quiz ||
    quiz.authorId !== mentor.id ||
    (quiz.status !== "DRAFT" && quiz.status !== "REJECTED")
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
        Edit quiz
      </h1>
      {quiz.status === "REJECTED" && quiz.rejectionReason ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejected: {quiz.rejectionReason}
        </p>
      ) : null}
      <QuizAuthorForm
        mode="edit"
        quizId={quiz.id}
        initialData={{
          title: quiz.title,
          topic: quiz.topic,
          kind: quiz.kind,
          requiredEntitlement: quiz.requiredEntitlement,
          sections: quiz.sections.map((section) => ({
            name: section.name,
            durationMinutes: section.durationMinutes,
            questions: section.questions.map((question) => ({
              text: question.text,
              marks: question.marks,
              options: question.options.map((option) => ({
                label: option.label,
                text: option.text,
                isCorrect: option.isCorrect,
              })),
            })),
          })),
        }}
      />
    </div>
  );
}
