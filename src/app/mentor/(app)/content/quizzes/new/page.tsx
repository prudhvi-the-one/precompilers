import { requireRole } from "@/lib/session";
import QuizAuthorForm from "@/components/mentor/QuizAuthorForm";

export default async function NewQuizPage() {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
        New quiz
      </h1>
      <QuizAuthorForm mode="create" />
    </div>
  );
}
