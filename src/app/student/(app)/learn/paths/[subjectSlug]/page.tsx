import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeSubjectPath, markTopicStarted, type PathTopic } from "@/lib/skillTree";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import { SIMULATOR_REGISTRY } from "@/lib/simulators/registry";

const X_PATTERN = [50, 70, 50, 30]; // percentage across the path column, alternating center/right/center/left
const ROW_HEIGHT = 118;
const TOP_OFFSET = 30;

function stepHref(subjectSlug: string, topicSlug: string, step: string) {
  return `/learn/paths/${subjectSlug}?topic=${topicSlug}&step=${step}`;
}

export default async function SubjectPathPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectSlug: string }>;
  searchParams: Promise<{ topic?: string; step?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { subjectSlug } = await params;
  const { topic: topicSlugParam, step: stepParam } = await searchParams;

  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") {
    notFound();
  }

  const path = await computeSubjectPath(user.id, subject.id);

  const selected: PathTopic | undefined =
    (topicSlugParam ? path.find((t) => t.slug === topicSlugParam) : undefined) ??
    path.find((t) => t.state === "unlocked" || t.state === "in_progress") ??
    path[0];

  if (selected && selected.state !== "locked" && !stepParam) {
    await markTopicStarted(user.id, selected.id);
  }

  const step = stepParam === "simulate" || stepParam === "quiz" ? stepParam : "learn";
  const SimulatorComponent = selected?.simulatorKey ? SIMULATOR_REGISTRY[selected.simulatorKey] : undefined;

  const nodes = path.map((topic, i) => ({
    topic,
    left: X_PATTERN[i % X_PATTERN.length],
    top: TOP_OFFSET + i * ROW_HEIGHT,
    isBannerStart: i === 0 || topic.unitLabel !== path[i - 1]?.unitLabel,
  }));
  const pathHeight = TOP_OFFSET + path.length * ROW_HEIGHT + 40;

  return (
    <div className="max-w-5xl">
      <div className="mb-1">
        <a href="/learn/paths" className="text-sm text-ink-muted hover:text-ink">
          &larr; Learning paths
        </a>
      </div>
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
        {subject.name}
      </h1>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="relative flex-1" style={{ height: pathHeight }}>
          <svg className="absolute left-0 top-0 h-full w-full" preserveAspectRatio="none">
            {nodes.map((n, i) => {
              if (i === 0) return null;
              const prev = nodes[i - 1];
              return (
                <line
                  key={n.topic.id}
                  x1={`${prev.left}%`}
                  y1={prev.top + 40}
                  x2={`${n.left}%`}
                  y2={n.top + 40}
                  style={{ stroke: "var(--line)" }}
                  strokeWidth={20}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {nodes.map(({ topic, left, top, isBannerStart }) => {
            const locked = topic.state === "locked";
            const mastered = topic.state === "mastered";
            const isNext = topic.state === "unlocked";
            const isCurrent = topic.slug === selected?.slug;
            return (
              <div key={topic.id}>
                {isBannerStart && topic.unitLabel ? (
                  <div
                    className="absolute w-full -translate-x-1/2 text-center"
                    style={{ top: top - 36, left: "50%" }}
                  >
                    <span className="rounded-full border border-line bg-surface px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                      {topic.unitLabel}
                    </span>
                  </div>
                ) : null}
                <a
                  href={stepHref(subjectSlug, topic.slug, "learn")}
                  className="absolute flex w-24 -translate-x-1/2 flex-col items-center"
                  style={{ top, left: `${left}%` }}
                >
                  {isNext ? (
                    <span className="absolute -top-11 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 font-brand text-xs font-semibold text-surface">
                      Start here &rarr;
                    </span>
                  ) : null}
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] ${
                      mastered
                        ? "border-transparent bg-success text-white"
                        : isNext
                          ? `border-white bg-accent text-white ${isCurrent ? "animate-pulse" : ""}`
                          : locked
                            ? "border-line-soft bg-surface text-ink-faint"
                            : "border-line bg-accent-soft text-accent"
                    }`}
                  >
                    {mastered ? (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    ) : locked ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    ) : (
                      <span className="font-brand text-lg font-bold">{topic.order + 1}</span>
                    )}
                  </span>
                  <span className={`mt-2 text-center text-xs font-semibold ${locked ? "text-ink-faintest" : "text-ink"}`}>
                    {topic.name}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-faintest">{topic.xpReward} XP</span>
                </a>
              </div>
            );
          })}
        </div>

        {selected ? (
          <div className="w-full lg:w-80 lg:flex-none">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-brand text-base font-bold text-ink">{selected.name}</h2>
              <p className="mt-0.5 font-mono text-xs text-ink-faint">
                {selected.xpReward} XP &middot;{" "}
                {selected.state === "mastered"
                  ? "Mastered"
                  : selected.state === "in_progress"
                    ? "In progress"
                    : selected.state === "locked"
                      ? "Locked"
                      : "Unlocked"}
              </p>

              <div className="mt-4 flex gap-1 rounded-lg bg-line-soft p-1">
                {(["learn", "simulate", "quiz"] as const).map((s) => (
                  <a
                    key={s}
                    href={stepHref(subjectSlug, selected.slug, s)}
                    className={`flex-1 rounded-md py-1.5 text-center text-xs font-semibold capitalize ${
                      step === s ? "bg-surface text-ink" : "text-ink-faint"
                    }`}
                  >
                    {s}
                  </a>
                ))}
              </div>

              <div className="mt-4 text-sm text-ink-secondary">
                {selected.state === "locked" ? (
                  <p className="text-ink-faint">Complete the previous topic to unlock this one.</p>
                ) : step === "learn" ? (
                  <p>{selected.description}</p>
                ) : step === "simulate" ? (
                  SimulatorComponent ? (
                    <p className="text-ink-faint">See the simulator below.</p>
                  ) : (
                    <p className="rounded-lg bg-surface-sunk p-4 text-center text-ink-faint">
                      Simulator coming soon.
                    </p>
                  )
                ) : selected.linkedQuizId ? (
                  <StartQuizButton quizId={selected.linkedQuizId} />
                ) : (
                  <p className="text-ink-faint">No quiz linked yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {step === "simulate" && selected && selected.state !== "locked" && SimulatorComponent ? (
        <div className="mt-6">
          <SimulatorComponent />
        </div>
      ) : null}
    </div>
  );
}
