import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import PortalAppShell from "@/components/shell/PortalAppShell";

export default async function VendorAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user) {
    redirect("/login");
  }

  return (
    <PortalAppShell navKey="vendor-admin" userLabel={user.name ?? user.email}>
      {children}
    </PortalAppShell>
  );
}
