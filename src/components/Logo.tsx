import Link from "next/link";

function BoltBracketIcon({ compact }: { compact: boolean }) {
  return (
    <span
      className={
        compact
          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-indigo-600"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600"
      }
    >
      <svg
        viewBox="0 0 64 64"
        className={compact ? "h-4 w-4" : "h-5 w-5"}
        fill="none"
        stroke="white"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17,17 L33,32 L17,47" />
        <path d="M33,17 L49,32 L33,47" />
      </svg>
    </span>
  );
}

export default function Logo({
  className = "",
  size = "default",
}: {
  className?: string;
  /** "compact" matches the app-shell topbar spec: 24px tile, Sora 700 14px. */
  size?: "default" | "compact";
}) {
  const compact = size === "compact";
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-brand ${className}`}
    >
      <BoltBracketIcon compact={compact} />
      <span
        className={
          compact
            ? "text-[14px] font-bold tracking-tight"
            : "text-lg font-extrabold tracking-tight"
        }
      >
        <span className="text-indigo-600">Pre</span>
        <span className="text-ink">Compilers</span>
      </span>
    </Link>
  );
}
