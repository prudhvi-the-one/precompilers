import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import NoTrackEmptyState from "@/components/learn/NoTrackEmptyState";

function estimateReadTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "LEARN");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: { track: { include: { notes: { orderBy: { order: "asc" } } } } },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Notes &amp; resources
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          {enrollment
            ? `Reference notes for ${enrollment.track.name}.`
            : "Pick a track to see its notes here."}
        </p>
      </div>

      {!enrollment ? (
        <NoTrackEmptyState description="Pick a track from Skill tracks to unlock its notes and resources." />
      ) : enrollment.track.notes.length ? (
        <div className="space-y-3">
          {enrollment.track.notes.map((note) => (
            <details
              key={note.id}
              className="group rounded-xl border border-line bg-surface open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 marker:content-none">
                <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-line text-ink-faintest">
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex-1 font-brand text-[15px] font-bold text-ink">
                  {note.title}
                </span>
                <span className="shrink-0 text-xs text-ink-faintest">
                  {estimateReadTime(note.content)} min read
                </span>
                <span className="shrink-0 text-ink-faintest transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="px-5 pl-17.5 text-sm whitespace-pre-line text-ink-secondary">
                {note.content}
              </p>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          No notes for this track yet.
        </div>
      )}

      <p className="text-xs text-ink-faintest">
        Downloadable PDF export is coming soon — notes are viewable in-app for
        now.
      </p>
    </div>
  );
}
