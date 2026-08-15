import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import ResumeBuilderForm from "@/components/career/ResumeBuilderForm";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const [resume, submissions] = await Promise.all([
    prisma.resume.findUnique({
      where: { userId: user.id },
      include: {
        education: { orderBy: { order: "asc" } },
        experience: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
      },
    }),
    prisma.projectSubmission.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const importableSubmissions = submissions.map((s) => ({
    id: s.id,
    title: s.project.title,
    link: s.submissionUrl,
    description: s.description,
  }));

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Resume
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Build a clean, one-page resume from your real work — no upload needed.
        </p>
      </div>

      <ResumeBuilderForm
        hasResume={resume !== null}
        importableSubmissions={importableSubmissions}
        initialData={{
          fullName: resume?.fullName ?? user.name ?? "",
          email: resume?.email ?? user.email,
          phone: resume?.phone ?? "",
          location: resume?.location ?? "",
          linkedinUrl: resume?.linkedinUrl ?? "",
          githubUrl: resume?.githubUrl ?? "",
          portfolioUrl: resume?.portfolioUrl ?? "",
          summary: resume?.summary ?? "",
          skills: resume?.skills.join(", ") ?? "",
          education: resume?.education.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy ?? "",
            startYear: e.startYear ? String(e.startYear) : "",
            endYear: e.endYear ? String(e.endYear) : "",
            gpa: e.gpa ?? "",
          })) ?? [],
          experience: resume?.experience.map((e) => ({
            company: e.company,
            role: e.role,
            startDate: e.startDate,
            endDate: e.endDate ?? "",
            description: e.description,
          })) ?? [],
          projects: resume?.projects.map((p) => ({
            title: p.title,
            techStack: p.techStack ?? "",
            link: p.link ?? "",
            description: p.description,
          })) ?? [],
        }}
      />
    </div>
  );
}
