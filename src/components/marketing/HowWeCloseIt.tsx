const ITEMS = [
  {
    number: "01",
    title: "Live classes",
    description:
      "Scheduled sessions with instructors, not a video library. Ask questions while you're stuck.",
    id: undefined as string | undefined,
  },
  {
    number: "02",
    title: "Industry tracks",
    description:
      "SQL, AWS, Azure, React, Angular, backend systems. Chosen from what job posts actually ask for.",
    id: "tracks",
  },
  {
    number: "03",
    title: "Real projects",
    description:
      "Briefed like work, reviewed by mentors and peers. So you have something to describe in the room.",
    id: undefined,
  },
  {
    number: "04",
    title: "Mock interviews",
    description:
      "With mentors and with peers. Every one ends in a scorecard you can act on.",
    id: undefined,
  },
];

export default function HowWeCloseIt() {
  return (
    <section id="how-we-close-it" className="px-12 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-brand text-[34px] font-bold tracking-[-0.025em] text-ink">
          How we close it
        </h2>
        <p className="mt-3 text-[15px] text-ink-muted">
          Four things, in the order they matter. People are involved in all
          of them.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div
              key={item.number}
              id={item.id}
              className="rounded-xl border border-line p-6"
            >
              <span className="flex h-8.5 w-8.5 items-center justify-center rounded-[9px] bg-accent-soft font-mono text-[12px] text-indigo-600">
                {item.number}
              </span>
              <h3 className="mt-4 font-brand text-[17px] font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
