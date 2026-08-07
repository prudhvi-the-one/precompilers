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
    notes: [
      {
        title: "Window functions, cheat sheet",
        content:
          "OVER() turns an aggregate into a per-row calculation instead of collapsing rows.\n\n" +
          "- ROW_NUMBER() OVER (PARTITION BY col ORDER BY col2) — a unique rank per partition, no ties.\n" +
          "- RANK() — same as ROW_NUMBER, but ties share a rank and the next rank skips (1,2,2,4).\n" +
          "- DENSE_RANK() — like RANK, but no gap after a tie (1,2,2,3).\n" +
          "- LAG(col) / LEAD(col) — read the previous/next row's value within the partition, without a self-join.\n\n" +
          "PARTITION BY resets the calculation per group, the way GROUP BY does for aggregates — but window functions don't collapse the rows.",
      },
      {
        title: "Reading a query plan",
        content:
          "EXPLAIN shows the planned execution; EXPLAIN ANALYZE actually runs the query and shows real timings.\n\n" +
          "- Seq Scan — reads the whole table. Fine for small tables or when most rows match; a red flag on a large table with a selective filter.\n" +
          "- Index Scan — uses an index to jump to matching rows.\n" +
          "- Index Only Scan — the index alone has every column the query needs, no table lookup at all.\n" +
          "- cost=0.00..12.50 — the planner's estimate (startup..total), not real time; compare EXPLAIN ANALYZE's actual time for the real number.\n\n" +
          "If a query is slow, look for a Seq Scan where you expected an Index Scan first.",
      },
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
    notes: [
      {
        title: "EC2 vs S3 vs IAM, in one page",
        content:
          "EC2 — a virtual machine you rent by the hour (or second). Use it when you need to run your own server/process continuously.\n\n" +
          "S3 — object storage, not a filesystem. Good for files, backups, static assets; not for a database.\n\n" +
          "IAM — who's allowed to do what. A user or role gets a policy (a JSON document listing allowed actions on specific resources). Interviewers care that you know IAM is about permissions, not compute or storage.\n\n" +
          "The one-line summary that answers 'what's the difference': EC2 runs your code, S3 stores your files, IAM decides who can touch either.",
      },
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
    notes: [
      {
        title: "Common React interview questions",
        content:
          "useState vs useRef — useState triggers a re-render when it changes; useRef doesn't. Use useRef for values a component needs to remember but shouldn't cause a re-draw (a timer ID, a DOM node).\n\n" +
          "The useEffect dependency array — React re-runs the effect when any value in the array changes since the last render. An empty array means 'run once, after the first render.' Omitting the array entirely means 'run after every render' — almost always a bug.\n\n" +
          "Controlled vs uncontrolled inputs — controlled means React state is the source of truth (value + onChange); uncontrolled means the DOM holds the value and you read it via a ref when needed. Forms are controlled by default in most React codebases.",
      },
    ],
  },
  {
    slug: "technical-communication",
    name: "Technical communication",
    tagline:
      "Explain your work clearly — in a standup, a PR, or an interview.",
    order: 4,
    requiredEntitlement: "FREE" as const,
    relevantRoles: [
      "SOFTWARE_ENGINEER",
      "DATA_ML_ENGINEER",
      "FRONTEND_ENGINEER",
      "CLOUD_DEVOPS",
      "HIGHER_STUDIES",
    ] as const,
    videoId: "vT5pcc30Ffw",
    lectures: [
      "Writing clearly under pressure",
      "Structuring a technical explanation",
    ],
    notes: [
      {
        title: "Explaining your project in 60 seconds",
        content:
          "A structure that holds up under interview pressure:\n\n" +
          "1. What it does, in one sentence — no jargon, as if to a non-technical friend.\n" +
          "2. The one hard part — the thing that wasn't obvious, and how you solved it.\n" +
          "3. Your specific contribution — if it was a team project, say exactly what you built, not what 'we' built.\n" +
          "4. A number, if you have one — faster, smaller, more users, fewer errors. Interviewers remember numbers.\n\n" +
          "Skip the full tech stack list unless asked — it reads as padding, not signal.",
      },
    ],
  },
];

async function main() {
  for (const trackData of TRACKS) {
    const { lectures, videoId, notes, ...trackFields } = trackData;
    const trackInput = {
      ...trackFields,
      relevantRoles: [...trackFields.relevantRoles],
    };

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

    for (const [index, note] of notes.entries()) {
      await prisma.note.upsert({
        where: { id: `${track.id}-note-${index}` },
        update: {},
        create: {
          id: `${track.id}-note-${index}`,
          trackId: track.id,
          order: index + 1,
          title: note.title,
          content: note.content,
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
          joinUrl: `https://meet.jit.si/precompilers-${track.slug}`,
        },
      });
    } else if (existingLiveClass.joinUrl.includes("meet.google.com")) {
      await prisma.liveClass.update({
        where: { id: existingLiveClass.id },
        data: { joinUrl: `https://meet.jit.si/precompilers-${track.slug}` },
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
