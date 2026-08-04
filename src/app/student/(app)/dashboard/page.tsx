import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-sm text-gray-500">
        Coding practice, lectures, quizzes, and mock interviews are coming
        soon — pick a section from the sidebar to get started.
      </p>
    </div>
  );
}
