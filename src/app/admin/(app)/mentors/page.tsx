import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PreferredMentorToggle from "@/components/admin/PreferredMentorToggle";

export default async function MentorsPage() {
  const user = await requireRole("INSTITUTION_ADMIN");
  if (!user || !user.institutionId) {
    redirect("/login");
  }

  const [mentors, preferred] = await Promise.all([
    prisma.mentorProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.institutionPreferredMentor.findMany({
      where: { institutionId: user.institutionId },
      select: { mentorId: true },
    }),
  ]);
  const preferredIds = new Set(preferred.map((p) => p.mentorId));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Mentors
        </h1>
        <p className="text-sm text-ink-faint">
          Mark preferred mentors — their open slots show first to your students when booking, but
          every mentor stays bookable by everyone.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        {mentors.length ? (
          <div className="divide-y divide-line-soft">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {mentor.user.name ?? mentor.user.email}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {mentor.bio}
                    {mentor.specializations.length
                      ? ` · ${mentor.specializations.join(", ")}`
                      : ""}
                  </p>
                </div>
                <PreferredMentorToggle
                  mentorId={mentor.id}
                  initialPreferred={preferredIds.has(mentor.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No mentors yet.</p>
        )}
      </div>
    </div>
  );
}
