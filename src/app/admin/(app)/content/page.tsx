import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { CompanyQuestionCategory, ContentStatus, Difficulty, Prisma } from "@prisma/client";
import CreateTrackForm from "@/components/admin/CreateTrackForm";
import CreateLectureForm from "@/components/admin/CreateLectureForm";
import CreateNoteForm from "@/components/admin/CreateNoteForm";
import PublishDraftProblemButton from "@/components/admin/PublishDraftProblemButton";
import SubjectForm from "@/components/admin/SubjectForm";
import TopicForm from "@/components/admin/TopicForm";
import { subjectIcon } from "@/lib/subjectIcons";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-line-soft text-ink-muted",
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

const STATUS_OPTIONS: ContentStatus[] = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED"];
const DIFFICULTY_OPTIONS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const COMPANY_CATEGORY_OPTIONS: CompanyQuestionCategory[] = ["BEHAVIORAL", "TECHNICAL", "HR"];

const PAGE_SIZE = 20;

type Tab = "tracks" | "quizzes" | "problems" | "company-questions" | "learning-paths";
const TABS: { key: Tab; label: string }[] = [
  { key: "tracks", label: "Tracks & videos" },
  { key: "problems", label: "Problems" },
  { key: "quizzes", label: "Quizzes" },
  { key: "company-questions", label: "Company questions" },
  { key: "learning-paths", label: "Learning paths" },
];

type SearchParams = {
  tab?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  q?: string;
  page?: string;
  subjectId?: string;
};

function tabHref(tab: Tab) {
  return `/content?tab=${tab}`;
}

function pageHref(tab: Tab, params: SearchParams, page: number) {
  const usp = new URLSearchParams();
  usp.set("tab", tab);
  if (params.status) usp.set("status", params.status);
  if (params.category) usp.set("category", params.category);
  if (params.difficulty) usp.set("difficulty", params.difficulty);
  if (params.q) usp.set("q", params.q);
  if (page > 1) usp.set("page", String(page));
  return `/content?${usp.toString()}`;
}

