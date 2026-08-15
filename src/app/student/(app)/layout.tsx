import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { computeOverallReadiness } from "@/lib/readiness";
import { computeCurrentStreak } from "@/lib/streak";
import { getUnlockedSections } from "@/lib/tier";
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

  const [overallReadiness, currentStreak, unlockedSections] = await Promise.all([
    computeOverallReadiness(user.id),
    computeCurrentStreak(user.id),
    getUnlockedSections(user),
  ]);

  return (
    <AppShell
      user={user}
      overallReadiness={overallReadiness}
      currentStreak={currentStreak}
      unlockedSections={unlockedSections}
    >
      {children}
    </AppShell>
  );
}
