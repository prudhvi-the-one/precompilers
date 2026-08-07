import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LiveClassRoom from "@/components/live/LiveClassRoom";

export default async function LiveClassPage({
  params,
}: {
  params: Promise<{ liveClassId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { liveClassId } = await params;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: liveClassId },
    include: { batch: { include: { track: true } } },
  });
  if (!liveClass) {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
  });
  if (enrollment?.batchId !== liveClass.batchId) {
    redirect("/learn/live-classes");
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#23243D] px-6 py-3">
        <div>
          <Link
            href="/learn/live-classes"
            className="text-xs text-[#7A7A96] hover:text-[#C6C6DC]"
          >
            ← {liveClass.batch.track.name}
          </Link>
          <p className="font-brand text-sm font-bold text-[#E4E4F0]">
            {liveClass.title}
          </p>
        </div>
        <Link
          href="/learn/live-classes"
          className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626]"
        >
          Leave
        </Link>
      </header>

      <LiveClassRoom roomUrl={liveClass.joinUrl} displayName={user.name ?? user.email} />
    </>
  );
}
