import type { User } from "@prisma/client";
import Topbar from "@/components/shell/Topbar";
import SidebarNav from "@/components/shell/SidebarNav";

export default function AppShell({
  user,
  overallReadiness,
  children,
}: {
  user: User;
  overallReadiness: number | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-[#2A2A38]">
      <Topbar user={user} />
      <div className="flex flex-1">
        <SidebarNav overallReadiness={overallReadiness} />
        <main className="flex flex-1 flex-col gap-4.5 bg-[#F8F8FB] px-7 py-6.5">
          {children}
        </main>
      </div>
    </div>
  );
}
