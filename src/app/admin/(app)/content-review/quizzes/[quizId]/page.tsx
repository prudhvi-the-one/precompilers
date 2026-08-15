import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ApproveRejectActions from "@/components/admin/ApproveRejectActions";

export default async function ReviewQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      author: { select: { name: true, email: true } },
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

  if (!quiz || quiz.status !== "PENDING_REVIEW") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          {quiz.title}
        </h1>
        <p className="text-sm text-ink-faint">
          {quiz.topic} · {quiz.kind === "TOPIC_QUIZ" ? "Topic quiz" : "Aptitude paper"} · by{" "}
          {quiz.author?.name ?? quiz.author?.email ?? "Unknown mentor"}
        </p>
      </div>

      <div className="space-y-4">
        {quiz.sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-line bg-surface p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">
              {section.name} · {section.durationMinutes} min
            </p>
            <div className="space-y-3">
              {section.questions.map((question) => (
                <div key={question.id} className="rounded-lg bg-surface-sunk p-3">
                  <p className="text-sm text-ink">{question.text}</p>
                  <ul className="mt-2 space-y-1">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={`text-xs ${
                          option.isCorrect ? "font-semibold text-green-700" : "text-ink-muted"
                        }`}
                      >
                        {option.label}. {option.text} {option.isCorrect ? "✓" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ApproveRejectActions type="quizzes" id={quiz.id} />
    </div>
  );
}
