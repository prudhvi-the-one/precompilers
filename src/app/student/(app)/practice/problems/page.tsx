import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import CompanyFilterSelect from "@/components/practice/CompanyFilterSelect";
import AngularBorder from "@/components/ui/AngularBorder";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-success-soft text-success",
  MEDIUM: "bg-warn-soft text-warn",
  HARD: "bg-error-soft text-error",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; company?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { filter = "all", company = "all" } = await searchParams;

  let allProblems;
  let closesAtByProblem = new Map<string, Date>();
  let externalReleases: {
    id: string;
    externalProblemSlug: string;
    externalProblemTitle: string | null;
    releasedAt: Date;
    closesAt: Date;
    solved: boolean;
  }[] = [];
  let leetCodeAccountStatus: "ACTIVE" | "UNVERIFIED" | "BLOCKED_OR_PRIVATE" | "NOT_LINKED" = "NOT_LINKED";
  if (user.vendorId) {
    // Vendor students see only their currently-open scheduled releases —
    // a separate access mode, not the FREE/INDIVIDUAL/INSTITUTION paywall.
    const [releases, externalReleaseRows, externalAccount] = await Promise.all([
      prisma.scheduledRelease.findMany({
        where: { vendorId: user.vendorId, problemId: { not: null }, closesAt: { gt: new Date() } },
        include: { problem: true },
        orderBy: { releasedAt: "desc" },
      }),
      prisma.scheduledRelease.findMany({
        where: {
          vendorId: user.vendorId,
          externalProblemSlug: { not: null },
          closesAt: { gt: new Date() },
        },
        orderBy: { releasedAt: "desc" },
      }),
      prisma.externalJudgeAccount.findUnique({
        where: { userId_platform: { userId: user.id, platform: "LEETCODE" } },
        include: { submissions: true },
      }),
    ]);
    allProblems = releases
      .map((r) => r.problem)
      .filter((p): p is NonNullable<typeof p> => p !== null && p.status === "PUBLISHED");
    closesAtByProblem = new Map(releases.map((r) => [r.problemId as string, r.closesAt]));
    externalReleases = externalReleaseRows.map((r) => ({
      id: r.id,
      externalProblemSlug: r.externalProblemSlug as string,
      externalProblemTitle: r.externalProblemTitle,
      releasedAt: r.releasedAt,
      closesAt: r.closesAt,
      solved: Boolean(
        externalAccount?.submissions.some(
          (s) =>
            s.problemSlug === r.externalProblemSlug &&
            s.submittedAt >= r.releasedAt &&
            s.submittedAt <= r.closesAt
        )
      ),
    }));
    leetCodeAccountStatus = externalAccount?.trackingStatus ?? "NOT_LINKED";
  } else {
    await requireTierAccess(user, "PRACTICE");
    allProblems = await prisma.problem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
    });
  }

  const [acceptedSubmissions, submissionStats] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id, verdict: "ACCEPTED" },
      select: { problemId: true },
    }),
    prisma.submission.groupBy({
      by: ["problemId", "verdict"],
      _count: { _all: true },
    }),
  ]);
  const solvedIds = new Set(acceptedSubmissions.map((s) => s.problemId));

  const accuracyByProblem = new Map<string, number>();
  {
    const totals = new Map<string, { accepted: number; total: number }>();
    for (const row of submissionStats) {
      const entry = totals.get(row.problemId) ?? { accepted: 0, total: 0 };
      entry.total += row._count._all;
      if (row.verdict === "ACCEPTED") entry.accepted += row._count._all;
      totals.set(row.problemId, entry);
    }
    for (const [problemId, { accepted, total }] of totals) {
      if (total > 0) accuracyByProblem.set(problemId, Math.round((accepted / total) * 100));
    }
  }

  const companies = [...new Set(allProblems.flatMap((p) => p.companies))].sort();

  const problems = allProblems.filter((p) => {
    const matchesDifficulty = filter === "all" || p.difficulty === filter.toUpperCase();
    const matchesCompany = company === "all" || p.companies.includes(company);
    return matchesDifficulty && matchesCompany;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Coding problems
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            {solvedIds.size} of {allProblems.length} solved.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f.key !== "all") params.set("filter", f.key);
            if (company !== "all") params.set("company", company);
            const query = params.toString();
            const href = query ? `/practice/problems?${query}` : "/practice/problems";
            return filter === f.key ? (
              <a key={f.key} href={href} className="clip-chip bg-ink px-3.5 py-1.5 text-[13px] font-medium text-surface">
                {f.label}
              </a>
            ) : (
              <AngularBorder key={f.key} clip="clip-chip" color="var(--line)" className="bg-surface">
                <a href={href} className="block px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunk">
                  {f.label}
                </a>
              </AngularBorder>
            );
          })}
          {companies.length ? (
            <CompanyFilterSelect companies={companies} selected={company} />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => {
          const solved = solvedIds.has(problem.id);
          const accuracy = accuracyByProblem.get(problem.id);
          const closesAt = closesAtByProblem.get(problem.id);
          return (
            <div key={problem.id} className="clip-panel bg-line p-[2px]">
              <a
                href={`/practice/problems/${problem.id}`}
                className="clip-panel block bg-surface p-4 hover:bg-surface-sunk"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`clip-chip px-2.5 py-0.5 font-mono uppercase ${DIFFICULTY_STYLE[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="text-ink-faintest">{problem.category}</span>
                  {accuracy !== undefined ? (
                    <span className="font-mono text-ink-faintest">{accuracy}% acc.</span>
                  ) : null}
                  {solved ? <span className="ml-auto text-success">✓ Solved</span> : null}
                </div>
                {closesAt ? (
                  <p className="mt-1 text-[11px] text-ink-faint">
                    Closes{" "}
                    {closesAt.toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hourCycle: "h23",
                    })}
                  </p>
                ) : null}
                <h2 className="mt-2 font-brand text-base font-bold text-ink">
                  {problem.title}
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="clip-chip bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-indigo-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {problem.companies.map((c) => (
                    <span
                      key={c}
                      className="clip-chip flex items-center gap-1 bg-line-soft px-2 py-0.5 text-[11px] font-medium text-ink-muted"
                    >
                      <Building2 className="h-3 w-3" strokeWidth={2} />
                      {c}
                    </span>
                  ))}
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {externalReleases.length ? (
        <div className="space-y-3">
          <h2 className="font-brand text-lg font-bold text-ink">LeetCode problems</h2>
          {leetCodeAccountStatus !== "ACTIVE" ? (
            <AngularBorder color="var(--line)" className="bg-warn-soft px-4 py-2.5 text-sm text-warn">
              {leetCodeAccountStatus === "BLOCKED_OR_PRIVATE"
                ? "We lost track of your LeetCode activity — check your submission-history privacy setting on LeetCode, then re-verify on your "
                : "Link your LeetCode account on your "}
              <a href="/profile" className="underline">
                profile
              </a>{" "}
              to get credit for these.
            </AngularBorder>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {externalReleases.map((release) => (
              <div key={release.id} className="clip-panel bg-line p-[2px]">
                <a
                  href={`https://leetcode.com/problems/${release.externalProblemSlug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clip-panel block bg-surface p-4 hover:bg-surface-sunk"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="clip-chip bg-line-soft px-2.5 py-0.5 font-mono uppercase text-ink-muted">
                      LeetCode
                    </span>
                    {release.solved ? <span className="ml-auto text-success">✓ Solved</span> : null}
                  </div>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    Closes{" "}
                    {release.closesAt.toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hourCycle: "h23",
                    })}
                  </p>
                  <h2 className="mt-2 font-brand text-base font-bold text-ink">
                    {release.externalProblemTitle ?? release.externalProblemSlug}
                  </h2>
                  <p className="mt-2 text-xs font-medium text-accent">Solve on LeetCode ↗</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
