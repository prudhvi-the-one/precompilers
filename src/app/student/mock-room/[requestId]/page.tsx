import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function MockRoomPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { requestId } = await params;

  const mockRequest = await prisma.mockRequest.findUnique({
    where: { id: requestId },
    include: { pairedWith: { include: { user: true } } },
  });
  if (!mockRequest || mockRequest.userId !== user.id) {
    notFound();
  }
  if (!mockRequest.pairedWith) {
    redirect("/prove/mocks");
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#23243D] px-6 py-3">
        <div>
          <Link
            href="/prove/mocks"
            className="text-xs text-[#7A7A96] hover:text-[#C6C6DC]"
          >
            ← Prove / Mock interviews
          </Link>
          <p className="font-brand text-sm font-bold text-[#E4E4F0]">
            Peer mock interview
          </p>
        </div>
        <Link
          href={`/prove/mocks/feedback/${requestId}`}
          className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626]"
        >
          Done — leave feedback
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm rounded-xl border border-dashed border-[#33344F] bg-[#151633] p-8 text-center">
          <p className="text-sm font-semibold text-[#E4E4F0]">
            You&apos;re paired with {mockRequest.pairedWith.user.name ?? "your partner"}
          </p>
          <p className="mt-2 text-sm text-[#7A7A96]">
            Live in-app video is coming soon — we&apos;re finalizing the video
            vendor for peer-only rooms. For now, connect however works for you
            both, run the mock, then come back here to leave feedback.
          </p>
        </div>
      </div>
    </>
  );
}
