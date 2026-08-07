import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRACKS = [
  {
    slug: "sql-for-interviews",
    name: "SQL for interviews",
    tagline:
      "Joins, window functions, query plans. Live-coded, then tested.",
    order: 1,
    requiredEntitlement: "FREE" as const,
    relevantRoles: ["SOFTWARE_ENGINEER", "DATA_ML_ENGINEER"] as const,
    videoId: "HXV3zeQKqGY",
    lectures: [
      "Tables, joins, and how the query planner thinks",
      "Window functions, part 1",
      "Window functions, part 2",
      "Reading a query plan",
    ],
  },
  {
    slug: "aws-fundamentals",
    name: "AWS fundamentals",
    tagline:
      "EC2, S3, IAM, deploying your project. Ends with a live deployment.",
    order: 2,
    requiredEntitlement: "INDIVIDUAL" as const,
    relevantRoles: ["CLOUD_DEVOPS", "SOFTWARE_ENGINEER"] as const,
    videoId: "Uq5w1lnKzlk",
    lectures: [
      "Core services: EC2, S3, IAM",
      "Networking basics: VPC and security groups",
      "Deploying your project to AWS",
    ],
  },
  {
    slug: "react-properly",
    name: "React, properly",
    tagline:
      "State, effects, data fetching, and the questions interviewers actually ask.",
    order: 3,
    requiredEntitlement: "FREE" as const,
    relevantRoles: ["FRONTEND_ENGINEER"] as const,
    videoId: "nTeuhbP7wdE",
    lectures: [
      "State and props, the mental model",
      "Effects and data fetching",
      "Common interview questions, answered",
    ],
  },
];

async function main() {
  for (const trackData of TRACKS) {
    const { lectures, videoId, ...trackFields } = trackData;
    const trackInput = { ...trackFields, relevantRoles: [...trackFields.relevantRoles] };

    const track = await prisma.track.upsert({
      where: { slug: trackData.slug },
      update: trackInput,
      create: trackInput,
    });

    for (const [index, title] of lectures.entries()) {
      await prisma.lecture.upsert({
        where: { id: `${track.id}-seed-${index}` },
        update: {},
        create: {
          id: `${track.id}-seed-${index}`,
          trackId: track.id,
          order: index + 1,
          title,
          description: `Part of the ${track.name} track.`,
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          durationMinutes: 20 + index * 5,
        },
      });
    }

    const existingBatch = await prisma.batch.findFirst({
      where: { trackId: track.id },
    });
    const batch =
      existingBatch ??
      (await prisma.batch.create({
        data: {
          trackId: track.id,
          name: "Aug 2026 batch",
          startsAt: new Date("2026-08-01T00:00:00Z"),
        },
      }));

    const existingLiveClass = await prisma.liveClass.findFirst({
      where: { batchId: batch.id },
    });
    if (!existingLiveClass) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 3);
      scheduledAt.setHours(18, 0, 0, 0);

      await prisma.liveClass.create({
        data: {
          batchId: batch.id,
          title: `${track.name} — live Q&A`,
          scheduledAt,
          durationMinutes: 60,
          joinUrl: "https://meet.google.com/placeholder-precompilers",
        },
      });
    }
  }

  console.log("Seeded tracks:", TRACKS.map((t) => t.slug).join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
