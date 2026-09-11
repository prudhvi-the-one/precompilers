import BrowserChrome from "@/components/marketing/BrowserChrome";

const NAV_ITEMS = ["Dashboard", "Students", "Assessments", "Reports", "Settings"];

const SKILLS = [
  { label: "DSA", pct: 82, color: "var(--accent)" },
  { label: "SQL", pct: 76, color: "var(--chart-secondary)" },
  { label: "Python", pct: 81, color: "var(--success)" },
  { label: "Comm.", pct: 68, color: "var(--pillar-pink)" },
  { label: "Projects", pct: 73, color: "var(--warn)" },
];

const CHART_BARS = [35, 55, 45, 72, 90];

export default function InstitutionPreview() {
  return (
    <section className="bg-surface-sunk px-12 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            For colleges &amp; institutions
          </span>
          <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
            Give your placement cell a live view of student readiness
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-ink-muted">
            Track progress, spot skill gaps early, and see real-time readiness across your whole
            cohort — the same readiness score every student already sees on their own dashboard.
          </p>
          <a
            href="https://admin.precompilers.com/login"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-brand text-[14px] font-semibold text-white transition hover:bg-accent-hover"
          >
            Book a college demo →
          </a>
        </div>

        <BrowserChrome url="admin.precompilers.com/cohort">
          <div className="grid grid-cols-[110px_1fr_130px]">
            <div className="border-r border-line-soft bg-surface-sunk p-3">
              {NAV_ITEMS.map((item, i) => (
                <div
                  key={item}
                  className={
                    i === 0
                      ? "rounded-md bg-accent-soft px-2.5 py-2 text-[11px] font-semibold text-indigo-600"
                      : "px-2.5 py-2 text-[11px] text-ink-faint"
                  }
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="p-4">
              <p className="font-brand text-[12px] font-bold text-ink">
                Cohort readiness — Batch of 2026
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div
                  className="flex h-21 w-21 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "conic-gradient(var(--accent) 0 72%, var(--line-soft) 72% 100%)" }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface font-brand text-[19px] font-extrabold text-ink">
                    72
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {SKILLS.map((s) => (
                    <div key={s.label} className="grid grid-cols-[42px_1fr_28px] items-center gap-2 text-[10px] text-ink-faint">
                      <span>{s.label}</span>
                      <div className="h-1.25 rounded-full bg-line-soft">
                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <span className="text-right font-bold" style={{ color: s.color }}>
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden flex-col gap-2.5 border-l border-line-soft p-3 sm:flex">
              <div className="rounded-md border border-line-soft p-2">
                <p className="text-[9px] text-ink-faintest">Total students</p>
                <p className="font-brand text-[15px] font-bold text-ink">480</p>
              </div>
              <div className="rounded-md border border-line-soft p-2">
                <p className="text-[9px] text-ink-faintest">Active learners</p>
                <p className="font-brand text-[15px] font-bold text-ink">412</p>
              </div>
              <div className="rounded-md border border-line-soft p-2">
                <p className="text-[9px] text-ink-faintest">Batch performance</p>
                <div className="mt-1.5 flex h-8 items-end gap-1">
                  {CHART_BARS.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-indigo-600 opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </BrowserChrome>
      </div>
    </section>
  );
}
