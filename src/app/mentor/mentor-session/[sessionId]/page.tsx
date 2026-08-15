import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const KIND_LABEL: Record<string, string> = {
  MOCK: "Mock interview",
  HR_ROUND: "HR round",
  COUNSELLING: "Counselling",
};

export default async function MentorMentorSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    redirect("/login");
  }

  const { sessionId } = await params;
  const mentorSession = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: { mentor: true, student: true },
  });
  if (!mentorSession || mentorSession.mentor.userId !== mentor.id) {
    notFound();
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#23243D] px-6 py-3">
        <div>
          <Link href="/" className="text-xs text-[#7A7A96] hover:text-[#C6C6DC]">
            ← Dashboard
          </Link>
          <p className="font-brand text-sm font-bold text-[#E4E4F0]">
            {KIND_LABEL[mentorSession.kind]} with{" "}
            {mentorSession.student.name ?? mentorSession.student.email}
          </p>
        </div>
        <Link
          href={`/sessions/${mentorSession.id}/wrap-up`}
          className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error"
        >
          End &amp; submit {mentorSession.kind === "COUNSELLING" ? "notes" : "scorecard"}
        </Link>
      </header>

      {mentorSession.roomUrl ? (
        <div className="relative flex-1 bg-black">
          <iframe
            src={`${mentorSession.roomUrl}?name=${encodeURIComponent(mentor.name ?? mentor.email)}`}
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
