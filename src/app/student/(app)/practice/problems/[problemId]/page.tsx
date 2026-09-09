import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
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

  let locked: boolean;
  if (user.vendorId) {
    const openRelease = await prisma.scheduledRelease.findFirst({
      where: { vendorId: user.vendorId, problemId, closesAt: { gt: new Date() } },
    });
    if (!openRelease) {
      notFound();
    }
    locked = false;
  } else {
    await requireTierAccess(user, "PRACTICE");
    locked = false; // set below once the problem is loaded
  }

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

  if (!user.vendorId) {
    locked = !meetsEntitlement(user.entitlement, problem.requiredEntitlement);
  }

  return <ProblemEditorClient problem={problem} locked={locked} />;
}
