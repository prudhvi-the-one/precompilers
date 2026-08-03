"use client";

import { useState, type FormEvent } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-full bg-indigo-600/10 px-6 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        You&apos;re on the list! We&apos;ll email you at {email} when we launch.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@college.edu"
        className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-black outline-none focus:border-indigo-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Join waitlist
      </button>
    </form>
  );
}
