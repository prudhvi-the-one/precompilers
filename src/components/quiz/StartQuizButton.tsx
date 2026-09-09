"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Starting…" : label}
    </button>
  );
}

// A real <form> POST, not a fetch()-then-navigate: the API redirects
// straight to the new attempt, so the whole thing is one continuous,
// browser-native navigation off the click — see the route for why
// (a JS-triggered navigation after an awaited fetch can lose the click's
// user-activation on a slow response and get silently blocked).
export default function StartQuizButton({
  quizId,
  label = "Start quiz",
}: {
  quizId: string;
  label?: string;
}) {
  return (
    <form action={`/api/quizzes/${quizId}/start`} method="POST">
      <SubmitButton label={label} />
    </form>
  );
}
