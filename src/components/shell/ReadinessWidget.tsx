import Image from "next/image";
import { rankForScore, TIER_BADGE_SRC } from "@/lib/rank";

export default function ReadinessWidget({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="clip-panel mt-auto rounded-[11px] border border-line bg-surface p-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-line-soft">
          <span className="font-brand text-xl font-extrabold text-ink-faint">—</span>
        </div>
        <div className="mt-3 font-brand text-[13px] font-semibold text-ink">Job readiness</div>
        <div className="mt-0.5 text-xs text-ink-faint">Not assessed yet</div>
      </div>
    );
  }

  const rank = rankForScore(score);

  return (
    <div className="clip-panel mt-auto border border-line bg-surface p-4 text-center">
      <div className="relative mx-auto flex h-19 w-19 items-center justify-center">
        <svg className="animate-orbit-spin absolute inset-0" viewBox="0 0 76 76" aria-hidden="true">
          <circle
            cx="38"
            cy="38"
            r="35"
            fill="none"
            stroke={`var(--tier-${rank.tier})`}
            strokeWidth="1.5"
            strokeDasharray="4 7"
            opacity="0.5"
          />
        </svg>
        <div className="animate-badge-in relative h-16 w-16">
          <Image
            src={TIER_BADGE_SRC[rank.tier]}
            alt={`${rank.tierLabel} rank badge`}
            fill
            sizes="64px"
            className="object-contain"
            style={{ filter: `drop-shadow(0 0 12px var(--tier-${rank.tier}))` }}
          />
        </div>
        <span
          className="font-brand absolute text-[15px] font-extrabold"
          style={{ color: "#1a1a2e", textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}
        >
          {score}
        </span>
      </div>
      <div className="mt-3 font-brand text-[13px] font-semibold text-ink">{rank.displayName}</div>
      <div className="mt-0.5 text-xs text-ink-faint">
        {rank.pointsToNext !== null
          ? `${rank.pointsToNext} to ${rank.nextTierLabel}`
          : "Top rank"}
      </div>
      {/* A plain <a>, not next/link's <Link>: a client-side transition can
          lose the race against the still-in-flight prefetch on a slow
          destination page and silently fail to navigate. */}
      <a
        href="/career/report"
        className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
      >
        See full report
      </a>
    </div>
  );
}
