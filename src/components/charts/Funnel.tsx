type FunnelStage = {
  label: string;
  count: number;
  color: string;
};

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="flex flex-col items-center">
      {stages.map((stage, i) => {
        const widthPercent = Math.max(18, (stage.count / max) * 100);
        const prev = stages[i - 1];
        const conversionPercent =
          prev && prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : null;

        return (
          <div key={stage.label} className="flex w-full flex-col items-center">
            {i > 0 ? (
              <div className="flex items-center gap-1.5 py-1.5 text-[11px] text-ink-faint">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
                {conversionPercent !== null ? (
                  <span>
                    <b className="font-mono font-normal text-ink-muted">{conversionPercent}%</b> moved
                    forward
                  </span>
                ) : null}
              </div>
            ) : null}
            <div
              className="animate-rise-in flex h-14 items-center justify-center gap-2 font-brand text-sm font-bold text-white"
              style={{
                width: `${widthPercent}%`,
                background: stage.color,
                clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0% 100%)",
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <span className="font-mono font-bold">{stage.count}</span>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
