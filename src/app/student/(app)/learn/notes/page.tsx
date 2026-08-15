import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";

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

      {enrollment?.track.notes.length ? (
        <div className="space-y-3">
          {enrollment.track.notes.map((note) => (
            <details
              key={note.id}
              className="group rounded-xl border border-line bg-surface open:pb-5"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-brand text-[15px] font-bold text-ink marker:content-none">
                <span className="mr-2 inline-block text-ink-faintest transition-transform group-open:rotate-90">
                  ›
                </span>
                {note.title}
              </summary>
              <p className="px-5 text-sm whitespace-pre-line text-ink-secondary">
                {note.content}
              </p>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {enrollment
            ? "No notes for this track yet."
            : "Set your track to see its notes."}
        </div>
      )}

      <p className="text-xs text-ink-faintest">
        Downloadable PDF export is coming soon — notes are viewable in-app for
        now.
      </p>
    </div>
  );
}
