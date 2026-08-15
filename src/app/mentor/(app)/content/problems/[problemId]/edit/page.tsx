import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProblemAuthorForm from "@/components/mentor/ProblemAuthorForm";

type ExampleJson = { input?: string; output?: string; explanation?: string };

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: { orderBy: { order: "asc" } } },
  });

  if (
    !problem ||
    problem.authorId !== mentor.id ||
    (problem.status !== "DRAFT" && problem.status !== "REJECTED")
  ) {
    notFound();
  }

  const examples = (Array.isArray(problem.examples) ? problem.examples : []) as ExampleJson[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
        Edit problem
      </h1>
      {problem.status === "REJECTED" && problem.rejectionReason ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejected: {problem.rejectionReason}
        </p>
      ) : null}
      <ProblemAuthorForm
        mode="edit"
        problemId={problem.id}
        initialData={{
          title: problem.title,
          difficulty: problem.difficulty,
          category: problem.category,
          tags: problem.tags.join(", "),
          companies: problem.companies.join(", "),
          statement: problem.statement,
          examples: examples.map((e) => ({
            input: e.input ?? "",
            output: e.output ?? "",
            explanation: e.explanation ?? "",
          })),
          constraints: problem.constraints,
          hints: problem.hints,
          solutionExplanation: problem.solutionExplanation,
          requiredEntitlement: problem.requiredEntitlement,
          testCases: problem.testCases.map((t) => ({
            input: t.input,
            expectedOutput: t.expectedOutput,
            isSample: t.isSample,
          })),
        }}
      />
    </div>
  );
}
