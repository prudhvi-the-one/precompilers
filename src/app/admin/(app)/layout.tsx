import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import PortalAppShell from "@/components/shell/PortalAppShell";

const ADMIN_NAV = [
  { label: "Users", href: "/users" },
  { label: "Institutions", href: "/institutions" },
  { label: "Batches", href: "/batches" },
  { label: "Content", href: "/content" },
  { label: "Content Review", href: "/content-review" },
  { label: "Drives", href: "/drives" },
];

const INSTITUTION_ADMIN_NAV = [
  { label: "Cohort", href: "/cohort" },
  { label: "Faculty", href: "/faculty" },
  { label: "Mentors", href: "/mentors" },
];

export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY"]);
  if (!user) {
    redirect("/login");
  }

  const nav =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? ADMIN_NAV
      : user.role === "INSTITUTION_ADMIN"
        ? INSTITUTION_ADMIN_NAV
        : [];

  return (
    <PortalAppShell navItems={nav} userLabel={user.name ?? user.email}>
      {children}
    </PortalAppShell>
  );
}
