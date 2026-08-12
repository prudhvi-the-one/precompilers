import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";

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
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Logo />
          <Link href="/recordings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Recordings
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{mentor.name ?? mentor.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 bg-gray-50 px-6 py-8">{children}</main>
    </div>
  );
}
