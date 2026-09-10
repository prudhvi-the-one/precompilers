import type { LucideIcon } from "lucide-react";

const TONE_STYLE: Record<string, { badge: string }> = {
  neutral: { badge: "bg-accent-soft text-accent" },
  warn: { badge: "bg-warn-soft text-warn" },
  success: { badge: "bg-success-soft text-success" },
};

export default function StatChip({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "neutral" | "warn" | "success";
}) {
  const style = TONE_STYLE[tone];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5">
      <div className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${style.badge}`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="text-[11.5px] text-ink-faint">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
