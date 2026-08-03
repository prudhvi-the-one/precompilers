import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTALS = ["student", "admin", "mentor"] as const;
type Portal = (typeof PORTALS)[number];

function isPortal(value: string | null): value is Portal {
  return PORTALS.includes(value as Portal);
}

function portalFromHostname(hostname: string): Portal | null {
  return PORTALS.find((portal) => hostname.startsWith(`${portal}.`)) ?? null;
}

// The ?portal= override exists only to preview portals on hosts that can't
// have a real subdomain: localhost and Vercel's *.vercel.app preview URLs.
// It must never activate on the real production domain, where the actual
// subdomains (student./admin./mentor.precompilers.com) are the only way in.
function allowsOverride(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".vercel.app")
  );
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  // `request.nextUrl.hostname` doesn't reflect the incoming Host header in
  // this Next.js version (verified against a live request) — read it
  // directly off the request instead.
  const hostname = (request.headers.get("host") ?? "").split(":")[0];

  const hostPortal = portalFromHostname(hostname);
  const overrideAllowed = !hostPortal && allowsOverride(hostname);
  const overridePortal = overrideAllowed ? searchParams.get("portal") : null;
  const cookiePortal = overrideAllowed
    ? request.cookies.get("portal")?.value ?? null
    : null;

  const portal =
    hostPortal ??
    (isPortal(overridePortal) ? overridePortal : null) ??
    (isPortal(cookiePortal) ? cookiePortal : null);

  if (!portal) {
    return NextResponse.next();
  }

  const targetPath = pathname === "/" ? `/${portal}` : `/${portal}${pathname}`;
  const response = NextResponse.rewrite(new URL(targetPath, request.url));

  // Persist the ?portal= override in a cookie so it survives client-side
  // navigation on Vercel preview URLs, which have no real subdomains yet.
  if (!hostPortal && overridePortal && overridePortal !== cookiePortal) {
    response.cookies.set("portal", portal, { path: "/" });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
