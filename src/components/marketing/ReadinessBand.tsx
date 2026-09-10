import ReadinessRing from "@/components/marketing/ReadinessRing";

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

        <ReadinessRing />
      </div>
    </section>
  );
}
