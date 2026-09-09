import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { meetsEntitlement } from "@/lib/entitlement";
import { hasTierAccess } from "@/lib/tier";

// A native <form method="POST"> submission (StartQuizButton) has no JSON
// content-type; the client-side fetch caller (StartAptitudePaperButtons,
// which needs to send the `proctored` flag) sets one explicitly. Form
// submissions get an HTTP redirect back — a real browser-level navigation
// initiated by the form submit itself, not JS running after an awaited
// fetch, which loses the click's user-activation on a slow response and
// gets silently blocked by the browser as a script-initiated navigation.
// JSON callers keep getting JSON, since they navigate synchronously off a
// real user gesture (a fresh click, e.g. after a getUserMedia prompt).
function wantsRedirect(request: Request): boolean {
  return !request.headers.get("content-type")?.includes("application/json");
}

// `request.url`'s host doesn't reflect the incoming Host header in this
// Next.js version (same quirk documented in src/proxy.ts) — building a
// redirect target off it silently drops the student./admin./mentor.
// subdomain, sending the browser to the un-rewritten apex host instead.
function realOrigin(request: Request): string {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const protocol = new URL(request.url).protocol;
  return `${protocol}//${host}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const redirect = wantsRedirect(request);
  const origin = realOrigin(request);
  const fallbackUrl = new URL(request.headers.get("referer") ?? "/", origin);

  function fail(error: string, status: number) {
    if (redirect) {
      return NextResponse.redirect(fallbackUrl, { status: 303 });
    }
    return NextResponse.json({ error }, { status });
  }

  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const { quizId } = await params;

  if (user.vendorId) {
    const openRelease = await prisma.scheduledRelease.findFirst({
      where: { vendorId: user.vendorId, quizId, closesAt: { gt: new Date() } },
    });
    if (!openRelease) {
      return fail("Not found", 404);
    }
  } else {
    if (!(await hasTierAccess(user, "PRACTICE"))) {
      return fail("Upgrade required", 403);
    }
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.status !== "PUBLISHED") {
    return fail("Not found", 404);
  }
  if (!user.vendorId && !meetsEntitlement(user.entitlement, quiz.requiredEntitlement)) {
    return fail("Upgrade required", 403);
  }

  const existing = await prisma.quizAttempt.findFirst({
    where: { userId: user.id, quizId, submittedAt: null },
  });
  if (existing) {
    if (redirect) {
      return NextResponse.redirect(new URL(`/quiz-attempt/${existing.id}`, origin), { status: 303 });
    }
    return NextResponse.json({ attemptId: existing.id });
  }

  let proctored = false;
  if (quiz.kind === "APTITUDE_PAPER") {
    if (redirect) {
      const form = await request.formData().catch(() => null);
      proctored = form?.get("proctored") === "true";
    } else {
      const body = await request.json().catch(() => ({}));
      proctored = Boolean((body as { proctored?: boolean }).proctored);
    }
  }

  const firstSection = quiz.sections[0];
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      proctored,
      sectionAttempts: firstSection
        ? { create: [{ sectionId: firstSection.id }] }
        : undefined,
    },
  });

  if (redirect) {
    return NextResponse.redirect(new URL(`/quiz-attempt/${attempt.id}`, origin), { status: 303 });
  }
  return NextResponse.json({ attemptId: attempt.id });
}
