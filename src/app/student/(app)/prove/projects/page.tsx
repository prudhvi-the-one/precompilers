import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import SubmitProjectForm from "@/components/prove/SubmitProjectForm";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: {
      submissions: {
        where: { userId: user.id },
        include: { _count: { select: { reviews: true } } },
      },
    },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-[#8A8AA0] hover:text-[#0F1020]">
        ← Prove
      </Link>
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Project briefs
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Briefed like real work, reviewed by peers.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const locked = !meetsEntitlement(user.entitlement, project.requiredEntitlement);
          const submission = project.submissions[0];

          return (
            <div key={project.id} className="rounded-xl border border-[#E6E6EF] bg-white p-5">
              <div className="flex items-center gap-2">
                <h2 className="font-brand text-base font-bold text-[#0F1020]">
                  {project.title}
                </h2>
                {submission ? (
                  <span className="rounded-full bg-[#E7F7F0] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                    Submitted
                  </span>
                ) : null}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-indigo-600">
                  Read the brief
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm text-[#55556B]">
                  {project.brief}
                </p>
              </details>

              {locked ? (
                <p className="mt-3 text-xs text-[#8A8AA0]">
                  🔒 Unlock with a plan.
                </p>
              ) : (
                <div className="mt-4">
                  <SubmitProjectForm
                    projectId={project.id}
                    initialUrl={submission?.submissionUrl}
                    initialDescription={submission?.description}
                  />
                  {submission ? (
                    <p className="mt-2 text-xs text-[#8A8AA0]">
                      {submission._count.reviews} of 2 reviews received ·{" "}
                      <Link
                        href="/prove/feedback-received"
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        View feedback
                      </Link>
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
