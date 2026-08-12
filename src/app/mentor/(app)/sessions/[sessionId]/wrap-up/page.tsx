import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ScorecardForm from "@/components/mentor/ScorecardForm";
import NotesForm from "@/components/mentor/NotesForm";

export default async function SessionWrapUpPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const { sessionId } = await params;
  const mentorSession = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: { mentor: true, student: true, scorecard: true },
  });
  if (!mentorSession || mentorSession.mentor.userId !== mentor.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-brand text-xl font-bold text-gray-900">
          {mentorSession.kind === "COUNSELLING" ? "Session notes" : "Scorecard"}
        </h1>
        <p className="text-sm text-gray-500">
          For {mentorSession.student.name ?? mentorSession.student.email}
        </p>
      </div>

      {mentorSession.status === "COMPLETED" ? (
        <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Already submitted for this session.
        </p>
      ) : mentorSession.kind === "COUNSELLING" ? (
        <NotesForm sessionId={mentorSession.id} />
      ) : (
        <ScorecardForm sessionId={mentorSession.id} />
      )}
    </div>
  );
}
