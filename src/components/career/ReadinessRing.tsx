export default function ReadinessRing({ score }: { score: number | null }) {
  const pct = score ?? 0;

  return (
    <div
      className="flex h-37.5 w-37.5 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--accent) 0 ${pct}%, var(--line-soft) ${pct}% 100%)`,
      }}
    >
      <div className="flex h-29 w-29 flex-col items-center justify-center rounded-full bg-surface">
        <span className="font-brand text-[44px] font-extrabold text-ink">
          {score !== null ? score : "—"}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-ink-faintest uppercase">
          Out of 100
        </span>
      </div>
    </div>
  );
}
