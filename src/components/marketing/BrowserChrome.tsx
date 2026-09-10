export default function BrowserChrome({
  url,
  dark = false,
  children,
}: {
  url: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        dark
          ? "flex h-full flex-col overflow-hidden rounded-2xl bg-[#14141f] shadow-[0_30px_70px_-30px_rgba(79,70,229,.35)]"
          : "flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_70px_-32px_rgba(79,70,229,.16)]"
      }
    >
      <div
        className={
          dark
            ? "flex items-center gap-2 border-b border-[#26263a] bg-[#1a1a26] px-3.5 py-2.5"
            : "flex items-center gap-2 border-b border-line-soft bg-surface-sunk px-3.5 py-2.5"
        }
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span
          className={
            dark
              ? "ml-2 rounded-md bg-[#22222f] px-2.5 py-1 font-mono text-[11px] text-[#d8d7e8]"
              : "ml-2 rounded-md border border-line-soft bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-faint"
          }
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}
