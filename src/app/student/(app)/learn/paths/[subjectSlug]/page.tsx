import { createElement } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { subjectIcon } from "@/lib/subjectIcons";
import { computeSubjectPath, type PathTopic } from "@/lib/skillTree";
import CyberScope from "@/components/learn/paths/CyberScope";

// subjectIcon() returns a reference to an already-defined, stable Lucide
// component — not a new component per call — but a plain `<Icon/>` tag
// bound to a locally-computed variable reads identically, to static
// analysis, as a component defined during render. createElement sidesteps
// that false positive without changing behavior.
function SubjectMark({ iconKey, color }: { iconKey: string; color: string }) {
  return createElement(subjectIcon(iconKey), { className: "h-6 w-6", style: { color } });
}

function NodeIcon({ topic }: { topic: PathTopic }) {
  if (topic.state === "mastered") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (topic.state === "locked") {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    );
  }
  return <span className="font-mono text-[11px] font-black">{String(topic.order + 1).padStart(2, "0")}</span>;
}

export default async function SubjectPathPage({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { subjectSlug } = await params;

  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") {
    notFound();
  }

  const path = await computeSubjectPath(user.id, subject.id);
  const masteredCount = path.filter((t) => t.state === "mastered").length;
  const totalCount = path.length;
  const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const accent = subject.accentColor;

  return (
    <CyberScope>
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: accent }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a
              href="/learn/paths"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-sunk text-lg text-ink-muted transition hover:border-line-soft hover:text-ink"
              title="Change subject"
            >
              ←
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="clip-chip px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${accent}26`, color: accent }}
                >
                  Learning path
                </span>
              </div>
              <h1 className="font-brand mt-1.5 flex items-center gap-2.5 text-2xl font-extrabold text-ink sm:text-3xl">
                <SubjectMark iconKey={subject.iconKey} color={accent} />
                {subject.name}
              </h1>
              <p className="mt-1 text-xs text-ink-faint sm:text-sm">
                {totalCount} topic{totalCount === 1 ? "" : "s"} · master them in order to unlock the next
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface-sunk p-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={accent}
                  strokeWidth="3.5"
                  strokeDasharray={`${pct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-xs font-black text-ink">{pct}%</span>
            </div>
            <div>
              <div className="text-[10.5px] font-bold tracking-wide text-ink-faint uppercase">Path completion</div>
              <div className="text-base font-extrabold text-ink">
                {masteredCount} of {totalCount} <span className="text-xs font-normal text-ink-faintest">mastered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl py-2">
        <div
          className="absolute top-6 bottom-6 left-6 w-[3px] sm:left-1/2"
          style={{ background: `linear-gradient(to bottom, ${accent}, var(--line))` }}
        />

        <div className="space-y-10">
          {path.map((topic, i) => {
            const odd = i % 2 === 1;
            const isBannerStart = i === 0 || topic.unitLabel !== path[i - 1]?.unitLabel;
            const isCurrent = topic.state === "in_progress" || topic.state === "unlocked";
            const isMastered = topic.state === "mastered";
            const isLocked = topic.state === "locked";

            return (
              <div key={topic.id}>
                {isBannerStart && topic.unitLabel ? (
                  <div className="mb-5 text-center">
                    <span className="clip-chip inline-block bg-line-soft px-3.5 py-1 text-[10.5px] font-bold tracking-wide text-ink-faint uppercase">
                      {topic.unitLabel}
                    </span>
                  </div>
                ) : null}
                <div className={`relative flex items-center gap-6 sm:gap-11 ${odd ? "sm:flex-row-reverse" : ""}`}>
                  <a
                    href={`/learn/paths/${subjectSlug}/${topic.slug}`}
                    className={`ml-14 block w-full rounded-2xl border p-4.5 transition sm:ml-0 sm:w-[calc(50%-2.75rem)] ${
                      isMastered
                        ? "border-success/40 bg-surface hover:border-success/70"
                        : isLocked
                          ? "border-line-soft bg-surface-sunk opacity-55 hover:opacity-75"
                          : "border-line bg-surface hover:border-line-soft"
                    }`}
                    style={isCurrent ? { borderColor: accent, boxShadow: `0 0 26px ${accent}33` } : undefined}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[10.5px] font-bold text-ink-faintest">
                        NODE {String(topic.order + 1).padStart(2, "0")}
                      </span>
                      {isMastered ? (
                        <span className="clip-chip bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">✓ Mastered</span>
                      ) : isCurrent ? (
                        <span
                          className="clip-chip px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: `${accent}26`, color: accent }}
                        >
                          {topic.state === "in_progress" ? "In progress" : "Start here"}
                        </span>
                      ) : (
                        <span className="clip-chip bg-line-soft px-2 py-0.5 text-[10px] font-bold text-ink-faintest">Locked</span>
                      )}
                    </div>
                    <h3 className="font-brand text-[14.5px] font-bold text-ink">{topic.name}</h3>
                    <p className="mt-1 line-clamp-2 text-[11.5px] text-ink-faint">{topic.description}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5 text-[11px]">
                      <span className="font-mono font-semibold text-warn">+{topic.xpReward} XP</span>
                      {topic.simulatorKey ? (
                        <span className="text-ink-faint">🎮 Simulator</span>
                      ) : (
                        <span className="text-ink-faintest">Guided theory</span>
                      )}
                    </div>
                  </a>

                  <div
                    className="absolute top-1/2 left-6 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 sm:left-1/2"
                    style={
                      isMastered
                        ? { borderColor: "var(--success)", color: "var(--success)", background: "var(--surface-sunk)", boxShadow: "0 0 16px rgba(52,211,153,.5)" }
                        : isCurrent
                          ? { borderColor: accent, color: accent, background: "var(--surface-sunk)", boxShadow: `0 0 18px ${accent}88` }
                          : { borderColor: "var(--line)", color: "var(--ink-faintest)", background: "var(--surface-sunk)" }
                    }
                  >
                    <NodeIcon topic={topic} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CyberScope>
  );
}
