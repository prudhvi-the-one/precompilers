import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { computeOverallReadiness } from "@/lib/readiness";
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

  const overallReadiness = await computeOverallReadiness(user.id);

  return (
    <AppShell user={user} overallReadiness={overallReadiness}>
      {children}
    </AppShell>
  );
}
