import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

const UPCOMING = [
  {
    title: "Practice",
    description: "Solve curated coding problems with instant feedback.",
  },
  {
    title: "Lectures",
    description: "Watch structured video lessons, organized by topic.",
  },
  {
    title: "Quizzes",
    description: "Test your understanding with timed, topic-wise quizzes.",
  },
  {
    title: "Mock Interviews",
    description: "Practice with realistic, scheduled interview scenarios.",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-gray-500">
          Here&apos;s what&apos;s coming to your dashboard next.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {UPCOMING.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">{item.title}</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Coming soon
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
