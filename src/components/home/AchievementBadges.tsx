import { Flame, Code2, NotebookText } from "lucide-react";
import type { Achievement, AchievementIcon } from "@/lib/achievements";
import AngularBorder from "@/components/ui/AngularBorder";

const ICONS: Record<AchievementIcon, typeof Flame> = {
  flame: Flame,
  code: Code2,
  notebook: NotebookText,
};

export default function AchievementBadges({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {achievements.map((achievement) => {
        const Icon = ICONS[achievement.icon];
        const content = (
          <div className="flex items-center gap-2 px-3 py-2">
            <span className={achievement.earned ? "text-accent" : "text-ink-faintest"}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <div className={`text-xs font-semibold ${achievement.earned ? "text-accent" : "text-ink-faint"}`}>
                {achievement.label}
              </div>
              {!achievement.earned ? (
                <div className="text-[10px] text-ink-faintest">
                  {achievement.value}/{achievement.target}
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
