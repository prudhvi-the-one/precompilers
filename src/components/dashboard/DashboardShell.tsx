import type { User } from "@prisma/client";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email[0]?.toUpperCase() ?? "?";
}

export default function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <Logo forceLight />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:inline">
            {user.email}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {initials(user.name, user.email)}
          </span>
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
