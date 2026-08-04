import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">
        Welcome{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="max-w-md text-sm text-gray-500">
        You&apos;re logged in as {user.email}. Coding practice, lectures,
        quizzes, and mock interviews are coming soon.
      </p>
      <LogoutButton />
    </div>
  );
}
