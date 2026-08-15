import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import PortalAppShell, { type PortalNavKey } from "@/components/shell/PortalAppShell";

export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY"]);
  if (!user) {
    redirect("/login");
  }

  const navKey: PortalNavKey =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? "admin"
      : user.role === "INSTITUTION_ADMIN"
        ? "institution-admin"
        : "none";

  return (
    <PortalAppShell navKey={navKey} userLabel={user.name ?? user.email}>
      {children}
    </PortalAppShell>
  );
}
