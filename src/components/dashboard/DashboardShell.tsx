import type { User } from "@prisma/client";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";

export default function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
