import Logo from "@/components/Logo";
import LoginMenu from "@/components/marketing/LoginMenu";

const links = [
  { href: "#gap", label: "The gap" },
  { href: "#how-we-close-it", label: "How it works" },
  { href: "#tracks", label: "Tracks" },
  { href: "#colleges", label: "For colleges" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 h-17 border-b border-[#EDEDF3] bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="hidden items-center gap-8 text-sm text-[#2A2A38] md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#0F1020]">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <LoginMenu />
          <a
            href="https://student.precompilers.com/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13.5px] font-semibold text-white transition hover:bg-[#4338CA]"
          >
            Sign up free
          </a>
        </div>
      </nav>
    </header>
  );
}
