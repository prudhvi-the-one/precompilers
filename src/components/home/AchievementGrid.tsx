import Image from "next/image";
import type { Achievement } from "@/lib/achievements";
import { ACHIEVEMENT_BADGE_SRC } from "@/lib/achievements";

/** The full trophy case — every achievement, tiered and one-time alike.
 * Locked badges reuse the same medal artwork as earned ones — a CSS
 * filter (desaturate + dim) plus the lock glyph does the "locked" work,
 * rather than a second generated asset per badge. */
export default function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {achievements.map((achievement) => {
        const caption =
          achievement.kind === "tiered" && achievement.progress
            ? `${achievement.progress.value}/${achievement.progress.target}`
            : achievement.earned
              ? "Unlocked"
              : achievement.hint;

        return (
          <div key={achievement.key} className="flex flex-col items-center gap-2 text-center">
            <div className="relative h-16 w-16">
              <Image
                src={ACHIEVEMENT_BADGE_SRC[achievement.key]}
                alt={achievement.label}
                fill
                sizes="64px"
                className="object-contain"
                style={
                  achievement.earned
                    ? { filter: "drop-shadow(0 0 10px var(--accent))" }
                    : { filter: "grayscale(0.85) brightness(0.85) opacity(0.55)" }
                }
              />
              {!achievement.earned ? (
                <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-ink-faint">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
              ) : null}
            </div>
            <div className={`text-xs font-semibold ${achievement.earned ? "text-ink" : "text-ink-faint"}`}>
              {achievement.label}
            </div>
            <div className="text-[10.5px] text-ink-faintest">{caption}</div>
          </div>
        );
      })}
    </div>
  );
}
