export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="rounded-full border border-indigo-600/20 bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300">
          Built for CSE &amp; AIML students
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Learn to code.
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">Crack the interview.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-black/60 dark:text-white/60">
          PreCompilers is the one place to practice coding, take quizzes, level up your
          skills, run mock interviews, and get assessed by peers — everything you need
          to go from classroom to job offer.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#waitlist"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Join the waitlist
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black/80 transition hover:border-black/20 dark:border-white/15 dark:text-white/80 dark:hover:border-white/30"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-black/40 dark:text-white/40">
          Free while in beta · No credit card required
        </p>
      </div>
    </section>
  );
}
