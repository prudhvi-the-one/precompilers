import Link from "next/link";
import GapCard from "@/components/marketing/GapCard";

export default function Hero() {
  return (
    <section
      id="gap"
      className="bg-gradient-to-b from-[#FBFBFE] to-white px-12 pt-19 pb-17"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-block rounded-full bg-[#F1F0FE] px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            For CSE &amp; AIML students in India
          </span>

          <h1
            className="mt-6 font-brand text-[58px] font-extrabold tracking-[-0.035em] text-[#0F1020]"
            style={{ lineHeight: 1.05, textWrap: "balance" }}
          >
            Your degree gets you the interview. We get you the offer.
          </h1>

          <p className="mt-6 max-w-lg text-[19px] leading-[1.55] font-light text-[#55556B]">
            Live classes, industry skill tracks, real projects and mock
            interviews with mentors who have hired people.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#waitlist"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-brand text-[14px] font-semibold text-white transition hover:bg-[#4338CA]"
            >
              Join the waitlist
            </Link>
            <a
              href="#colleges"
              className="rounded-lg border border-[#E6E6EF] px-6 py-3 font-brand text-[14px] font-semibold text-[#0F1020] transition hover:bg-[#F6F5FF]"
            >
              I&apos;m from a college
            </a>
          </div>

          <p className="mt-4 text-[13px] text-[#9A9AAE]">
            Free while in beta · No credit card required
          </p>
        </div>

        <GapCard />
      </div>
    </section>
  );
}
