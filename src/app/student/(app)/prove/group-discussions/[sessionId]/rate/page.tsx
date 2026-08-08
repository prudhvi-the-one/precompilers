import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import GdRatingForm from "@/components/prove/GdRatingForm";

export default async function GdRatePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { sessionId } = await params;
  const gdSession = await prisma.gdSession.findUnique({
    where: { id: sessionId },
    include: { participants: { include: { user: true } } },
  });
  if (!gdSession) {
    notFound();
  }

  const peers = gdSession.participants
    .filter((p) => p.userId !== user.id)
    .map((p) => ({ userId: p.userId, displayName: p.user.name ?? "Student" }));

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="font-brand text-[22px] font-bold text-[#0F1020]">
          Rate the discussion
        </h1>
        <p className="text-[13.5px] text-[#8A8AA0]">
          Anonymous to everyone else. The average feeds your own Aptitude &amp;
          communication pillar too, once others rate you.
        </p>
      </div>
      <GdRatingForm sessionId={sessionId} peers={peers} />
    </div>
  );
}
