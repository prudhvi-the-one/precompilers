const AVATAR_COLORS = [
  "#4F46E5",
  "#0F766E",
  "#B45309",
  "#BE185D",
  "#4338CA",
  "#15803D",
];

export function initialsFromName(name?: string | null, fallback?: string | null): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return fallback?.[0]?.toUpperCase() ?? "?";
}

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
