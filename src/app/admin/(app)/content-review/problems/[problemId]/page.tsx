import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ApproveRejectActions from "@/components/admin/ApproveRejectActions";

type ExampleJson = { input?: string; output?: string; explanation?: string };

export default async function ReviewProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      author: { select: { name: true, email: true } },
      testCases: { orderBy: { order: "asc" } },
    },
  });

  if (!problem || problem.status !== "PENDING_REVIEW") {
    notFound();
  }

  const examples = (Array.isArray(problem.examples) ? problem.examples : []) as ExampleJson[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          {problem.title}
        </h1>
        <p className="text-sm text-gray-500">
          {problem.difficulty} · {problem.category} · by{" "}
          {problem.author?.name ?? problem.author?.email ?? "Unknown mentor"}
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Statement</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{problem.statement}</p>
        </div>

        {examples.length ? (
          <div>
            <p className="text-sm font-semibold text-gray-900">Examples</p>
            <div className="mt-1 space-y-2">
              {examples.map((example, index) => (
                <div key={index} className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                  <p>Input: {example.input}</p>
                  <p>Output: {example.output}</p>
                  {example.explanation ? <p>Explanation: {example.explanation}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">Constraints</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{problem.constraints}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Hints</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{problem.hints}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Solution explanation</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
            {problem.solutionExplanation}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Test cases</p>
          <div className="mt-1 space-y-2">
            {problem.testCases.map((testCase) => (
              <div key={testCase.id} className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                <p>Input: {testCase.input}</p>
                <p>Expected output: {testCase.expectedOutput}</p>
                <p className="text-gray-400">{testCase.isSample ? "Visible sample" : "Hidden"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ApproveRejectActions type="problems" id={problem.id} />
    </div>
  );
}
