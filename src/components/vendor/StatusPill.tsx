const TONE_CLASS: Record<string, string> = {
  neutral: "bg-line-soft text-ink-muted",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
};

export default function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "success" | "warn";
  children: React.ReactNode;
}) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
