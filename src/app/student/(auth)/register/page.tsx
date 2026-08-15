"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { isPasswordValid } from "@/lib/passwordPolicy";

const inputClass =
  "w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink-faint focus:outline-none focus:ring-1 focus:ring-line";
const labelClass = "mb-1 block text-sm font-medium text-ink-secondary";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordValid = isPasswordValid(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = email.length > 0 && passwordValid && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    if (!passwordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard
      title="Create your student account"
      description="We'll send a verification code to your email."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          {password.length > 0 ? (
            <div className="mt-3">
              <PasswordStrength password={password} />
            </div>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword.length > 0 && !passwordsMatch ? (
            <p className="mt-1 text-xs text-red-600">
              Passwords do not match
            </p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full rounded-md bg-ink py-2 text-sm font-medium text-surface transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-ink-faint">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
