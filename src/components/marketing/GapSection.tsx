import StatsCounterGrid from "@/components/marketing/StatsCounterGrid";
import GapCard from "@/components/marketing/GapCard";

export default function GapSection() {
  return (
    <section id="gap" className="px-12 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col">
          <span className="inline-block w-fit rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            By the numbers
          </span>
          <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
            What&rsquo;s actually in here
          </h2>
          <div className="mt-6 flex-1">
            <StatsCounterGrid />
          </div>
        </div>

        <GapCard />
      </div>
    </section>
  );
}
