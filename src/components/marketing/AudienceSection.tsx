import { GraduationCap, Building2, GitBranch, type LucideIcon } from "lucide-react";

const AUDIENCES: {
  icon: LucideIcon;
  name: string;
  tagline: string;
  points: string[];
  href: string;
  portal: string;
}[] = [
  {
    icon: GraduationCap,
    name: "Students",
    tagline: "Learn. Practice. Build. Get interview-ready.",
    points: [
      "Structured skill tracks & learning paths",
      "Coding practice, quizzes & simulators",
      "Mock interviews & project reviews",
      "A single readiness score that follows you",
    ],
    href: "https://student.precompilers.com/register",
    portal: "student.precompilers.com",
  },
  {
    icon: Building2,
    name: "Colleges & institutions",
    tagline: "See cohort readiness, not just attendance.",
    points: [
      "Cohort & batch tracking",
      "Faculty & mentor coordination",
      "Live readiness dashboards",
      "Placement drive coordination",
    ],
    href: "https://admin.precompilers.com/login",
    portal: "admin.precompilers.com",
  },
  {
    icon: GitBranch,
    name: "Training partners",
    tagline: "Deliver programs under your own batches.",
    points: [
      "Batch & roster management",
      "Billing & entitlements",
      "Performance statistics & leaderboards",
      "Placement tracking",
    ],
    href: "https://vendor.precompilers.com/login",
    portal: "vendor.precompilers.com",
  },
];

export default function AudienceSection() {
  return (
    <section className="bg-surface-sunk px-12 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            One platform, every side of placement
          </span>
          <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
            Built for students, colleges, and training partners
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {AUDIENCES.map((a) => (
            <a
              key={a.name}
              href={a.href}
              className="rounded-xl border border-line bg-surface p-6 transition hover:-translate-y-1"
            >
              <span className="flex h-10.5 w-10.5 items-center justify-center rounded-[11px] bg-accent-soft text-indigo-600">
                <a.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-brand text-[16px] font-bold text-ink">{a.name}</h3>
              <p className="mt-1 text-[13px] text-ink-faint">{a.tagline}</p>
              <ul className="mt-3.5 space-y-2 text-[12.5px] text-ink-secondary">
                {a.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-indigo-600">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
              <span className="mt-4 inline-block rounded-full border border-line bg-surface-sunk px-2.5 py-1 font-mono text-[10px] text-ink-faintest">
                {a.portal}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
