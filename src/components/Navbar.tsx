import Link from "next/link";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#tracks", label: "Tracks" },
  { href: "#waitlist", label: "Join waitlist" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-mono text-sm text-white">
            {"{ }"}
          </span>
          PreCompilers
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-black/70 dark:text-white/70 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-black dark:hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#waitlist"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Get early access
        </a>
      </nav>
    </header>
  );
}
