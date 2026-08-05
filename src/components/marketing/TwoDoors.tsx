"use client";

import { useState, type FormEvent } from "react";

export default function TwoDoors() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="px-12 py-16">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2">
        <div
          id="waitlist"
          className="rounded-xl border-[1.5px] border-indigo-600 bg-[#FBFAFF] p-8"
        >
          <p className="font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
            Students
          </p>
          <h3 className="mt-3 font-brand text-[21px] font-bold text-[#0F1020]">
            Get on the list
          </h3>
          <p className="mt-2 text-sm text-[#55556B]">
            We&apos;re opening access in batches. Drop your email and
            we&apos;ll tell you when your spot is ready.
          </p>

          {submitted ? (
            <p className="mt-5 rounded-lg bg-indigo-600/10 px-4 py-3 text-sm font-medium text-indigo-700">
              You&apos;re on the list! We&apos;ll email you at {email} when
              your spot is ready.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.name@college.edu"
                className="w-full rounded-lg border border-[#DDD9FB] bg-white px-4 py-2.5 text-sm text-[#0F1020] outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 font-brand text-[13.5px] font-semibold text-white transition hover:bg-[#4338CA]"
              >
                Join waitlist
              </button>
            </form>
          )}
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
