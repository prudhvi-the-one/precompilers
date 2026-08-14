import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import ProblemEditorClient from "@/components/practice/ProblemEditorClient";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      testCases: { where: { isSample: true }, orderBy: { order: "asc" } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  if (!problem || problem.status !== "PUBLISHED") {
    notFound();
  }

  const locked = !meetsEntitlement(user.entitlement, problem.requiredEntitlement);

  return <ProblemEditorClient problem={problem} locked={locked} />;
}
