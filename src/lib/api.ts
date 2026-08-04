import type { z } from "zod";

export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: string }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: "Invalid JSON body" };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  return { data: result.data };
}
