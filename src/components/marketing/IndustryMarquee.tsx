const TRACKS = ["SQL", "AWS", "Azure", "React", "Angular", "Backend systems"];

export default function IndustryMarquee() {
  const items = [...TRACKS, ...TRACKS];
  return (
    <div className="overflow-hidden border-y border-line-soft bg-surface-sunk py-4.5">
      <div className="flex w-max animate-[marquee_22s_linear_infinite] gap-3.5 motion-reduce:animate-none">
        {items.map((track, i) => (
          <span
            key={`${track}-${i}`}
            className="shrink-0 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-[12.5px] font-semibold whitespace-nowrap text-ink-muted"
          >
            {track}
          </span>
        ))}
      </div>
    </div>
  );
}
