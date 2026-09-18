"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function QuizTopicFilterSelect({
  topics,
  selected,
}: {
  topics: string[];
  selected: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("topic");
    } else {
      params.set("topic", value);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/practice/quizzes?${query}` : "/practice/quizzes");
  }

  return (
    <select
      value={selected}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary"
    >
      <option value="all">All topics</option>
      {topics.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
