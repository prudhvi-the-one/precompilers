/**
 * A plain CSS `border` can't draw a stroke along a `clip-path` diagonal —
 * border painting only ever runs along the box's four straight edges, so
 * the cut corners of `.clip-panel` render with a visible gap instead of a
 * border. This is the standard fix: a color-filled outer layer, clipped
 * the same way, with a 2px-inset inner layer on top — both edges (straight
 * and diagonal) end up with a uniform ring of the border color between
 * them.
 */
export default function AngularBorder({
  color,
  clip = "clip-panel",
  className = "",
  wrapperClassName = "",
  children,
}: {
  color: string;
  /** Which corner-cut shape to use — must match on both layers, or the
   * inset "border" ring won't line up. Defaults to the panel cut. */
  clip?: "clip-panel" | "clip-chip";
  className?: string;
  /** Layout classes for the outer layer (e.g. `mt-auto` to position this
   * whole component within a flex parent) — kept separate from `className`
   * so callers don't have to think about which layer owns spacing. */
  wrapperClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${clip} p-[2px] ${wrapperClassName}`} style={{ background: color }}>
      <div className={`${clip} ${className}`}>{children}</div>
    </div>
  );
}
