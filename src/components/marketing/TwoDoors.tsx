export default function TwoDoors() {
  return (
    <section className="px-12 py-16">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2">
        <div
          id="students"
          className="rounded-xl border-[1.5px] border-indigo-600 bg-[#FBFAFF] p-8"
        >
          <p className="font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            Students
          </p>
          <h3 className="mt-3 font-brand text-[21px] font-bold text-[#0F1020]">
            Start for free
          </h3>
          <p className="mt-2 text-sm text-[#55556B]">
            Create your account in under a minute — no waitlist, no credit
            card. Pick a track and start today.
          </p>

          <div className="mt-5">
            <a
              href="https://student.precompilers.com/register"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-brand text-[13.5px] font-semibold text-white transition hover:bg-[#4338CA]"
            >
              Create your free account
            </a>
          </div>
        </div>

        <div
          id="colleges"
          className="rounded-xl border border-[#E6E6EF] bg-white p-8"
        >
          <p className="font-mono text-[10px] tracking-[0.1em] text-[#8A8AA0] uppercase">
            Colleges &amp; placement cells
          </p>
          <h3 className="mt-3 font-brand text-[21px] font-bold text-[#0F1020]">
            Bring it to your campus
          </h3>
          <p className="mt-2 text-sm text-[#55556B]">
            Licence PreCompilers for a batch. Track cohort readiness,
            attendance and placement preparation in one dashboard.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href="mailto:hello@precompilers.com?subject=Book a demo"
              className="rounded-lg bg-[#0F1020] px-5 py-2.5 font-brand text-[13.5px] font-semibold text-white transition hover:bg-[#2A2A38]"
            >
              Book a demo
            </a>
            <a
              href="mailto:hello@precompilers.com"
              className="text-sm text-[#55556B] hover:text-[#0F1020]"
            >
              or email hello@precompilers.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
