type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  segments,
  centerLabel,
  centerSubLabel,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerSubLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const arcs = segments.map((segment, i) => {
    const precedingValue = segments.slice(0, i).reduce((sum, s) => sum + s.value, 0);
    const dash = (segment.value / total) * CIRCUMFERENCE;
    const offset = (precedingValue / total) * CIRCUMFERENCE;
    return { ...segment, dash, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={110} height={110} viewBox="0 0 120 120" className="shrink-0">
        <circle cx={60} cy={60} r={RADIUS} fill="none" stroke="var(--line-soft)" strokeWidth={16} />
        {arcs.map((arc, i) =>
          arc.value === 0 ? null : (
            <circle
              key={arc.label}
              className="animate-fade-scale"
              cx={60}
              cy={60}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 60 60)"
              style={{ transformOrigin: "60px 60px", animationDelay: `${i * 0.12}s` }}
            />
          )
        )}
        <text
          x={60}
          y={57}
          textAnchor="middle"
          className="font-mono text-[20px] font-bold"
          fill="var(--ink)"
        >
          {centerLabel}
        </text>
        <text x={60} y={71} textAnchor="middle" className="text-[9.5px]" fill="var(--ink-faint)">
          {centerSubLabel}
        </text>
      </svg>
      <div className="flex flex-col gap-2.5 text-[12.5px]">
        {segments.map((segment) => (
          <div key={segment.label}>
            <span
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: segment.color }}
            />
            {segment.label}
            <span className="ml-1.5 text-ink-faint">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
