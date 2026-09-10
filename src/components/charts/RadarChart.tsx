const WIDTH = 240;
const HEIGHT = 210;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const MAX_RADIUS = 65;
const MAX_LABEL_CHARS = 15;

function truncateLabel(label: string): string {
  return label.length > MAX_LABEL_CHARS ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…` : label;
}

function pointOnAxis(index: number, count: number, radius: number) {
  const angle = -90 + (index * 360) / count;
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  };
}

export default function RadarChart({
  axes,
}: {
  axes: { label: string; value: number }[];
}) {
  const count = axes.length;
  const shapePoints = axes
    .map((axis, i) => {
      const p = pointOnAxis(i, count, (Math.max(0, Math.min(100, axis.value)) / 100) * MAX_RADIUS);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto block">
      {[1, 2, 3].map((ring) => (
        <circle
          key={ring}
          cx={CENTER_X}
          cy={CENTER_Y}
          r={(MAX_RADIUS / 3) * ring}
          fill="none"
          stroke="var(--line)"
        />
      ))}
      {axes.map((_, i) => {
        const p = pointOnAxis(i, count, MAX_RADIUS);
        return <line key={i} x1={CENTER_X} y1={CENTER_Y} x2={p.x} y2={p.y} stroke="var(--line)" />;
      })}
      <polygon
        className="animate-fade-scale"
        points={shapePoints}
        fill="var(--accent-glow, color-mix(in srgb, var(--accent) 22%, transparent))"
        stroke="var(--accent)"
        strokeWidth={2}
        style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
      />
      {axes.map((axis, i) => {
        const p = pointOnAxis(i, count, (Math.max(0, Math.min(100, axis.value)) / 100) * MAX_RADIUS);
        return <circle key={axis.label} cx={p.x} cy={p.y} r={3} fill="var(--accent)" />;
      })}
      {axes.map((axis, i) => {
        const labelPoint = pointOnAxis(i, count, MAX_RADIUS + 26);
        const anchor = labelPoint.x < CENTER_X - 5 ? "end" : labelPoint.x > CENTER_X + 5 ? "start" : "middle";
        return (
          <text
            key={axis.label}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor={anchor}
            className="text-[9.5px]"
            fill="var(--ink-faint)"
          >
            {truncateLabel(axis.label)} {Math.round(axis.value)}
          </text>
        );
      })}
    </svg>
  );
}
