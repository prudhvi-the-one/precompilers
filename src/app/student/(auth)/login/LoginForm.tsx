"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import PhoneLoginForm from "./PhoneLoginForm";

const inputClass =
  "w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink-faint focus:outline-none focus:ring-1 focus:ring-line";
const labelClass = "mb-1 block text-sm font-medium text-ink-secondary";

export default function LoginForm({
  phoneLoginEnabled,
}: {
  phoneLoginEnabled: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      if (data.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/home");
  }

  return (
    <AuthCard title="Log in to PreCompilers">
      {phoneLoginEnabled ? (
        <div className="mb-4 flex rounded-md border border-line p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 rounded py-1.5 font-medium ${
              mode === "email" ? "bg-ink text-surface" : "text-ink-faint"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex-1 rounded py-1.5 font-medium ${
              mode === "phone" ? "bg-ink text-surface" : "text-ink-faint"
            }`}
          >
            Phone
          </button>
        </div>
      ) : null}

      {phoneLoginEnabled && mode === "phone" ? (
        <PhoneLoginForm />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink py-2 text-sm font-medium text-surface disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}

      <div className="mt-4 flex justify-between text-sm text-ink-faint">
        <Link href="/register" className="underline">
          Create account
        </Link>
        <Link href="/forgot-password" className="underline">
          Forgot password?
        </Link>
      </div>
    </AuthCard>
  );
}
