import Link from "next/link";

function BoltBracketIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
      <svg
        viewBox="0 0 64 64"
        className="h-5 w-5"
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
  forceLight = false,
}: {
  className?: string;
  forceLight?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-brand ${className}`}
    >
      <BoltBracketIcon />
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-indigo-600">Pre</span>
        <span
          className={
            forceLight ? "text-gray-900" : "text-gray-900 dark:text-white"
          }
        >
          Compilers
        </span>
      </span>
    </Link>
  );
}
