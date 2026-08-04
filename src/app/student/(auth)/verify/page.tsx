"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:border-gray-500 focus:outline-none";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);

    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "EMAIL_VERIFY" }),
    });
    const data = await res.json();

    setResending(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setInfo("A new code has been sent.");
  }

  return (
    <AuthCard
      title="Verify your email"
      description={email ? `We sent a code to ${email}` : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          placeholder="000000"
          required
          maxLength={6}
          className={inputClass}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {info ? <p className="text-sm text-gray-500">{info}</p> : null}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-md bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
      <button
        onClick={handleResend}
        disabled={resending}
        className="w-full text-center text-sm text-gray-500 underline disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
