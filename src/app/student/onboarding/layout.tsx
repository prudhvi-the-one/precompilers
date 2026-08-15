import Link from "next/link";
import Logo from "@/components/Logo";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface-sunk">
      <header className="flex h-15 items-center justify-between border-b border-line-soft bg-surface px-6">
        <Logo />
        <Link href="/home" className="text-sm text-ink-faint hover:text-ink">
          Skip for now
        </Link>
      </header>
      <main className="flex flex-1 justify-center px-12 py-14">
        <div className="w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
