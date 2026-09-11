// Not imported into (marketing)/page.tsx yet — the quotes below are
// placeholders. Wire this in once real, permissioned student quotes exist;
// do not fill them with invented names or quotes.
const TESTIMONIALS = [
  { name: "Student name", meta: "Placeholder · Batch/branch" },
  { name: "Student name", meta: "Placeholder · Batch/branch" },
  { name: "Placement cell", meta: "Placeholder · Partner institution" },
];

export default function Testimonials() {
  return (
    <section className="bg-surface-sunk px-12 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            Success stories
          </span>
          <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
            Real students. Real journeys.
          </h2>
        </div>

        <div className="mt-4 flex gap-2 rounded-lg border border-warn bg-warn-soft px-4 py-3 text-[12.5px] text-warn">
          <span>⚠</span>
          Placeholder content — swap in verified quotes (with permission to publish) before this
          goes live.
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-5.5">
              <div className="text-[13px] tracking-[2px] text-warn">★★★★★</div>
              <p className="mt-2.5 text-[13.5px] leading-[1.6] text-ink-secondary italic">
                &ldquo;Placeholder — real quote pending permission to publish.&rdquo;
              </p>
              <div className="mt-3.5 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-brand text-[12px] font-bold text-indigo-600">
                  {t.name[0]}
                </span>
                <div className="text-xs text-ink-faint">
                  <b className="block text-[13px] font-semibold text-ink">{t.name}</b>
                  {t.meta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
