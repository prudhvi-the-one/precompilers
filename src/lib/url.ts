import { headers } from "next/headers";

// Derives the student-portal base URL from the current request's own host,
// swapping whichever portal subdomain is active for "student." — mirrors how
// src/proxy.ts resolves portals from the Host header rather than a hardcoded
// root-domain env var, so this works unmodified across localhost, Vercel
// preview URLs, and production.
export async function getStudentPortalBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const [, ...rest] = host.split(".");
  const rootHost = rest.length > 0 ? rest.join(".") : host;
  return `${protocol}://student.${rootHost}`;
}
