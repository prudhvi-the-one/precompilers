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

type QuestionSeed = {
  text: string;
  marks?: number;
  options: string[];
  correctIndex: number;
};

type SectionSeed = {
  name: string;
  durationMinutes: number;
  questions: QuestionSeed[];
};

type QuizSeed = {
  slug: string;
  title: string;
  topic: string;
  kind: "TOPIC_QUIZ" | "APTITUDE_PAPER";
  order: number;
  sections: SectionSeed[];
};

const QUIZZES: QuizSeed[] = [
  {
    slug: "os-core-concepts",
    title: "Operating systems — core concepts",
    topic: "Operating systems",
    kind: "TOPIC_QUIZ",
    order: 1,
    sections: [
      {
        name: "Core concepts",
        durationMinutes: 15,
        questions: [
          {
            text: "Which of the four Coffman conditions is broken by requiring a process to request all its resources at once?",
            options: [
              "Mutual exclusion",
              "Hold and wait",
              "No preemption",
              "Circular wait",
            ],
            correctIndex: 1,
          },
          {
            text: "What is the main difference between a process and a thread?",
            options: [
              "Threads have separate address spaces, processes share memory",
              "Processes have separate address spaces, threads within a process share memory",
              "There is no difference",
              "Threads cannot run concurrently",
            ],
            correctIndex: 1,
          },
          {
            text: "Which scheduling algorithm can lead to starvation of long processes?",
            options: [
              "Round Robin",
              "Shortest Job First",
              "First Come First Served",
              "Priority scheduling with aging",
            ],
            correctIndex: 1,
          },
          {
            text: "A page fault occurs when:",
            options: [
              "The CPU executes an invalid instruction",
              "A process tries to access a page not currently in physical memory",
              "Two processes deadlock",
              "The disk fails",
            ],
            correctIndex: 1,
          },
          {
            text: "Which of these is NOT one of the four necessary conditions for deadlock?",
            options: [
              "Mutual exclusion",
              "Hold and wait",
              "Preemption",
              "Circular wait",
            ],
            correctIndex: 2,
          },
          {
            text: "What does a semaphore's wait() (P) operation do when the semaphore value is 0?",
            options: [
              "Increments the value and proceeds",
              "Immediately returns an error",
              "Blocks the calling process until the value becomes positive",
              "Terminates the process",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  {
    slug: "dbms-core-concepts",
    title: "Databases — core concepts",
    topic: "DBMS",
    kind: "TOPIC_QUIZ",
    order: 2,
    sections: [
      {
        name: "Core concepts",
        durationMinutes: 15,
        questions: [
          {
            text: "Which normal form eliminates transitive dependencies on a non-key attribute?",
            options: ["1NF", "2NF", "3NF", "BCNF"],
            correctIndex: 2,
          },
          {
            text: "In ACID properties, what does \"Isolation\" guarantee?",
            options: [
              "Transactions are never rolled back",
              "Concurrent transactions do not interfere with each other's intermediate state",
              "Data is stored durably on disk",
              "All operations in a transaction succeed or none do",
            ],
            correctIndex: 1,
          },
          {
            text: "Which type of SQL join returns rows only when there is a match in both tables?",
            options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"],
            correctIndex: 2,
          },
          {
            text: "A composite index on (a, b) can efficiently serve a query filtering on:",
            options: [
              "Only b",
              "Only a, or a and b together",
              "Neither a nor b",
              "Any column in the table",
            ],
            correctIndex: 1,
          },
          {
            text: "What is a deadlock in the context of database transactions?",
            options: [
              "A transaction that runs forever",
              "Two or more transactions waiting on locks held by each other, none able to proceed",
              "A transaction that reads uncommitted data",
              "A failed disk write",
            ],
            correctIndex: 1,
          },
          {
            text: "Which isolation level is the only one, per the ANSI SQL standard, guaranteed to prevent phantom reads?",
            options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            correctIndex: 3,
          },
        ],
      },
    ],
  },
  {
    slug: "oop-core-concepts",
    title: "Object-oriented programming — core concepts",
    topic: "OOP",
    kind: "TOPIC_QUIZ",
    order: 3,
    sections: [
      {
        name: "Core concepts",
        durationMinutes: 15,
        questions: [
          {
            text: "What is polymorphism?",
            options: [
              "Hiding implementation details from the user",
              "The ability of a single interface to represent different underlying forms",
              "Bundling data and methods together",
              "Reusing code via inheritance only",
            ],
            correctIndex: 1,
          },
          {
            text: "Which OOP principle is violated when a class's internal fields are made public with no accessors?",
            options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
            correctIndex: 2,
          },
          {
            text: "Method overriding requires:",
            options: [
              "Same method name, different parameter list, same class",
              "Same method name and parameter list, in a subclass, redefining superclass behavior",
              "Different method names entirely",
              "Static methods only",
            ],
            correctIndex: 1,
          },
          {
            text: "What is the key difference between an abstract class and an interface (in languages that distinguish them, like Java)?",
            options: [
              "Abstract classes cannot have any implemented methods",
              "Interfaces can have constructors",
              "A class can implement multiple interfaces but typically extend only one abstract class",
              "There is no difference",
            ],
            correctIndex: 2,
          },
          {
            text: "Composition over inheritance is generally preferred because:",
            options: [
              "It always runs faster",
              "It creates tighter coupling between classes",
              "It avoids fragile hierarchies and lets behavior be assembled from independent parts",
              "It removes the need for interfaces",
            ],
            correctIndex: 2,
          },
          {
            text: 'In SOLID principles, what does the "S" (Single Responsibility Principle) state?',
            options: [
              "A class should have only one reason to change",
              "A class should implement only one interface",
              "A class should have only one public method",
              "A class should never be subclassed",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    slug: "networks-core-concepts",
    title: "Computer networks — core concepts",
    topic: "Computer networks",
    kind: "TOPIC_QUIZ",
    order: 4,
    sections: [
      {
        name: "Core concepts",
        durationMinutes: 15,
        questions: [
          {
            text: "Which OSI layer is responsible for routing packets between different networks?",
            options: ["Data Link", "Network", "Transport", "Session"],
            correctIndex: 1,
          },
          {
            text: "TCP provides which guarantee that UDP does not?",
            options: [
              "Lower latency",
              "Multicast support",
              "Reliable, ordered delivery",
              "Smaller header size",
            ],
            correctIndex: 2,
          },
          {
            text: "What does DNS primarily do?",
            options: [
              "Encrypts network traffic",
              "Translates domain names into IP addresses",
              "Assigns MAC addresses to devices",
              "Routes packets between autonomous systems",
            ],
            correctIndex: 1,
          },
          {
            text: "In the TCP three-way handshake, what is the correct order?",
            options: ["ACK, SYN, SYN-ACK", "SYN, SYN-ACK, ACK", "SYN-ACK, SYN, ACK", "ACK, ACK, SYN"],
            correctIndex: 1,
          },
          {
            text: "HTTPS achieves confidentiality primarily through:",
            options: [
              "Compressing the payload",
              "TLS encryption of the connection",
              "Using a different port than HTTP",
              "Caching responses",
            ],
            correctIndex: 1,
          },
          {
            text: "What is the purpose of subnetting?",
            options: [
              "To increase the physical distance a network can span",
              "To divide a larger network into smaller, manageable segments and reduce broadcast traffic",
              "To convert IP addresses into MAC addresses",
              "To provide encryption for a LAN",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    slug: "tcs-digital-pattern",
    title: "TCS Digital pattern",
    topic: "Aptitude — full paper",
    kind: "APTITUDE_PAPER",
    order: 1,
    sections: [
      {
        name: "Quantitative",
        durationMinutes: 20,
        questions: [
          {
            text: "A shopkeeper marks up an item by 25% and then gives a discount of 20% on the marked price. What is the overall percentage change in price?",
            options: ["5% profit", "5% loss", "No profit no loss", "10% loss"],
            correctIndex: 2,
          },
          {
            text: "The average of 5 consecutive even numbers is 24. What is the largest number?",
            options: ["26", "28", "30", "24"],
            correctIndex: 1,
          },
          {
            text: "If the ratio of two numbers is 3:4 and their LCM is 180, what is their sum?",
            options: ["90", "100", "105", "120"],
            correctIndex: 2,
          },
          {
            text: "A can complete a work in 12 days and B in 18 days. Working together, how many days will they take?",
            options: ["6 days", "7.2 days", "8 days", "9 days"],
            correctIndex: 1,
          },
          {
            text: "A train 120 m long crosses a platform 180 m long in 20 seconds. What is the speed of the train in km/h?",
            options: ["45 km/h", "50 km/h", "54 km/h", "60 km/h"],
            correctIndex: 2,
          },
        ],
      },
      {
        name: "Logical reasoning",
        durationMinutes: 20,
        questions: [
          {
            text: "Five students P, Q, R, S, T sit in a row facing north. Q is to the immediate right of P. R is at the extreme right end. Exactly one student sits between Q and R. S is to the immediate left of P. Who sits second from the left?",
            options: ["S", "P", "Q", "T"],
            correctIndex: 1,
          },
          {
            text: "In a certain code, FRIEND is written as HTKGPF (each letter shifted 2 places forward in the alphabet). What is the code for CANDLE?",
            options: ["ECPFNG", "EDPFNG", "ECPFMG", "ECQFNG"],
            correctIndex: 0,
          },
          {
            text: "Statement: All roses are flowers. Some flowers fade quickly. Conclusion I: Some roses fade quickly. Conclusion II: All flowers are roses. Which conclusion(s) logically follow?",
            options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
            correctIndex: 3,
          },
          {
            text: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            options: ["36", "40", "42", "44"],
            correctIndex: 2,
          },
          {
            text: 'Pointing to a photograph, Ravi said, "She is the daughter of my grandfather\'s only son." How is the woman in the photograph related to Ravi?',
            options: ["Sister", "Daughter", "Mother", "Cousin"],
            correctIndex: 0,
          },
        ],
      },
      {
        name: "Verbal ability",
        durationMinutes: 20,
        questions: [
          {
            text: 'Choose the word most nearly opposite in meaning to "CANDID":',
            options: ["Honest", "Secretive", "Blunt", "Frank"],
            correctIndex: 1,
          },
          {
            text: "Choose the correctly spelled word:",
            options: ["Occassion", "Occasion", "Ocassion", "Ocasion"],
            correctIndex: 1,
          },
          {
            text: 'Fill in the blank: "Despite the heavy rain, the match ____ as scheduled."',
            options: ["went on", "went off", "went up", "went out"],
            correctIndex: 0,
          },
          {
            text: 'Identify the error in the sentence: "Each of the students have submitted their assignment."',
            options: ["Each of the students", "have submitted", "their assignment", "No error"],
            correctIndex: 1,
          },
          {
            text: 'Choose the correct synonym for "METICULOUS":',
            options: ["Careless", "Painstaking", "Hasty", "Vague"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
];

async function seedQuizzes() {
  const LABELS = ["A", "B", "C", "D"];

  for (const quizData of QUIZZES) {
    const { sections, ...quizFields } = quizData;

    const quiz = await prisma.quiz.upsert({
      where: { slug: quizData.slug },
      update: { title: quizFields.title, topic: quizFields.topic, order: quizFields.order },
      create: quizFields,
    });

    for (const [sectionIndex, sectionData] of sections.entries()) {
      const { questions, ...sectionFields } = sectionData;
      const sectionId = `${quiz.id}-section-${sectionIndex}`;

      const section = await prisma.quizSection.upsert({
        where: { id: sectionId },
        update: { ...sectionFields, order: sectionIndex + 1 },
        create: { id: sectionId, quizId: quiz.id, order: sectionIndex + 1, ...sectionFields },
      });

      for (const [questionIndex, questionData] of questions.entries()) {
        const { options, correctIndex, ...questionFields } = questionData;
        const questionId = `${section.id}-q-${questionIndex}`;

        const question = await prisma.question.upsert({
          where: { id: questionId },
          update: { ...questionFields, order: questionIndex + 1 },
          create: {
            id: questionId,
            sectionId: section.id,
            order: questionIndex + 1,
            ...questionFields,
          },
        });

        for (const [optionIndex, text] of options.entries()) {
          const optionId = `${question.id}-opt-${optionIndex}`;
          await prisma.questionOption.upsert({
            where: { id: optionId },
            update: { text, isCorrect: optionIndex === correctIndex },
            create: {
              id: optionId,
              questionId: question.id,
              order: optionIndex + 1,
              label: LABELS[optionIndex],
              text,
              isCorrect: optionIndex === correctIndex,
            },
          });
        }
      }
    }
  }

  console.log("Seeded quizzes:", QUIZZES.map((q) => q.slug).join(", "));
}

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

  await seedQuizzes();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
