import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import CompanyQuestionFilterSelect from "@/components/career/CompanyQuestionFilterSelect";

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "behavioral", label: "Behavioral" },
  { key: "technical", label: "Technical" },
  { key: "hr", label: "HR" },
];

export default async function CompanyQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; company?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const { category = "all", company = "all" } = await searchParams;

  const allQuestions = await prisma.companyQuestion.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { companyName: "asc" },
  });

  const companies = [...new Set(allQuestions.map((q) => q.companyName))].sort();

  const questions = allQuestions.filter((q) => {
    const matchesCategory = category === "all" || q.category === category.toUpperCase();
    const matchesCompany = company === "all" || q.companyName === company;
    return matchesCategory && matchesCompany;
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Question bank
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            Behavioral, technical and HR questions asked by real companies, with guidance on how
            to answer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f.key !== "all") params.set("category", f.key);
            if (company !== "all") params.set("company", company);
            const query = params.toString();
            return (
              <Link
                key={f.key}
                href={query ? `/career/questions?${query}` : "/career/questions"}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  category === f.key
                    ? "bg-ink text-surface"
                    : "border border-line text-ink-secondary hover:bg-surface"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
          {companies.length ? (
            <CompanyQuestionFilterSelect companies={companies} selected={company} />
          ) : null}
        </div>
      </div>

      {questions.length ? (
        <div className="space-y-3">
          {questions.map((q) => (
            <details
              key={q.id}
              className="group rounded-xl border border-line bg-surface open:pb-5"
            >
              <summary className="cursor-pointer list-none px-5 py-4 marker:content-none">
                <span className="mr-2 inline-block text-ink-faintest transition-transform group-open:rotate-90">
                  ›
                </span>
                <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                  {q.companyName}
                </span>
                <span className="mr-2 rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {q.category}
                </span>
                <span className="font-brand text-[15px] font-bold text-ink">
                  {q.question}
                </span>
              </summary>
              <p className="px-5 text-sm whitespace-pre-line text-ink-secondary">{q.guidance}</p>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          No questions match these filters yet.
        </div>
      )}
    </div>
  );
}
