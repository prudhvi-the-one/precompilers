import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import PortalAppShell from "@/components/shell/PortalAppShell";

export default async function MentorAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    redirect("/login");
  }

  return (
    <PortalAppShell navKey="mentor" userLabel={mentor.name ?? mentor.email}>
      {children}
    </PortalAppShell>
  );
}
