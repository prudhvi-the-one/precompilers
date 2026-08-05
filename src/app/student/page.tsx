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
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Create account
        </Link>
      </div>
    </PortalPlaceholder>
  );
}
