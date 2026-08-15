import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { computeOverallReadiness } from "@/lib/readiness";
import { computeCurrentStreak } from "@/lib/streak";
import AppShell from "@/components/shell/AppShell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [overallReadiness, currentStreak] = await Promise.all([
    computeOverallReadiness(user.id),
    computeCurrentStreak(user.id),
  ]);

  return (
    <AppShell user={user} overallReadiness={overallReadiness} currentStreak={currentStreak}>
      {children}
    </AppShell>
  );
}
