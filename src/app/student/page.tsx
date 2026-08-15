import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PortalPlaceholder from "@/components/PortalPlaceholder";

export default async function StudentPortalPage() {
  const session = await getSession();
  if (session) {
    redirect("/home");
  }

  return (
    <PortalPlaceholder
      title="Student Portal"
      description="Coding practice, lectures, quizzes, and mock interviews are coming soon."
    >
      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md border border-line px-4 py-2 text-sm font-medium"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface"
        >
          Create account
        </Link>
      </div>
    </PortalPlaceholder>
  );
}
