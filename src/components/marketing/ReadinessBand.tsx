const SAMPLE_PILLARS = [
  { label: "Fundamentals", value: 78 },
  { label: "Aptitude & communication", value: 64 },
  { label: "Industry skills", value: 52 },
];

export default function ReadinessBand() {
  return (
    <section className="bg-[#0F1020] px-12 py-18">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-mono text-[10px] tracking-[0.1em] text-[#A5A0FF] uppercase">
            One number
          </p>
          <h2 className="mt-4 font-brand text-[34px] font-bold tracking-[-0.025em] text-white">
            Know exactly how ready you are
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-[#A9A9BE]">
            Five pillars, updated every time you learn, practise or get
            assessed. Share it with a recruiter, or with your placement cell.
          </p>
        </div>

        <div
          className="flex h-70 flex-col items-center justify-center gap-6 rounded-xl border border-[#23243D] px-8"
          style={{ backgroundColor: "#16172B" }}
        >
          <div className="flex h-30 w-30 items-center justify-center rounded-full bg-[#6C63FF]/15">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: "conic-gradient(#6C63FF 0 71%, #23243D 71% 100%)",
              }}
            >
              <div className="flex h-19 w-19 items-center justify-center rounded-full bg-[#16172B]">
                <span className="font-brand text-2xl font-extrabold text-white">71</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-70 space-y-2.5">
            {SAMPLE_PILLARS.map((pillar) => (
              <div key={pillar.label} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-[11px] text-[#A9A9BE]">
                  {pillar.label}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-[#23243D]">
                  <div
                    className="h-full rounded-full bg-[#6C63FF]"
                    style={{ width: `${pillar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
