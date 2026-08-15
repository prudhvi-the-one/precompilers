import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import MockFeedbackForm from "@/components/prove/MockFeedbackForm";

export default async function MockFeedbackPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const { requestId } = await params;
  const mockRequest = await prisma.mockRequest.findUnique({
    where: { id: requestId },
  });
  if (!mockRequest || mockRequest.userId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="font-brand text-[22px] font-bold text-[#0F1020]">
          How did it go?
        </h1>
        <p className="text-[13.5px] text-[#8A8AA0]">
          Rate your partner — this feeds their Interview performance pillar.
        </p>
      </div>
      <MockFeedbackForm requestId={requestId} />
    </div>
  );
}
