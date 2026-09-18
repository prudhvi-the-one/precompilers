import type { Achievement } from "@/lib/achievements";
import AngularBorder from "@/components/ui/AngularBorder";
import { ACHIEVEMENT_ICONS } from "@/components/home/achievementIcons";

/** The hero's compact "spotlight" row — tiered achievements only (they
 * carry real progress, which reads well at a glance). The full trophy
 * case, including one-time milestones, lives in AchievementGrid further
 * down the page. */
export default function AchievementBadges({ achievements }: { achievements: Achievement[] }) {
  const tiered = achievements.filter((a) => a.kind === "tiered");

  return (
    <div className="flex flex-wrap gap-2.5">
      {tiered.map((achievement) => {
        const Icon = ACHIEVEMENT_ICONS[achievement.icon];
        const content = (
          <div className="flex items-center gap-2 px-3 py-2">
            <span className={achievement.earned ? "text-accent" : "text-ink-faintest"}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <div className={`text-xs font-semibold ${achievement.earned ? "text-accent" : "text-ink-faint"}`}>
                {achievement.label}
              </div>
              {!achievement.earned && achievement.progress ? (
                <div className="text-[10px] text-ink-faintest">
                  {achievement.progress.value}/{achievement.progress.target}
                </div>
              ) : null}
            </div>
          </div>
        );

        return achievement.earned ? (
          <div key={achievement.key} className="clip-chip bg-accent-soft">
            {content}
          </div>
        ) : (
          <AngularBorder key={achievement.key} clip="clip-chip" color="var(--line)" className="bg-surface">
            {content}
          </AngularBorder>
        );
      })}
    </div>
  );
}
