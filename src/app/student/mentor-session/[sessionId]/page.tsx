import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const KIND_LABEL: Record<string, string> = {
  MOCK: "Mock interview",
  HR_ROUND: "HR round",
  COUNSELLING: "Counselling",
};

export default async function StudentMentorSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { sessionId } = await params;
  const mentorSession = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: { mentor: { include: { user: true } } },
  });
  if (!mentorSession || mentorSession.studentId !== user.id) {
    notFound();
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#23243D] px-6 py-3">
        <div>
          <Link href="/prove/mocks" className="text-xs text-[#7A7A96] hover:text-[#C6C6DC]">
            ← Prove / Mentors
          </Link>
          <p className="font-brand text-sm font-bold text-[#E4E4F0]">
            {KIND_LABEL[mentorSession.kind]} with {mentorSession.mentor.user.name ?? "your mentor"}
          </p>
        </div>
        <Link
          href="/prove/mocks"
          className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error"
        >
          Leave
        </Link>
      </header>

      {mentorSession.roomUrl ? (
        <div className="relative flex-1 bg-black">
          <iframe
            src={`${mentorSession.roomUrl}?name=${encodeURIComponent(user.name ?? user.email)}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-[#7A7A96]">
            The video room is still being set up — refresh in a moment.
          </p>
        </div>
      )}
    </>
  );
}
