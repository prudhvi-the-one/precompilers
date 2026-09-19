import Image from "next/image";
import { createElement } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeSubjectPath, markTopicStarted } from "@/lib/skillTree";
import { DIFFICULTY_STYLE, DIFFICULTY_LABEL, estimatedMinutesFor } from "@/lib/topicDisplay";
import { LEARN_CONTENT_REGISTRY } from "@/lib/learnContent/registry";
import { SIMULATOR_REGISTRY } from "@/lib/simulators/registry";
import { SIMULATOR_PROGRESS_CONTENT, rankForXp } from "@/lib/simulators/progressConfig";
import { ArrayCellsIcon, AnalogyIcon, ProductionIcon, ConceptsIcon, CurriculumIcon, LaunchIcon } from "@/components/learn/paths/icons";
import CyberScope from "@/components/learn/paths/CyberScope";
import SimulateShell from "@/components/learn/paths/SimulateShell";
import ComingNextPanel from "@/components/learn/paths/ComingNextPanel";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import { ArraysSimulatorProvider, type ArraysProgressState } from "@/components/simulators/ArraysSimulatorContext";
import ArraysSimulateShell from "@/components/simulators/ArraysSimulateShell";
import ArraysChallenges from "@/components/simulators/ArraysChallenges";
import ArraysProgress from "@/components/simulators/ArraysProgress";
import TopicStepView from "./TopicStepView";
import LaunchSimulatorButton from "./LaunchSimulatorButton";

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
  const learn = LEARN_CONTENT_REGISTRY[topic.slug];
  const HeaderIcon = learn?.headerIcon ?? ArrayCellsIcon;
  const estMinutes = estimatedMinutesFor(topic.xpReward);

  const progressContentDef = topic.simulatorKey ? SIMULATOR_PROGRESS_CONTENT[topic.simulatorKey] : undefined;
  let initialProgress: ArraysProgressState | null = null;
  if (progressContentDef && !locked) {
    const saved = await prisma.simulatorProgress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      include: { operations: true },
    });
    const operations: ArraysProgressState["operations"] = {};
    for (const op of progressContentDef.operations) {
      const row = saved?.operations.find((o) => o.operation === op);
      operations[op] = { attempts: row?.attempts ?? 0, correct: row?.correct ?? 0, mastered: Boolean(row?.masteredAt) };
    }
    const simulatorXp = saved?.simulatorXp ?? 0;
    initialProgress = {
      simulatorXp,
      globalXpEarned: saved?.globalXpEarned ?? 0,
      currentCorrectStreak: saved?.currentCorrectStreak ?? 0,
      operations,
      quests: {
        firstSteps: Boolean(saved?.questFirstStepsAt),
        allOperationsAttempted: Boolean(saved?.questAllOperationsAttemptedAt),
        streak: Boolean(saved?.questStreakAt),
        allMastered: Boolean(saved?.questAllMasteredAt),
      },
      rank: rankForXp(topic.simulatorKey as string, simulatorXp).name,
    };
  }

  return (
    <CyberScope>
      <div className="mb-5">
        <a href={`/learn/paths/${subjectSlug}`} className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink">
          &larr; Back to {subject.name} Path
        </a>
      </div>

      {locked ? (
        <p className="max-w-[620px] rounded-2xl border border-line bg-surface p-8 text-center text-ink-faint">
          Complete the previous topic to unlock this one.
        </p>
      ) : (
        <TopicStepView
          pathHref={`/learn/paths/${subjectSlug}`}
          learnContent={
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex items-start gap-4.5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
                      <HeaderIcon className="h-7 w-7 text-accent" />
                    </span>
                    <div>
                      <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`clip-chip px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide uppercase ${DIFFICULTY_STYLE[topic.difficulty]}`}
                        >
                          {DIFFICULTY_LABEL[topic.difficulty]}
                        </span>
                        <span className="text-[11.5px] text-ink-faintest">⏱ {estMinutes} mins</span>
                        <span className="font-mono text-[11.5px] font-bold text-warn">+{topic.xpReward} XP</span>
                        <span className="text-[11px] text-ink-faintest">
                          Node {String(topic.order + 1).padStart(2, "0")} of {path.length}
                        </span>
                      </div>
                      <h1 className="font-brand text-[28px] font-extrabold tracking-[-0.01em] text-ink">{topic.name}</h1>
                      <p className="mt-2.5 max-w-[560px] text-sm leading-relaxed text-ink-muted">{topic.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <LaunchSimulatorButton className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan-400 px-5 py-3 font-brand text-[13.5px] font-bold text-surface-sunk">
                      <LaunchIcon className="h-3.5 w-3.5" />
                      Launch Simulator
                    </LaunchSimulatorButton>
                    <span className="max-w-[180px] text-right text-[11px] text-ink-faintest">
                      Mastery unlocks after a 90% Quiz score
                    </span>
                  </div>
                </div>
              </div>

              {learn ? (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-line bg-surface p-6">
                      <div className="mb-3.5 flex items-center gap-2">
                        <AnalogyIcon className="h-4 w-4 text-warn" />
                        <span className="font-brand text-[12.5px] font-bold tracking-wide text-warn uppercase">
                          Real-World Analogy
                        </span>
                      </div>
                      <p className="mb-4 text-[13.5px] leading-relaxed text-ink-muted">{learn.analogy}</p>
                      {learn.analogyImage ? (
                        <div className="relative aspect-[1100/237] overflow-hidden rounded-xl bg-surface-sunk">
                          <Image
                            src={learn.analogyImage.src}
                            alt={learn.analogyImage.alt}
                            fill
                            sizes="(min-width: 640px) 480px, 100vw"
                            className="object-contain"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-[20px] border border-line bg-surface p-6">
                      <div className="mb-3.5 flex items-center gap-2">
                        <ProductionIcon className="h-4 w-4 text-cyan-300" />
                        <span className="font-brand text-[12.5px] font-bold tracking-wide text-cyan-300 uppercase">
                          Why It Matters In Production
                        </span>
                      </div>
                      <p className="text-[13.5px] leading-relaxed text-ink-muted">{learn.whyItMatters}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <ConceptsIcon className="h-[17px] w-[17px] text-accent" />
                      <span className="font-brand text-[15px] font-bold text-ink">Fundamental Concepts You Will Master</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {learn.concepts.map((concept) => {
                        const ConceptIcon = concept.icon;
                        return (
                          <div key={concept.title} className="rounded-2xl border border-line bg-surface p-5">
                            <div className="mb-2.5 flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft">
                                <ConceptIcon className="h-4 w-4 text-accent" />
                              </span>
                              <span className="font-brand text-[13.5px] font-bold text-ink">{concept.title}</span>
                            </div>
                            <p className="text-[12.5px] leading-relaxed text-ink-muted">{concept.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <CurriculumIcon className="h-[17px] w-[17px] text-accent" />
                      <span className="font-brand text-[15px] font-bold text-ink">Step-by-Step Curriculum</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {learn.curriculum.map((step, i) => (
                        <div key={step.title} className="flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-4.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[12.5px] font-bold text-accent">
                            {i + 1}
                          </span>
                          <div>
                            <div className="font-brand text-[13.5px] font-bold text-ink">{step.title}</div>
                            <div className="mt-0.5 text-xs text-ink-muted">{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-accent/35 bg-gradient-to-r from-accent-soft to-cyan-500/10 p-6">
                    <div>
                      <div className="font-brand text-[15px] font-bold text-ink">Ready to see it in action?</div>
                      <div className="mt-1 text-[12.5px] text-ink-muted">
                        Build your own array, step through operations, and watch memory addresses update live.
                      </div>
                    </div>
                    <LaunchSimulatorButton className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan-400 px-5 py-3 font-brand text-[13.5px] font-bold text-surface-sunk">
                      Launch Interactive Simulator &rarr;
                    </LaunchSimulatorButton>
                  </div>
                </>
              ) : null}
            </div>
          }
          simulateContent={
            initialProgress ? (
              <ArraysSimulatorProvider topicId={topic.id} initialProgress={initialProgress}>
                <ArraysSimulateShell
                  simulatorContent={SimulatorComponent ? createElement(SimulatorComponent) : null}
                  challengesContent={<ArraysChallenges />}
                  progressContent={<ArraysProgress />}
                />
              </ArraysSimulatorProvider>
            ) : (
              <SimulateShell
                simulatorContent={
                  SimulatorComponent ? (
                    createElement(SimulatorComponent)
                  ) : (
                    <ComingNextPanel
                      icon={<ProductionIcon className="h-9 w-9 text-cyan-300" />}
                      title="Custom Simulator — built next"
                      description="Build your own array, step through push, pop, insert, delete and search, and watch memory addresses update live as you go."
                    />
                  )
                }
                challengesContent={
                  <ComingNextPanel
                    icon={<CurriculumIcon className="h-9 w-9 text-warn" />}
                    title="Challenges — built next"
                    description="Procedural practice questions generated from this same simulator's engine — unlimited retries. Answer one wrong and you drop straight back into the simulator with that exact data, to see where it broke."
                    note="Not the same as the Quiz step — Challenges don't gate mastery or grant bonus XP."
                  />
                }
                progressContent={
                  <ComingNextPanel
                    icon={<ConceptsIcon className="h-9 w-9 text-accent" />}
                    title="Operation Mastery — built next"
                    description="Per-operation mastery, achievements and levels earned inside this topic's simulator — scoped to this topic, separate from your overall subject progress on the Path map."
                  />
                }
              />
            )
          }
          quizContent={
            topic.linkedQuizId ? (
              <div className="mx-auto max-w-[480px] rounded-2xl border border-line bg-surface p-9 text-center">
                <p className="mb-1.5 font-brand text-[15px] font-bold text-ink">Ready to test what you just learned?</p>
                <p className="mb-5 text-[12.5px] text-ink-muted">
                  Score 90% or higher to master this topic and unlock the next node.
                </p>
                <div className="flex justify-center">
                  <StartQuizButton quizId={topic.linkedQuizId} />
                </div>
              </div>
            ) : (
              <p className="mx-auto max-w-[480px] rounded-2xl border border-line bg-surface p-9 text-center text-ink-faint">
                No quiz linked yet.
              </p>
            )
          }
        />
      )}
    </CyberScope>
  );
}
