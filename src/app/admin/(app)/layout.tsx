import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";

const ADMIN_NAV = [
  { label: "Users", href: "/users" },
  { label: "Institutions", href: "/institutions" },
  { label: "Batches", href: "/batches" },
  { label: "Content", href: "/content" },
  { label: "Content Review", href: "/content-review" },
];

const INSTITUTION_ADMIN_NAV = [
  { label: "Cohort", href: "/cohort" },
  { label: "Faculty", href: "/faculty" },
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
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Logo />
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{user.name ?? user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 bg-gray-50 px-6 py-8">{children}</main>
    </div>
  );
}
