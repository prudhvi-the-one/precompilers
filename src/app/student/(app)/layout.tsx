import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
