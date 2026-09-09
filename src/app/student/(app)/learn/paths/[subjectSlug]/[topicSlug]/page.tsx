import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeSubjectPath, markTopicStarted } from "@/lib/skillTree";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import { SIMULATOR_REGISTRY } from "@/lib/simulators/registry";

function stepHref(subjectSlug: string, topicSlug: string, step: string) {
  return `/learn/paths/${subjectSlug}/${topicSlug}?step=${step}`;
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectSlug: string; topicSlug: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { subjectSlug, topicSlug } = await params;
  const { step: stepParam } = await searchParams;

  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") {
    notFound();
  }

  const path = await computeSubjectPath(user.id, subject.id);
  const topic = path.find((t) => t.slug === topicSlug);
  if (!topic) {
    notFound();
  }

  if (topic.state !== "locked" && !stepParam) {
    await markTopicStarted(user.id, topic.id);
  }

  const step = stepParam === "simulate" || stepParam === "quiz" ? stepParam : "learn";
  const SimulatorComponent = topic.simulatorKey ? SIMULATOR_REGISTRY[topic.simulatorKey] : undefined;
  const locked = topic.state === "locked";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1">
        <a href={`/learn/paths/${subjectSlug}`} className="text-sm text-ink-muted hover:text-ink">
          &larr; Back to path
        </a>
      </div>
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">{topic.name}</h1>
      <p className="mt-0.5 font-mono text-xs text-ink-faint">
        {topic.xpReward} XP &middot;{" "}
        {topic.state === "mastered"
          ? "Mastered"
          : topic.state === "in_progress"
            ? "In progress"
            : topic.state === "locked"
              ? "Locked"
              : "Unlocked"}
      </p>

      <div className="mt-6 flex w-fit gap-1 rounded-lg bg-line-soft p-1">
        {(["learn", "simulate", "quiz"] as const).map((s) => (
          <a
            key={s}
            href={stepHref(subjectSlug, topicSlug, s)}
            className={`rounded-md px-6 py-2 text-center text-sm font-semibold capitalize ${
              step === s ? "bg-surface text-ink" : "text-ink-faint"
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="mt-6">
        {locked ? (
          <p className="rounded-xl border border-line bg-surface p-6 text-center text-ink-faint">
            Complete the previous topic to unlock this one.
          </p>
        ) : step === "learn" ? (
          <p className="rounded-xl border border-line bg-surface p-6 text-lg leading-relaxed text-ink">
            {topic.description}
          </p>
        ) : step === "simulate" ? (
          SimulatorComponent ? (
            <SimulatorComponent />
          ) : (
            <p className="rounded-xl border border-line bg-surface-sunk p-10 text-center text-ink-faint">
              Simulator coming soon.
            </p>
          )
        ) : topic.linkedQuizId ? (
          <div className="rounded-xl border border-line bg-surface p-6">
            <StartQuizButton quizId={topic.linkedQuizId} />
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-surface p-6 text-center text-ink-faint">
            No quiz linked yet.
          </p>
        )}
      </div>
    </div>
  );
}
