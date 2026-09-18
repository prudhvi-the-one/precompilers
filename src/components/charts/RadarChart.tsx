const WIDTH = 240;
const HEIGHT = 210;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const MAX_RADIUS = 65;
const MAX_LABEL_CHARS = 15;
// Extra viewBox margin so axis icons (rendered above/below the label,
// outside the base 0-HEIGHT box) don't get clipped.
const ICON_MARGIN = 24;

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
  boldLabels = false,
  icons,
}: {
  axes: { label: string; value: number }[];
  boldLabels?: boolean;
  /** Optional icon src per axis, same order as `axes`. When omitted, no
   * icon overlay is rendered (the vendor statistics page's usage). */
  icons?: string[];
}) {
  const count = axes.length;
  const shapePoints = axes
    .map((axis, i) => {
      const p = pointOnAxis(i, count, (Math.max(0, Math.min(100, axis.value)) / 100) * MAX_RADIUS);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  const hasIcons = Boolean(icons?.length);

  return (
    <svg
      width="100%"
      height={hasIcons ? HEIGHT + ICON_MARGIN * 2 : HEIGHT}
      viewBox={
        hasIcons
          ? `0 ${-ICON_MARGIN} ${WIDTH} ${HEIGHT + ICON_MARGIN * 2}`
          : `0 0 ${WIDTH} ${HEIGHT}`
      }
      className="mx-auto block overflow-visible"
    >
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
        const iconSrc = icons?.[i];
        // Icon sits further out than the label, on the same side (above
        // the top labels, below the bottom ones), never overlapping it.
        const iconY = labelPoint.y < CENTER_Y - 5 ? labelPoint.y - 15 : labelPoint.y + 15;

        return (
          <g key={axis.label}>
            {iconSrc ? (
              <>
                <circle cx={labelPoint.x} cy={iconY} r={13} fill="var(--icon-chip-fill)" stroke="var(--icon-chip-edge)" />
                <image
                  href={iconSrc}
                  x={labelPoint.x - 10}
                  y={iconY - 10}
                  width={20}
                  height={20}
                  className="chart-icon"
                />
              </>
            ) : null}
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={anchor}
              className={boldLabels ? "text-[9.5px] font-bold" : "text-[9.5px]"}
              fill={boldLabels ? "var(--ink-muted)" : "var(--ink-faint)"}
            >
              {truncateLabel(axis.label)} {Math.round(axis.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
