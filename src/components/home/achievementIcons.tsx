import {
  Flame,
  Code2,
  NotebookText,
  Video,
  UserCheck,
  FolderCheck,
  Mic,
  Sparkles,
  Target,
  Medal,
} from "lucide-react";
import type { AchievementIcon } from "@/lib/achievements";

export const ACHIEVEMENT_ICONS: Record<AchievementIcon, typeof Flame> = {
  flame: Flame,
  code: Code2,
  notebook: NotebookText,
  video: Video,
  "user-check": UserCheck,
  "folder-check": FolderCheck,
  mic: Mic,
  sparkles: Sparkles,
  target: Target,
  medal: Medal,
};
