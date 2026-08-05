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
          className="flex h-70 items-center justify-center rounded-xl border border-[#23243D]"
          style={{
            backgroundColor: "#16172B",
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 10px)",
          }}
        >
          <span className="font-mono text-[11px] tracking-[0.05em] text-[#63637F] uppercase">
            Product screenshot — readiness report (screen 10)
          </span>
        </div>
      </div>
    </section>
  );
}
