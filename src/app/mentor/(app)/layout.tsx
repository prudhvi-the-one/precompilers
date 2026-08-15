import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import PortalAppShell from "@/components/shell/PortalAppShell";

const MENTOR_NAV = [
  { label: "Recordings", href: "/recordings" },
  { label: "My Content", href: "/content" },
];

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
    <PortalAppShell navItems={MENTOR_NAV} userLabel={mentor.name ?? mentor.email}>
      {children}
    </PortalAppShell>
  );
}
