type Metric = {
  label: string;
  values: number[];
  valueLabels?: string[];
};

export default function GroupedBarChart({
  metrics,
  seriesLabels,
  seriesColors,
  height = 150,
}: {
  metrics: Metric[];
  seriesLabels: string[];
  seriesColors: string[];
  height?: number;
}) {
  const max = Math.max(1, ...metrics.flatMap((m) => m.values));

  return (
    <div>
      <div className="flex items-end gap-8" style={{ height }}>
        {metrics.map((metric, mi) => (
          <div key={metric.label} className="flex h-full flex-1 flex-col items-center">
            <div className="flex h-full flex-1 items-end gap-1.5">
              {metric.values.map((value, si) => (
                <div
                  key={si}
                  className="animate-grow-bar-y relative w-8 rounded-t-md"
                  style={{
                    height: `${Math.max(2, (value / max) * 100)}%`,
                    background: seriesColors[si],
                    animationDelay: `${mi * 0.08 + si * 0.05}s`,
                  }}
                >
                  <span className="absolute -top-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] text-ink-muted">
                    {metric.valueLabels?.[si] ?? value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-center text-[11.5px] text-ink-faint">{metric.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-[12px] text-ink-muted">
        {seriesLabels.map((label, i) => (
          <span key={label}>
            <span
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px]"
              style={{ background: seriesColors[i] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
