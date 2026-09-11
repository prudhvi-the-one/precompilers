"use client";

import { useEffect, useRef, useState } from "react";
import BrowserChrome from "@/components/marketing/BrowserChrome";

type Snippet = {
  file: string;
  files: string[];
  lang: string;
  keywords: string[];
  lines: string[];
  output: string[];
};

// Same problem (Two Sum), four real languages — a true claim about the
// product ("practice in whatever language you use"), not decoration.
const SNIPPETS: Snippet[] = [
  {
    file: "two_sum.py",
    files: ["two_sum.py", "utils.py", "README.md", "tests/"],
    lang: "Python 3",
    keywords: ["def", "for", "in", "if", "return"],
    lines: [
      "def two_sum(nums, target):",
      "    # map each value seen so far to its index",
      "    seen = {}",
      "    for i, n in enumerate(nums):",
      "        need = target - n",
      "        if need in seen:",
      "            return [seen[need], i]",
      "        seen[n] = i",
      "    return []",
    ],
    output: ["nums = [2, 7, 11, 15]", "target = 9", "→ [0, 1]"],
  },
  {
    file: "twoSum.js",
    files: ["twoSum.js", "utils.js", "README.md", "tests/"],
    lang: "JavaScript",
    keywords: ["function", "for", "let", "const", "if", "return", "new"],
    lines: [
      "function twoSum(nums, target) {",
      "  // map each value seen so far to its index",
      "  const seen = new Map();",
      "  for (let i = 0; i < nums.length; i++) {",
      "    const need = target - nums[i];",
      "    if (seen.has(need)) return [seen.get(need), i];",
      "    seen.set(nums[i], i);",
      "  }",
      "  return [];",
      "}",
    ],
    output: ["nums = [2, 7, 11, 15]", "target = 9", "→ [0, 1]"],
  },
  {
    file: "TwoSum.java",
    files: ["TwoSum.java", "utils/", "README.md", "tests/"],
    lang: "Java",
    keywords: ["public", "int", "for", "if", "return", "new"],
    lines: [
      "public int[] twoSum(int[] nums, int target) {",
      "    // map each value seen so far to its index",
      "    Map<Integer, Integer> seen = new HashMap<>();",
      "    for (int i = 0; i < nums.length; i++) {",
      "        int need = target - nums[i];",
      "        if (seen.containsKey(need))",
      "            return new int[]{seen.get(need), i};",
      "        seen.put(nums[i], i);",
      "    }",
      "    return new int[]{};",
      "}",
    ],
    output: ["nums = [2, 7, 11, 15]", "target = 9", "→ [0, 1]"],
  },
  {
    file: "two_sum.cpp",
    files: ["two_sum.cpp", "utils.h", "README.md", "tests/"],
    lang: "C++",
    keywords: ["vector", "int", "for", "if", "return"],
    lines: [
      "vector<int> twoSum(vector<int>& nums, int target) {",
      "    // map each value seen so far to its index",
      "    unordered_map<int, int> seen;",
      "    for (int i = 0; i < nums.size(); i++) {",
      "        int need = target - nums[i];",
      "        if (seen.count(need)) return {seen[need], i};",
      "        seen[nums[i]] = i;",
      "    }",
      "    return {};",
      "}",
    ],
    output: ["nums = [2, 7, 11, 15]", "target = 9", "→ [0, 1]"],
  },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(text: string, keywords: string[]): string {
  const kw = keywords.join("|");
  const tokenPattern = new RegExp(
    `(#.*$|//.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(\\d+)\\b|\\b(${kw})\\b|([[\\]{}(),:;<>&])`,
    "gm"
  );
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenPattern.exec(text))) {
    out += escapeHtml(text.slice(last, m.index));
    if (m[1]) out += `<span class="text-[#6c6b83] italic">${escapeHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="text-[#c3e88d]">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="text-[#f78c6c]">${escapeHtml(m[3])}</span>`;
    else if (m[4]) out += `<span class="text-[#c792ea]">${escapeHtml(m[4])}</span>`;
    else if (m[5]) out += `<span class="text-[#89ddff]">${escapeHtml(m[5])}</span>`;
    last = tokenPattern.lastIndex;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

export default function CodeEditorDemo() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"ready" | "running" | "pass">("ready");
  const [manualRunFlash, setManualRunFlash] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    function fullCodeFor(snippet: Snippet): string {
      return snippet.lines.join("\n");
    }

    function settlePassed(snippet: Snippet, index: number) {
      if (cancelled) return;
      setCode(fullCodeFor(snippet));
      setStatus("pass");
      if (!reducedMotion) {
        timeoutRef.current = setTimeout(() => eraseTick(snippet, index, fullCodeFor(snippet).length), 2400);
      }
    }

    function eraseTick(snippet: Snippet, index: number, i: number) {
      if (cancelled) return;
      if (i <= 0) {
        const next = (index + 1) % SNIPPETS.length;
        timeoutRef.current = setTimeout(() => {
          setSnippetIndex(next);
          runSnippet(SNIPPETS[next], next);
        }, 260);
        return;
      }
      setCode(fullCodeFor(snippet).slice(0, i - 1));
      timeoutRef.current = setTimeout(() => eraseTick(snippet, index, i - 1), 5);
    }

    function runSnippet(snippet: Snippet, index: number) {
      if (cancelled) return;
      setStatus("ready");
      const full = fullCodeFor(snippet);

      if (reducedMotion) {
        setCode(full);
        setStatus("pass");
        return;
      }

      let i = 0;
      function typeTick() {
        if (cancelled) return;
        if (i > full.length) {
          setStatus("running");
          timeoutRef.current = setTimeout(() => settlePassed(snippet, index), 950);
          return;
        }
        setCode(full.slice(0, i));
        const ch = full[i - 1];
        const delay = ch === "\n" ? 140 : 9 + Math.random() * 22;
        i++;
        timeoutRef.current = setTimeout(typeTick, delay);
      }
      typeTick();
    }

    timeoutRef.current = setTimeout(() => runSnippet(SNIPPETS[0], 0), 700);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  function handleRunClick() {
    if (manualRunFlash) return;
    setManualRunFlash(true);
    flashTimeoutRef.current = setTimeout(() => setManualRunFlash(false), 650);
  }

  const snippet = SNIPPETS[snippetIndex];
  const fullLength = snippet.lines.join("\n").length;
  const percent = manualRunFlash ? 100 : Math.min(100, Math.round((code.length / fullLength) * 100));
  const lineCount = Math.max(1, code.split("\n").length);
  const statusText = manualRunFlash
    ? `Running ${snippet.lang}...`
    : status === "running"
      ? "Running · nums=[2,7,11,15], target=9"
      : status === "pass"
        ? "✓ All test cases passed (3/3)"
        : "Ready";

  return (
    <BrowserChrome url={snippet.file} dark>
      <div className="flex items-center gap-2 border-b border-[#26263a] bg-[#1a1a26] px-3.5 py-2">
        <span className="ml-auto rounded-full bg-[#22222f] px-2.5 py-1 font-mono text-[10.5px] text-[#7f7e96]">
          {snippet.lang}
        </span>
      </div>
      <div className="flex min-h-67">
        <div className="hidden w-19 shrink-0 border-r border-[#22222f] px-2 py-3.5 font-mono text-[10px] text-[#6c6b83] lg:block">
          {snippet.files.map((f, i) => (
            <div
              key={f}
              className={
                i === 0
                  ? "truncate rounded-md bg-[#22222f] px-2 py-1.5 font-semibold text-[#d8d7e8]"
                  : "truncate px-2 py-1.5"
              }
            >
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-1 py-4 pl-4">
          <div className="w-8.5 shrink-0 select-none pr-3 text-right font-mono text-[12.5px] leading-[21px] text-[#4d4c63]">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre
            className="m-0 flex-1 whitespace-pre-wrap pr-4 font-mono text-[12.5px] leading-[21px] text-[#d8d7e8]"
            dangerouslySetInnerHTML={{
              __html:
                highlight(code, snippet.keywords) +
                '<span class="inline-block h-[15px] w-[7px] translate-y-[3px] animate-pulse bg-[#8b7fff]"></span>',
            }}
          />
        </div>

        <div className="hidden w-31 shrink-0 flex-col border-l border-[#22222f] p-3 lg:flex">
          <p className="font-brand text-[10px] font-bold tracking-[0.04em] text-[#d8d7e8] uppercase">
            Output
          </p>
          <div className="mt-2 flex-1 font-mono text-[9.5px] leading-[1.7] text-[#9695ab]">
            {status === "pass" ? snippet.output.map((line) => <div key={line}>{line}</div>) : null}
          </div>
          <button
            type="button"
            onClick={handleRunClick}
            disabled={manualRunFlash}
            className="mt-2 rounded-md bg-indigo-600 px-2.5 py-1.5 font-brand text-[10.5px] font-bold text-white transition hover:bg-accent-hover disabled:opacity-70"
          >
            {manualRunFlash ? "⟳ Running..." : "▶ Run"}
          </button>
        </div>
      </div>
      <div
        className={
          status === "pass" && !manualRunFlash
            ? "flex items-center gap-1.5 border-t border-[#26263a] px-4 py-2.5 font-mono text-[11.5px] text-[#5ce6a6]"
            : "flex items-center gap-1.5 border-t border-[#26263a] px-4 py-2.5 font-mono text-[11.5px] text-[#9695ab]"
        }
      >
        <span
          className={
            status === "pass" && !manualRunFlash
              ? "h-1.5 w-1.5 rounded-full bg-[#5ce6a6]"
              : status === "running" || manualRunFlash
                ? "h-1.5 w-1.5 animate-live-pulse rounded-full bg-[#f7b955]"
                : "h-1.5 w-1.5 rounded-full bg-[#4d4c63]"
          }
        />
        <span className="flex-1">{statusText}</span>
        <span className="font-bold text-[#5ce6a6]">{percent}%</span>
      </div>
    </BrowserChrome>
  );
}
