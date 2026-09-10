import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeSubjectPath, markTopicStarted } from "@/lib/skillTree";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import { SIMULATOR_REGISTRY } from "@/lib/simulators/registry";
import TopicStepView from "./TopicStepView";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectSlug: string; topicSlug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { subjectSlug, topicSlug } = await params;

  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") {
    notFound();
  }

  const path = await computeSubjectPath(user.id, subject.id);
  const topic = path.find((t) => t.slug === topicSlug);
  if (!topic) {
    notFound();
  }

  const locked = topic.state === "locked";
  if (!locked) {
    await markTopicStarted(user.id, topic.id);
  }

  const SimulatorComponent = topic.simulatorKey ? SIMULATOR_REGISTRY[topic.simulatorKey] : undefined;

  return (
    <div>
      <div className="mb-1">
        <a href={`/learn/paths/${subjectSlug}`} className="text-sm text-ink-muted hover:text-ink">
          &larr; Back to path
        </a>
      </div>
      <h1 className="font-brand text-[32px] font-bold tracking-[-0.015em] text-ink">{topic.name}</h1>
      <p className="mt-1 text-[12.5px] text-ink-faint">
        {topic.xpReward} XP{" "}
        <span className="ml-2 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-bold text-success">
          {topic.state === "mastered"
            ? "Mastered"
            : topic.state === "in_progress"
              ? "In progress"
              : topic.state === "locked"
                ? "Locked"
                : "Unlocked"}
        </span>
      </p>

      {locked ? (
        <p className="mt-6 max-w-[620px] rounded-xl border border-line bg-surface p-6 text-center text-ink-faint">
          Complete the previous topic to unlock this one.
        </p>
      ) : (
        <TopicStepView
          pathHref={`/learn/paths/${subjectSlug}`}
          learnContent={
            <p className="font-brand text-[22px] font-bold leading-[1.45] tracking-[-0.01em] text-ink">
              {topic.description}
            </p>
          }
          simulateContent={
            SimulatorComponent ? (
              <SimulatorComponent />
            ) : (
              <p className="rounded-xl border border-line bg-surface-sunk p-10 text-center text-ink-faint">
                Simulator coming soon.
              </p>
            )
          }
          quizContent={
            topic.linkedQuizId ? (
              <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                <p className="mb-4 text-sm text-ink-muted">Ready to test what you just learned?</p>
                <div className="flex justify-center">
                  <StartQuizButton quizId={topic.linkedQuizId} />
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-faint">
                No quiz linked yet.
              </p>
            )
          }
        />
      )}
    </div>
  );
}
