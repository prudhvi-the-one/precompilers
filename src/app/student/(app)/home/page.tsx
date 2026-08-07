import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const PILLARS = [
  "Fundamentals",
  "Aptitude & communication",
  "Problem solving",
  "Industry skills",
  "Projects",
  "Interview performance",
];

function minutesUntil(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 60000);
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profileComplete = Boolean(
    user.college && user.branch && user.gradYear
  );

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: {
      track: { include: { lectures: { orderBy: { order: "asc" } } } },
      batch: {
        include: { liveClasses: { orderBy: { scheduledAt: "asc" } } },
      },
    },
  });

  const completedIds = enrollment
    ? new Set(
        (
          await prisma.lectureProgress.findMany({
            where: {
              userId: user.id,
              lectureId: { in: enrollment.track.lectures.map((l) => l.id) },
              completedAt: { not: null },
            },
          })
        ).map((p) => p.lectureId)
      )
    : new Set<string>();

  const nextLecture = enrollment?.track.lectures.find(
    (l) => !completedIds.has(l.id)
  );

  const soonLiveClass = enrollment?.batch?.liveClasses.find((lc) => {
    const mins = minutesUntil(lc.scheduledAt);
    return mins >= 0 && mins <= 60;
  });

  return (
    <div className="max-w-3xl space-y-4.5">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          {enrollment
            ? enrollment.track.name
            : user.gradYear
              ? `Class of ${user.gradYear}`
              : "Let's get your profile set up first."}
        </p>
      </div>

      {soonLiveClass ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#DDD9FB] bg-gradient-to-r from-[#F6F5FF] to-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10.5 w-10.5 items-center justify-center rounded-lg bg-indigo-600 font-mono text-[10px] font-bold text-white">
              LIVE
            </span>
            <div>
              <p className="text-sm font-semibold text-[#0F1020]">
                {soonLiveClass.title}
              </p>
              <p className="text-xs text-[#8A8AA0]">
                Starts in {minutesUntil(soonLiveClass.scheduledAt)} minutes
              </p>
            </div>
          </div>
          <a
            href={soonLiveClass.joinUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-[#4338CA]"
          >
            Join class
          </a>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">
          What to do next
        </h2>

        {!profileComplete ? (
          <NextActionRow
            title="Complete your profile"
            description="College, branch and graduation year help us personalize what's coming."
            href="/profile"
            cta="Go to profile"
          />
        ) : !enrollment ? (
          <NextActionRow
            title="Set your track"
            description="Tell us what you're working towards so Learn has something for you."
            href="/onboarding"
            cta="Set your track"
          />
        ) : nextLecture ? (
          <NextActionRow
            title={`Continue ${enrollment.track.name}`}
            description={nextLecture.title}
            href={`/learn/lectures/${nextLecture.id}`}
            cta="Resume"
          />
        ) : (
          <p className="mt-2 text-sm text-[#55556B]">
            You&apos;ve finished every lecture in {enrollment.track.name}.
            Practice, Prove and Career are being built next.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">
          Readiness by pillar
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar}>
              <div className="text-xs text-[#55556B]">{pillar}</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[#EDEDF3]" />
              <div className="mt-1 text-xs text-[#9A9AAE]">Not assessed</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NextActionRow({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-[#DDD9FB] bg-[#FBFAFF] px-4 py-3">
      <div>
        <div className="text-sm font-medium text-[#0F1020]">{title}</div>
        <div className="text-xs text-[#8A8AA0]">{description}</div>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-md border border-[#DDD9FB] px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-white"
      >
        {cta}
      </Link>
    </div>
  );
}
