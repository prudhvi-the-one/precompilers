type HistogramBar = {
  label: string;
  count: number;
  valueLabel?: string;
  color?: string;
};

export default function Histogram({
  bars,
  height = 140,
}: {
  bars: HistogramBar[];
  height?: number;
}) {
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <div className="flex items-end gap-3.5" style={{ height }}>
      {bars.map((bar, i) => {
        const heightPercent = Math.max(2, (bar.count / max) * 100);
        return (
          <div
            key={bar.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="font-mono text-[11.5px] text-ink-muted">
              {bar.valueLabel ?? bar.count}
            </span>
            <div
              className="animate-grow-bar-y w-full max-w-10 rounded-t-md"
              style={{
                height: `${heightPercent}%`,
                background: bar.count === 0 ? "var(--line)" : (bar.color ?? "var(--accent)"),
                animationDelay: `${i * 0.07}s`,
              }}
            />
            <span className="mt-0.5 text-[10.5px] text-ink-faint">{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}
