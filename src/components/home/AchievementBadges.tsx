import Image from "next/image";
import type { Achievement } from "@/lib/achievements";
import { ACHIEVEMENT_BADGE_SRC } from "@/lib/achievements";
import AngularBorder from "@/components/ui/AngularBorder";

/** The hero's compact "spotlight" row — tiered achievements only (they
 * carry real progress, which reads well at a glance). The full trophy
 * case, including one-time milestones, lives in AchievementGrid further
 * down the page. */
export default function AchievementBadges({ achievements }: { achievements: Achievement[] }) {
  const tiered = achievements.filter((a) => a.kind === "tiered");

  return (
    <div className="flex flex-wrap gap-2.5">
      {tiered.map((achievement) => {
        const content = (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="relative h-7 w-7 shrink-0">
              <Image
                src={ACHIEVEMENT_BADGE_SRC[achievement.key]}
                alt=""
                fill
                sizes="28px"
                className="object-contain"
                style={
                  achievement.earned
                    ? undefined
                    : { filter: "grayscale(0.85) brightness(0.85) opacity(0.6)" }
                }
              />
            </div>
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
