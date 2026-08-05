import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

const STATS = [
  { label: "Problems solved", value: "0", accent: "border-t-indigo-600" },
  { label: "Day streak", value: "0", accent: "border-t-amber-500" },
  { label: "Quizzes taken", value: "0", accent: "border-t-emerald-500" },
  { label: "Hours watched", value: "0h", accent: "border-t-pink-500" },
];

const MODULES = ["Practice", "Lectures", "Quizzes", "Mock Interviews"];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-gray-500">Your progress so far.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-md border border-t-4 border-gray-200 p-3 ${stat.accent}`}
          >
            <div className="text-xl font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Modules</h2>
        <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {MODULES.map((module) => (
            <div
              key={module}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-gray-900">{module}</span>
              <span className="text-xs text-gray-400">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
