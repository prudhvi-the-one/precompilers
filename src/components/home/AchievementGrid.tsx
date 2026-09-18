import type { Achievement } from "@/lib/achievements";
import { ACHIEVEMENT_ICONS } from "@/components/home/achievementIcons";

/** The full trophy case — every achievement, tiered and one-time alike.
 * Plain rounded-full tiles (not clip-path), so a normal `border` renders
 * correctly here with no corner-gap workaround needed. */
export default function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {achievements.map((achievement) => {
        const Icon = ACHIEVEMENT_ICONS[achievement.icon];
        const caption =
          achievement.kind === "tiered" && achievement.progress
            ? `${achievement.progress.value}/${achievement.progress.target}`
            : achievement.earned
              ? "Unlocked"
              : achievement.hint;

        return (
          <div key={achievement.key} className="flex flex-col items-center gap-2 text-center">
            <div
              className={
                achievement.earned
                  ? "flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent"
                  : "flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-sunk text-ink-faintest"
              }
              style={achievement.earned ? { boxShadow: "0 0 16px -2px var(--accent)" } : undefined}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
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
