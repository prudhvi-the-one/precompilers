const WIDTH = 280;
const HEIGHT = 120;
const PADDING_TOP = 8;

export default function TrendLine({
  values,
  labels,
  areaFill = false,
  averageValue,
  color = "var(--accent)",
}: {
  values: number[];
  labels?: string[];
  areaFill?: boolean;
  averageValue?: number;
  color?: string;
}) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const toXY = (value: number, index: number) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * WIDTH;
    const y = HEIGHT - PADDING_TOP - ((value - min) / range) * (HEIGHT - PADDING_TOP);
    return { x, y };
  };

  const points = values.map((v, i) => toXY(v, i));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPoints = [
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${HEIGHT}`,
    `${points[0].x},${HEIGHT}`,
  ].join(" ");
  const dashLength = Math.round(WIDTH * 1.4);

  return (
    <div>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        {areaFill ? <polygon points={areaPoints} fill={`color-mix(in srgb, ${color} 14%, transparent)`} /> : null}
        {averageValue !== undefined ? (
          <line
            x1={0}
            y1={toXY(averageValue, 0).y}
            x2={WIDTH}
            y2={toXY(averageValue, 0).y}
            stroke="var(--chart-secondary)"
            strokeWidth={1.6}
            strokeDasharray="5 4"
            opacity={0.85}
          />
        ) : null}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
          style={{ ["--dash-length" as string]: dashLength, strokeDasharray: dashLength }}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--surface)" stroke={color} strokeWidth={2.5} />
        ))}
      </svg>
      {labels ? (
        <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint">
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
