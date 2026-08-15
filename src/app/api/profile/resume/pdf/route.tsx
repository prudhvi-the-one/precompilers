import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import ResumeDocument from "@/components/career/ResumeDocument";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resume = await prisma.resume.findUnique({
    where: { userId: user.id },
    include: {
      education: { orderBy: { order: "asc" } },
      experience: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
    },
  });
  if (!resume) {
    return NextResponse.json({ error: "No resume saved yet" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ResumeDocument
      fullName={resume.fullName}
      email={resume.email}
      phone={resume.phone}
      location={resume.location}
      linkedinUrl={resume.linkedinUrl}
      githubUrl={resume.githubUrl}
      portfolioUrl={resume.portfolioUrl}
      summary={resume.summary}
      skills={resume.skills}
      education={resume.education}
      experience={resume.experience}
      projects={resume.projects}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume.pdf"`,
    },
  });
}
