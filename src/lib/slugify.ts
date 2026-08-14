export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title) || "content";
  for (let attempt = 1; attempt <= 5; attempt++) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
  }
  return `${base}-${Date.now()}`;
}
