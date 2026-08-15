"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export default function PhoneLoginForm() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/phone-login/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setStep("code");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/phone-login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, code }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/home");
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            className={inputClass}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <p className="text-sm text-gray-500">
        We sent a 6-digit code to {phoneNumber}.
      </p>
      <div>
        <label className={labelClass} htmlFor="code">
          Code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          required
          className={inputClass}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify & log in"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setCode("");
          setError(null);
        }}
        className="w-full text-center text-sm text-gray-500 underline"
      >
        Use a different number
      </button>
    </form>
  );
}
