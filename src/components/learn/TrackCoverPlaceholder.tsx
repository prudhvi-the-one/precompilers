import { Code2, Database, Cloud, Server, Globe, BookOpen } from "lucide-react";
import { avatarColor } from "@/lib/avatar";

const ICONS = [Code2, Database, Cloud, Server, Globe, BookOpen];

export default function TrackCoverPlaceholder({
  trackId,
  label,
}: {
  trackId: string;
  label: string;
}) {
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    hash = (hash * 31 + trackId.charCodeAt(i)) >>> 0;
  }
  const Icon = ICONS[hash % ICONS.length];
  const color = avatarColor(trackId);

  return (
    <div
      className="flex h-30 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Icon className="h-9 w-9" style={{ color }} strokeWidth={1.75} aria-label={label} />
    </div>
  );
}
