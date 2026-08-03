const steps = [
  {
    step: "01",
    title: "Set your track",
    description:
      "Tell us your year, branch, and goal — placements, higher studies, or leveling up in AIML.",
  },
  {
    step: "02",
    title: "Practice daily",
    description:
      "Solve problems, take quizzes, and work through skill tracks with steady, bite-sized progress.",
  },
  {
    step: "03",
    title: "Get assessed",
    description:
      "Pair up for peer reviews and mock interviews to get honest, structured feedback on your skills.",
  },
  {
    step: "04",
    title: "Walk in ready",
    description:
      "Track your growth, know your weak spots, and walk into interviews with real confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-black/[.02] px-6 py-24 dark:bg-white/[.03]">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-black/60 dark:text-white/60">
            A simple loop of practice, feedback, and growth — designed for students, not
            recruiters.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <span className="text-4xl font-bold text-indigo-600/20 dark:text-indigo-400/20">
                {item.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
