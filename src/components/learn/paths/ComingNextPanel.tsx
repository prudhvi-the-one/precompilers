import type { ReactNode } from "react";

// Shared "not built yet" placeholder for the Simulate step's three
// sub-panels (Simulator/Challenges/Progress) — matches the state a topic
// is in until its bespoke simulator engine is built, same honesty as the
// existing "Simulator coming soon" fallback in SIMULATOR_REGISTRY lookups.
export default function ComingNextPanel({
  icon,
  title,
  description,
  note,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-3xl border-[1.5px] border-dashed border-line bg-surface p-14 text-center">
      {icon}
      <div className="font-brand text-[15.5px] font-bold text-ink">{title}</div>
      <p className="max-w-[440px] text-[13px] text-ink-muted">{description}</p>
      {note ? <span className="mt-1 text-[11px] text-ink-faintest">{note}</span> : null}
    </div>
  );
}