function FilterForm({
  tab,
  q,
  status,
  categoryOptions,
  category,
  difficulty,
  searchPlaceholder,
}: {
  tab: Tab;
  q: string;
  status: string;
  categoryOptions: { value: string; label: string }[];
  category: string;
  difficulty?: string;
  searchPlaceholder: string;
}) {
  return (
    <form className="flex flex-wrap items-center gap-2 border-b border-line-soft px-5 py-4">
      <input type="hidden" name="tab" value={tab} />
      <input
        name="q"
        defaultValue={q}
        placeholder={searchPlaceholder}
        className="w-full max-w-xs rounded-md border border-line px-3 py-1.5 text-sm"
      />
      <select
        name="status"
        defaultValue={status}
        className="rounded-md border border-line px-3 py-1.5 text-sm"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select
        name="category"
        defaultValue={category}
        className="rounded-md border border-line px-3 py-1.5 text-sm"
      >
        <option value="">All categories</option>
        {categoryOptions.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      {difficulty !== undefined ? (
        <select
          name="difficulty"
          defaultValue={difficulty}
          className="rounded-md border border-line px-3 py-1.5 text-sm"
        >
          <option value="">All difficulties</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      ) : null}
      <button className="rounded-md border border-line px-3 py-1.5 text-sm font-medium">
        Filter
      </button>
    </form>
  );
}

function Pagination({
  tab,
  params,
  page,
  totalPages,
}: {
  tab: Tab;
  params: SearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      {page > 1 ? (
        <a href={pageHref(tab, params, page - 1)} className="font-medium text-accent">
          ← Previous
        </a>
      ) : (
        <span />
      )}
      <span className="text-ink-faint">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <a href={pageHref(tab, params, page + 1)} className="font-medium text-accent">
          Next →
        </a>
      ) : (
        <span />
      )}
    </div>
  );
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const params = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === params.tab) ? (params.tab as Tab) : "problems";
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const category = params.category ?? "";
  const difficulty = params.difficulty ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [trackCount, quizCount, problemCount, companyQuestionCount, subjectCount] = await Promise.all([
    prisma.track.count(),
    prisma.quiz.count(),
    prisma.problem.count(),
    prisma.companyQuestion.count(),
    prisma.subject.count(),
  ]);

  const authorSelect = { author: { select: { name: true, email: true } } } as const;

  let tracks: Prisma.TrackGetPayload<{
    include: { _count: { select: { lectures: true; notes: true } } };
  }>[] = [];

  let quizzes: Prisma.QuizGetPayload<{ include: typeof authorSelect }>[] = [];
  let quizTotal = 0;
  let quizCategories: string[] = [];

  let problems: Prisma.ProblemGetPayload<{ include: typeof authorSelect }>[] = [];
  let problemTotal = 0;
  let problemCategories: string[] = [];

  let companyQuestions: Prisma.CompanyQuestionGetPayload<{ include: typeof authorSelect }>[] = [];
  let companyQuestionTotal = 0;

  let subjects: Prisma.SubjectGetPayload<{ include: { _count: { select: { topics: true } } } }>[] = [];
  let selectedSubjectId = "";
  let subjectTopics: Prisma.TopicGetPayload<{ include: { linkedQuiz: { select: { title: true } } } }>[] = [];
  let topicQuizOptions: { id: string; title: string }[] = [];

  if (tab === "tracks") {
    tracks = await prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { lectures: true, notes: true } } },
    });
  } else if (tab === "quizzes") {
    const where: Prisma.QuizWhereInput = {
      ...(status ? { status: status as ContentStatus } : {}),
      ...(category ? { topic: category } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    };
    const [rows, total, distinctTopics] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: authorSelect,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.quiz.count({ where }),
      prisma.quiz.findMany({ distinct: ["topic"], select: { topic: true }, orderBy: { topic: "asc" } }),
    ]);
    quizzes = rows;
    quizTotal = total;
    quizCategories = distinctTopics.map((t) => t.topic);
  } else if (tab === "problems") {
    const where: Prisma.ProblemWhereInput = {
      ...(status ? { status: status as ContentStatus } : {}),
      ...(category ? { category } : {}),
      ...(difficulty ? { difficulty: difficulty as Difficulty } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    };
    const [rows, total, distinctCategories] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: authorSelect,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      }),
    ]);
    problems = rows;
    problemTotal = total;
    problemCategories = distinctCategories.map((c) => c.category);
  } else if (tab === "learning-paths") {
    subjects = await prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { topics: true } } },
    });
    selectedSubjectId = params.subjectId ?? subjects[0]?.id ?? "";
    if (selectedSubjectId) {
      [subjectTopics, topicQuizOptions] = await Promise.all([
        prisma.topic.findMany({
          where: { subjectId: selectedSubjectId },
          orderBy: { order: "asc" },
          include: { linkedQuiz: { select: { title: true } } },
        }),
        prisma.quiz
          .findMany({
            where: { kind: "TOPIC_QUIZ", status: "PUBLISHED" },
            orderBy: { title: "asc" },
            select: { id: true, title: true },
          }),
      ]);
    }
  } else {
    const where: Prisma.CompanyQuestionWhereInput = {
      ...(status ? { status: status as ContentStatus } : {}),
      ...(category ? { category: category as CompanyQuestionCategory } : {}),
      ...(q ? { companyName: { contains: q, mode: "insensitive" } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.companyQuestion.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: authorSelect,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.companyQuestion.count({ where }),
    ]);
    companyQuestions = rows;
    companyQuestionTotal = total;
  }

  const totalPages = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Content
        </h1>
        <p className="text-sm text-ink-faint">
          Add tracks, videos, quizzes and problems directly — admin-authored content publishes
          immediately.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const count =
                t.key === "tracks"
                  ? trackCount
                  : t.key === "problems"
                    ? problemCount
                    : t.key === "quizzes"
                      ? quizCount
                      : t.key === "learning-paths"
                        ? subjectCount
                        : companyQuestionCount;
              return (
                // A plain <a>, not next/link's <Link>: this page's data fetch is slow
                // enough that a client-side transition can lose the race against the
                // still-in-flight prefetch and silently fail to navigate. A full
                // navigation always renders correctly, so it's the reliable choice here.
                <a
                  key={t.key}
                  href={tabHref(t.key)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                    tab === t.key ? "bg-ink text-surface" : "border border-line text-ink-secondary"
                  }`}
                >
                  {t.label} ({count})
                </a>
              );
            })}
          </div>
          {tab !== "tracks" && tab !== "learning-paths" ? (
            <a
              href={
                tab === "problems"
                  ? "/content/problems/new"
                  : tab === "quizzes"
                    ? "/content/quizzes/new"
                    : "/content/company-questions/new"
              }
              className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
            >
              {tab === "problems" ? "New problem" : tab === "quizzes" ? "New quiz" : "New question"}
            </a>
          ) : null}
        </div>

        {tab === "tracks" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface">
              {tracks.length ? (
                <div className="divide-y divide-line-soft">
                  {tracks.map((track) => (
                    <div key={track.id} className="px-5 py-3.5">
                      <p className="text-sm font-medium text-ink">{track.name}</p>
                      <p className="text-xs text-ink-faint">
                        {track._count.lectures} lecture{track._count.lectures === 1 ? "" : "s"} ·{" "}
                        {track._count.notes} note{track._count.notes === 1 ? "" : "s"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-6 text-sm text-ink-faint">No tracks yet.</p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">New track</h3>
              <CreateTrackForm />
            </div>

            {tracks.length ? (
              <>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="mb-3 text-sm font-semibold text-ink">New lecture</h3>
                  <CreateLectureForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="mb-3 text-sm font-semibold text-ink">New note</h3>
                  <CreateNoteForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {tab === "learning-paths" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface">
              {subjects.length ? (
                <div className="divide-y divide-line-soft">
                  {subjects.map((subject) => {
                    const Icon = subjectIcon(subject.iconKey);
                    return (
                      <a
                        key={subject.id}
                        href={`/content?tab=learning-paths&subjectId=${subject.id}`}
                        className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                          selectedSubjectId === subject.id ? "bg-surface-sunk" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${subject.accentColor}1a` }}
                          >
                            <Icon className="h-4.5 w-4.5" style={{ color: subject.accentColor }} />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-ink">{subject.name}</p>
                            <p className="text-xs text-ink-faint">
                              {subject._count.topics} topic{subject._count.topics === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[subject.status]}`}
                        >
                          {STATUS_LABEL[subject.status]}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="px-5 py-6 text-sm text-ink-faint">No subjects yet.</p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">New subject</h3>
              <SubjectForm />
            </div>

            {selectedSubjectId ? (
              <>
                <div className="rounded-xl border border-line bg-surface">
                  <div className="border-b border-line-soft px-5 py-4">
                    <h3 className="text-sm font-semibold text-ink">
                      Topics — {subjects.find((s) => s.id === selectedSubjectId)?.name}
                    </h3>
                  </div>
                  {subjectTopics.length ? (
                    <div className="divide-y divide-line-soft">
                      {subjectTopics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-ink">
                              #{topic.order} &middot; {topic.name}
                              {topic.unitLabel ? (
                                <span className="ml-2 text-xs font-normal text-ink-faint">
                                  {topic.unitLabel}
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs text-ink-faint">
                              {topic.xpReward} XP ·{" "}
                              {topic.linkedQuiz ? `Quiz: ${topic.linkedQuiz.title}` : "No quiz linked"} ·{" "}
                              {topic.simulatorKey ? `Simulator: ${topic.simulatorKey}` : "No simulator"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[topic.status]}`}
                          >
                            {STATUS_LABEL[topic.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-6 text-sm text-ink-faint">No topics yet.</p>
                  )}
                </div>

                <div className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="mb-3 text-sm font-semibold text-ink">New topic</h3>
                  <TopicForm
                    subjectId={selectedSubjectId}
                    nextOrder={subjectTopics.length}
                    quizOptions={topicQuizOptions}
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {tab === "problems" ? (
          <div className="rounded-xl border border-line bg-surface">
            <FilterForm
              tab="problems"
              q={q}
              status={status}
              category={category}
              difficulty={difficulty}
              categoryOptions={problemCategories.map((c) => ({ value: c, label: c }))}
              searchPlaceholder="Search problems by title…"
            />
            {problems.length ? (
              <div className="divide-y divide-line-soft">
                {problems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{problem.title}</p>
                      <p className="text-xs text-ink-faint">
                        {problem.category} · {problem.difficulty} · by{" "}
                        {problem.author?.name ?? problem.author?.email ?? "PreCompilers staff"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[problem.status]}`}
                      >
                        {STATUS_LABEL[problem.status]}
                      </span>
                      {problem.status === "DRAFT" && problem.referenceSolutionCode ? (
                        <PublishDraftProblemButton problemId={problem.id} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-ink-faint">No problems match these filters.</p>
            )}
            <Pagination tab="problems" params={params} page={page} totalPages={totalPages(problemTotal)} />
          </div>
        ) : null}

        {tab === "quizzes" ? (
          <div className="rounded-xl border border-line bg-surface">
            <FilterForm
              tab="quizzes"
              q={q}
              status={status}
              category={category}
              categoryOptions={quizCategories.map((c) => ({ value: c, label: c }))}
              searchPlaceholder="Search quizzes by title…"
            />
            {quizzes.length ? (
              <div className="divide-y divide-line-soft">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{quiz.title}</p>
                      <p className="text-xs text-ink-faint">
                        {quiz.topic} · by {quiz.author?.name ?? quiz.author?.email ?? "PreCompilers staff"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[quiz.status]}`}
                    >
                      {STATUS_LABEL[quiz.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-ink-faint">No quizzes match these filters.</p>
            )}
            <Pagination tab="quizzes" params={params} page={page} totalPages={totalPages(quizTotal)} />
          </div>
        ) : null}

        {tab === "company-questions" ? (
          <div className="rounded-xl border border-line bg-surface">
            <FilterForm
              tab="company-questions"
              q={q}
              status={status}
              category={category}
              categoryOptions={COMPANY_CATEGORY_OPTIONS.map((c) => ({
                value: c,
                label: c.charAt(0) + c.slice(1).toLowerCase(),
              }))}
              searchPlaceholder="Search by company name…"
            />
            {companyQuestions.length ? (
              <div className="divide-y divide-line-soft">
                {companyQuestions.map((companyQuestion) => (
                  <div
                    key={companyQuestion.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {companyQuestion.companyName}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {companyQuestion.category} · by{" "}
                        {companyQuestion.author?.name ??
                          companyQuestion.author?.email ??
                          "PreCompilers staff"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[companyQuestion.status]}`}
                    >
                      {STATUS_LABEL[companyQuestion.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-ink-faint">No company questions match these filters.</p>
            )}
            <Pagination
              tab="company-questions"
              params={params}
              page={page}
              totalPages={totalPages(companyQuestionTotal)}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
