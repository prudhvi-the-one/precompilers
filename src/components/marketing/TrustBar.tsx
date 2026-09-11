// Not imported into (marketing)/page.tsx yet — the logo slots below are
// placeholders. Wire this in once real partner/college logos exist; do not
// fill them with invented brand marks.
export default function TrustBar() {
  const slots = ["College / partner logo", "College / partner logo", "College / partner logo", "College / partner logo", "College / partner logo"];

  return (
    <section className="border-b border-line-soft bg-surface px-12 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
        <p className="text-sm text-ink-faint">Trusted by students preparing for roles at</p>
        <div className="flex flex-wrap justify-end gap-3.5">
          {slots.map((label, i) => (
            <div
              key={i}
              className="rounded-lg border border-dashed border-line px-5 py-2.5 text-center font-mono text-[10.5px] text-ink-faintest"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
