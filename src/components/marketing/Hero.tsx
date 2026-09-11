import CodeEditorDemo from "@/components/marketing/CodeEditorDemo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-surface-sunk to-surface px-12 pt-19 pb-17">
      <div className="pointer-events-none absolute -top-30 -right-20 h-115 w-115 rounded-full bg-accent-soft opacity-60 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            For students in India
          </span>

          <h1
            className="mt-6 font-brand text-[58px] font-extrabold tracking-[-0.035em] text-ink"
            style={{ lineHeight: 1.05, textWrap: "balance" }}
          >
            Your degree gets you the interview. We get you the offer.
          </h1>

          <p className="mt-6 max-w-lg text-[19px] leading-[1.55] font-light text-ink-muted">
            Live classes, industry skill tracks, real projects and mock
            interviews with mentors who have hired people.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="https://student.precompilers.com/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-brand text-[14px] font-semibold text-white transition hover:bg-accent-hover"
            >
              Sign up free
            </a>
            <a
              href="#colleges"
              className="rounded-lg border border-line px-6 py-3 font-brand text-[14px] font-semibold text-ink transition hover:bg-surface-sunk"
            >
              I&apos;m from a college
            </a>
          </div>
        </div>

        <CodeEditorDemo />
      </div>
    </section>
  );
}
