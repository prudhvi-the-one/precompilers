import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import GdRoomClient from "@/components/prove/GdRoomClient";

export default async function GdRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { sessionId } = await params;
  const gdSession = await prisma.gdSession.findUnique({ where: { id: sessionId } });
  if (!gdSession) {
    notFound();
  }

  return (
    <GdRoomClient
      sessionId={gdSession.id}
      topic={gdSession.topic}
      scheduledAt={gdSession.scheduledAt.toISOString()}
      minParticipants={gdSession.minParticipants}
    />
  );
}
