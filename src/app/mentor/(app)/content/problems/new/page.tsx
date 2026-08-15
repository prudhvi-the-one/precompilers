import { requireRole } from "@/lib/session";
import ProblemAuthorForm from "@/components/mentor/ProblemAuthorForm";

export default async function NewProblemPage() {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
        New problem
      </h1>
      <ProblemAuthorForm mode="create" />
    </div>
  );
}
