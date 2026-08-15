"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionTier } from "@prisma/client";
import { TIERS, inr } from "@/lib/pricing";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
};

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export default function UpgradeTiers({
  activeTier,
  userName,
  userEmail,
}: {
  activeTier: SubscriptionTier | null;
  userName?: string | null;
  userEmail: string;
}) {
  const router = useRouter();
  const [billing, setBilling] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [purchasing, setPurchasing] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase(tier: SubscriptionTier) {
    setError(null);
    setPurchasing(tier);
    try {
      await loadCheckoutScript();

      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billingCycle: billing }),
      });
      if (!res.ok) {
        throw new Error("Could not start checkout");
      }
      const order = await res.json();

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "PreCompilers",
        description: order.tierName,
        prefill: { name: userName ?? undefined, email: userEmail },
        theme: { color: "#4F46E5" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) {
            setError("Payment succeeded but verification failed. Contact support.");
            return;
          }
          router.push("/home");
          router.refresh();
        },
      });
      razorpay.open();
    } catch {
      setError("Something went wrong starting checkout. Try again.");
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div>
      <div className="inline-flex items-center gap-1 rounded-full border border-[#E6E6EF] p-1">
        <button
          type="button"
          onClick={() => setBilling("MONTHLY")}
          className={`rounded-full px-4 py-1.5 font-brand text-[13px] font-semibold transition ${
            billing === "MONTHLY"
              ? "bg-indigo-600 text-white"
              : "text-[#55556B] hover:text-[#0F1020]"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBilling("ANNUAL")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-brand text-[13px] font-semibold transition ${
            billing === "ANNUAL"
              ? "bg-indigo-600 text-white"
              : "text-[#55556B] hover:text-[#0F1020]"
          }`}
        >
          Annual
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
              billing === "ANNUAL"
                ? "bg-white/20 text-white"
                : "bg-[#F1F0FE] text-indigo-600"
            }`}
          >
            Save 33%
          </span>
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const price = billing === "MONTHLY" ? tier.monthlyPaise : tier.annualPaise;
          const displayMonthly =
            billing === "MONTHLY" ? price : Math.round(price / 12);
          const isCurrent = activeTier === tier.tier;

          return (
            <div
              key={tier.tier}
              className={
                tier.highlight
                  ? "rounded-xl border-[1.5px] border-indigo-600 bg-[#FBFAFF] p-8"
                  : "rounded-xl border border-[#E6E6EF] bg-white p-8"
              }
            >
              {tier.highlight ? (
                <p className="font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
                  Most popular
                </p>
              ) : null}

              <h3 className="mt-3 font-brand text-[21px] font-bold text-[#0F1020]">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-[#55556B]">{tier.tagline}</p>

              <div className="mt-5">
                <span className="font-brand text-[36px] font-extrabold text-[#0F1020]">
                  {inr(displayMonthly)}
                </span>
                <span className="text-sm text-[#55556B]">/month</span>
                <p className="mt-1 text-[13px] text-[#9A9AAE]">
                  {billing === "ANNUAL"
                    ? `Billed ${inr(price)} yearly · + GST`
                    : "Billed monthly · + GST"}
                </p>
              </div>

              <div className="mt-5">
                {isCurrent ? (
                  <span className="block rounded-lg bg-[#E7F7F0] px-5 py-2.5 text-center font-brand text-[13.5px] font-semibold text-[#059669]">
                    Current plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchase(tier.tier)}
                    disabled={purchasing !== null}
                    className={
                      tier.highlight
                        ? "block w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-center font-brand text-[13.5px] font-semibold text-white transition hover:bg-[#4338CA] disabled:opacity-50"
                        : "block w-full rounded-lg border border-[#E6E6EF] px-5 py-2.5 text-center font-brand text-[13.5px] font-semibold text-[#0F1020] transition hover:bg-[#F6F5FF] disabled:opacity-50"
                    }
                  >
                    {purchasing === tier.tier ? "Opening checkout…" : `Get ${tier.name}`}
                  </button>
                )}
              </div>

              <ul className="mt-6 space-y-2.5">
                {tier.featuresIntro ? (
                  <li className="text-[13px] font-medium text-[#8A8AA0]">
                    {tier.featuresIntro}
                  </li>
                ) : null}
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#55556B]">
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
  );
}
