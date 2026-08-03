const features = [
  {
    title: "Coding Practice",
    description:
      "Solve curated DSA and AIML problems with instant feedback, progress tracking, and difficulty paths.",
    icon: "</>",
  },
  {
    title: "Interview Prep",
    description:
      "Company-wise question banks, system design primers, and behavioral rounds tailored to CSE/AIML roles.",
    icon: "🎯",
  },
  {
    title: "Skill Tracks",
    description:
      "Go beyond the basics with next-level tracks in ML, DL, backend systems, and cloud — at your own pace.",
    icon: "🚀",
  },
  {
    title: "Quizzes",
    description:
      "Timed quizzes on core CS and AIML topics to test your fundamentals and spot weak areas fast.",
    icon: "📝",
  },
  {
    title: "Peer Assessment",
    description:
      "Review and get reviewed by fellow students — pair up, exchange feedback, and learn from each other's code.",
    icon: "🤝",
  },
  {
    title: "Mock Interviews",
    description:
      "Practice live mock interviews with peers or mentors, then get a structured scorecard to improve.",
    icon: "🎥",
  },
];

export default function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, in one place
          </h2>
          <p className="mt-4 text-black/60 dark:text-white/60">
            No more juggling five different apps to prep for placements. PreCompilers
            brings the whole journey together.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg dark:bg-indigo-500/10">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
