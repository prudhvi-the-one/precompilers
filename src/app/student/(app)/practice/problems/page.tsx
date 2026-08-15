import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CompanyFilterSelect from "@/components/practice/CompanyFilterSelect";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-[#E7F7F0] text-[#059669]",
  MEDIUM: "bg-[#FEF6E7] text-[#B45309]",
  HARD: "bg-[#FDEBEC] text-[#DC2626]",
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

  const [allProblems, acceptedSubmissions] = await Promise.all([
    prisma.problem.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" } }),
    prisma.submission.findMany({
      where: { userId: user.id, verdict: "ACCEPTED" },
      select: { problemId: true },
    }),
  ]);
  const solvedIds = new Set(acceptedSubmissions.map((s) => s.problemId));

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
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
            Coding problems
          </h1>
          <p className="text-[14.5px] text-[#55556B]">
            {solvedIds.size} of {allProblems.length} solved.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f.key !== "all") params.set("filter", f.key);
            if (company !== "all") params.set("company", company);
            const query = params.toString();
            return (
              <Link
                key={f.key}
                href={query ? `/practice/problems?${query}` : "/practice/problems"}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  filter === f.key
                    ? "bg-[#0F1020] text-white"
                    : "border border-[#E6E6EF] text-[#2A2A38] hover:bg-white"
                }`}
              >
                {f.label}
              </Link>
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
          return (
            <Link
              key={problem.id}
              href={`/practice/problems/${problem.id}`}
              className="rounded-xl border border-[#E6E6EF] bg-white p-4 hover:bg-[#FBFBFD]"
            >
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono uppercase ${DIFFICULTY_STYLE[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-[#9A9AAE]">{problem.category}</span>
                {solved ? <span className="ml-auto text-[#059669]">✓ Solved</span> : null}
              </div>
              <h2 className="mt-2 font-brand text-base font-bold text-[#0F1020]">
                {problem.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F1F0FE] px-2 py-0.5 text-[11px] font-medium text-indigo-600"
                  >
                    {tag}
                  </span>
                ))}
                {problem.companies.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[#F2F2F7] px-2 py-0.5 text-[11px] font-medium text-[#55556B]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
