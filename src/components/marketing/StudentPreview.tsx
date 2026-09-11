import { Check, PlayCircle } from "lucide-react";
import BrowserChrome from "@/components/marketing/BrowserChrome";

const NAV_ITEMS = ["Skill tracks", "Lectures", "Live classes", "Notes & resources", "Learning paths"];

const LESSONS = [
  { title: "Core services: EC2, S3, IAM", done: true },
  { title: "Networking basics: VPC and security groups", done: true },
  { title: "IAM roles and least-privilege access", done: true },
  { title: "Monitoring with CloudWatch", done: true },
  { title: "Deploying your project to AWS", done: false },
  { title: "Cost management and cleanup", done: false },
];

export default function StudentPreview() {
  return (
    <section className="px-12 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
        <BrowserChrome url="student.precompilers.com/learn/lectures">
          <div className="grid grid-cols-[130px_1fr]">
            <div className="border-r border-line-soft bg-surface-sunk p-3">
              {NAV_ITEMS.map((item, i) => (
                <div
                  key={item}
                  className={
                    i === 1
                      ? "rounded-md bg-accent-soft px-2.5 py-2 text-[11px] font-semibold text-indigo-600"
                      : "px-2.5 py-2 text-[11px] text-ink-faint"
                  }
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="p-5">
              <p className="font-brand text-[13px] font-bold text-ink">AWS fundamentals</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">4 of 6 complete · 1h 42m total</p>
              <div className="mt-3 h-2 rounded-full bg-line-soft">
                <div className="h-full w-[67%] rounded-full bg-indigo-600" />
              </div>
              <div className="mt-4 space-y-0.5">
                {LESSONS.map((lesson) => (
                  <div key={lesson.title} className="flex items-center gap-2.5 border-t border-line-soft py-2 first:border-t-0">
                    <span
                      className={
                        lesson.done
                          ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                          : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-ink-faintest"
                      }
                    >
                      {lesson.done ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        <PlayCircle className="h-3 w-3" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="text-[11.5px] text-ink-secondary">{lesson.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BrowserChrome>

        <div>
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            For students
          </span>
          <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
            This is what students actually see
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-ink-muted">
            Real skill tracks, real progress bars, real lesson lists — taken directly from the
            live Learn section, not a generic course-player mockup.
          </p>
          <a
            href="https://student.precompilers.com/register"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-brand text-[14px] font-semibold text-white transition hover:bg-accent-hover"
          >
            Start learning free →
          </a>
        </div>
      </div>
    </section>
  );
}
