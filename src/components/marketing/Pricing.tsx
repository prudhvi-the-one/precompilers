"use client";

import { useState } from "react";
import { TIERS, inr } from "@/lib/pricing";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="px-12 py-16">
      <div className="mx-auto max-w-6xl">
        <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
          Pricing
        </span>
        <h2 className="mt-4 font-brand text-[34px] font-bold tracking-[-0.025em] text-ink">
          Pick what you need
        </h2>
        <p className="mt-3 max-w-lg text-[15px] text-ink-muted">
          Every tier builds on the one before it. Cancel or switch anytime.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-line p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 font-brand text-[13px] font-semibold transition ${
              billing === "monthly"
                ? "bg-indigo-600 text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-brand text-[13px] font-semibold transition ${
              billing === "annual"
                ? "bg-indigo-600 text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Annual
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                billing === "annual"
                  ? "bg-white/20 text-white"
                  : "bg-accent-soft text-indigo-600"
              }`}
            >
              Save 33%
            </span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthlyPaise : tier.annualPaise;
            const displayMonthly = billing === "monthly" ? price : Math.round(price / 12);

            return (
              <div
                key={tier.tier}
                className={
                  tier.highlight
                    ? "rounded-xl border-[1.5px] border-indigo-600 bg-accent-soft p-8"
                    : "rounded-xl border border-line bg-surface p-8"
                }
              >
                {tier.highlight ? (
                  <p className="font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
                    Most popular
                  </p>
                ) : null}

                <h3 className="mt-3 font-brand text-[21px] font-bold text-ink">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{tier.tagline}</p>

                <div className="mt-5">
                  <span className="font-brand text-[36px] font-extrabold text-ink">
                    {inr(displayMonthly)}
                  </span>
                  <span className="text-sm text-ink-muted">/month</span>
                  <p className="mt-1 text-[13px] text-ink-faintest">
                    {billing === "annual"
                      ? `Billed ${inr(price)} yearly · + GST`
                      : "Billed monthly · + GST"}
                  </p>
                </div>

                <div className="mt-5">
                  <a
                    href="https://student.precompilers.com/register"
                    className={
                      tier.highlight
                        ? "block rounded-lg bg-indigo-600 px-5 py-2.5 text-center font-brand text-[13.5px] font-semibold text-white transition hover:bg-accent-hover"
                        : "block rounded-lg border border-line px-5 py-2.5 text-center font-brand text-[13.5px] font-semibold text-ink transition hover:bg-[#F6F5FF]"
                    }
                  >
                    Get {tier.name}
                  </a>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {tier.featuresIntro ? (
                    <li className="text-[13px] font-medium text-ink-faint">
                      {tier.featuresIntro}
                    </li>
                  ) : null}
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm text-ink-muted">
                      <span className="text-indigo-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
