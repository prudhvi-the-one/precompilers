"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CompanyFilterSelect({
  companies,
  selected,
}: {
  companies: string[];
  selected: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("company");
    } else {
      params.set("company", value);
    }
    const query = params.toString();
    router.push(query ? `/practice/problems?${query}` : "/practice/problems");
  }

  return (
    <select
      value={selected}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full border border-[#E6E6EF] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#2A2A38]"
    >
      <option value="all">All companies</option>
      {companies.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
