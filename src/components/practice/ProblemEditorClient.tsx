"use client";

import { useState } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import type { Comment, Problem, TestCase, User } from "@prisma/client";

type ProblemWithRelations = Problem & {
  testCases: TestCase[];
  comments: (Comment & { user: Pick<User, "name" | "email"> })[];
};

type CaseResult = {
  input: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
  passed: boolean;
  isSample: boolean;
};

type Example = { input: string; output: string; explanation?: string };

const LANGUAGES = [
  { key: "PYTHON3", label: "Python 3" },
  { key: "JAVASCRIPT", label: "JavaScript" },
  { key: "JAVA", label: "Java" },
  { key: "CPP", label: "C++" },
  { key: "C", label: "C" },
];

const STARTER_CODE: Record<string, string> = {
  PYTHON3: "# Read input from stdin, print your answer to stdout\n",
  JAVASCRIPT:
    "const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\\n');\n\n",
  JAVA:
    "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n\n  }\n}\n",
  CPP: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n  return 0;\n}\n",
  C: "#include <stdio.h>\n\nint main() {\n\n  return 0;\n}\n",
};

const MONACO_LANGUAGE: Record<string, string> = {
  PYTHON3: "python",
  JAVASCRIPT: "javascript",
  JAVA: "java",
  CPP: "cpp",
  C: "c",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-[#E7F7F0] text-[#059669]",
  MEDIUM: "bg-[#FEF6E7] text-[#B45309]",
  HARD: "bg-[#FDEBEC] text-[#DC2626]",
};

const TABS = ["Problem", "Hints", "Solutions", "Discussion"] as const;

export default function ProblemEditorClient({
  problem,
  locked,
}: {
  problem: ProblemWithRelations;
  locked: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Problem");
  const [language, setLanguage] = useState("PYTHON3");
  const [code, setCode] = useState(STARTER_CODE.PYTHON3);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [results, setResults] = useState<CaseResult[] | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState(problem.comments);
  const [commentDraft, setCommentDraft] = useState("");

  const examples = (Array.isArray(problem.examples) ? problem.examples : []) as Example[];

  function changeLanguage(next: string) {
    setLanguage(next);
    setCode(STARTER_CODE[next] ?? "");
  }

  async function handleRun() {
    setBusy("run");
    setError(null);
    setVerdict(null);
    try {
      const res = await fetch(`/api/problems/${problem.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, sourceCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResults(data.results);
    } finally {
      setBusy(null);
    }
  }

  async function handleSubmit() {
    setBusy("submit");
    setError(null);
    try {
      const res = await fetch(`/api/problems/${problem.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, sourceCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResults(data.results);
      setVerdict(data.submission.verdict);
    } finally {
      setBusy(null);
    }
  }

  async function handlePostComment() {
    if (!commentDraft.trim()) return;
    const res = await fetch(`/api/problems/${problem.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentDraft }),
    });
    const data = await res.json();
    if (res.ok) {
      setComments([data.comment, ...comments]);
      setCommentDraft("");
    }
  }

  if (locked) {
    return (
      <div className="max-w-md rounded-xl border border-[#E6E6EF] bg-white p-6 text-center">
        <p className="text-sm text-[#55556B]">
          🔒 This problem needs a plan upgrade.
        </p>
        <Link href="/practice/problems" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">
          Back to problems
        </Link>
      </div>
    );
  }

  const passedCount = results?.filter((r) => r.passed).length ?? 0;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[14px] border border-[#E6E6EF] bg-white shadow-sm">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[#EDEDF3] px-5.5">
        <Link href="/practice/problems" className="text-sm text-[#8A8AA0] hover:text-[#0F1020]">
          ← Practice / {problem.category}
        </Link>
        <span className="font-brand text-[15px] font-semibold text-[#0F1020]">
          {problem.title}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase ${DIFFICULTY_STYLE[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {problem.companies.length ? (
            <span className="text-xs text-[#9A9AAE]">
              Asked at {problem.companies.join(", ")}
            </span>
          ) : null}
          <button
            onClick={handleRun}
            disabled={busy !== null}
            className="rounded-lg border border-[#E6E6EF] px-3.5 py-1.5 text-sm font-semibold text-[#43435A] hover:bg-[#FBFBFD] disabled:opacity-50"
          >
            {busy === "run" ? "Running…" : "Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy !== null}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy === "submit" ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane */}
        <div className="flex w-[520px] shrink-0 flex-col border-r border-[#EDEDF3]">
          <div className="flex border-b border-[#EDEDF3] px-5.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-3 py-3 text-sm font-medium ${
                  tab === t
                    ? "border-indigo-600 text-[#0F1020]"
                    : "border-transparent text-[#8A8AA0] hover:text-[#0F1020]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5.5 py-4">
            {tab === "Problem" ? (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap text-sm text-[#2A2A38]">{problem.statement}</p>
                {examples.map((ex, i) => (
                  <div key={i} className="rounded-[10px] border border-[#EDEDF3]">
                    <div className="rounded-t-[10px] bg-[#FAFAFC] px-3.5 py-2 text-xs font-semibold text-[#55556B]">
                      Example {i + 1}
                    </div>
                    <div className="space-y-1 px-3.5 py-2.5 font-mono text-[12.5px] text-[#2A2A38]">
                      <p>Input: {ex.input}</p>
                      <p>Output: {ex.output}</p>
                      {ex.explanation ? (
                        <p className="text-[#8A8AA0]">{`// ${ex.explanation}`}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-semibold text-[#55556B]">Constraints</p>
                  <p className="mt-1 whitespace-pre-wrap font-mono text-[12.5px] text-[#2A2A38]">
                    {problem.constraints}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  <span className="text-xs text-[#8A8AA0]">Part of</span>
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F1F0FE] px-2 py-0.5 text-[11px] font-medium text-indigo-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {tab === "Hints" ? (
              <p className="whitespace-pre-wrap text-sm text-[#2A2A38]">{problem.hints}</p>
            ) : null}

            {tab === "Solutions" ? (
              <p className="whitespace-pre-wrap text-sm text-[#2A2A38]">
                {problem.solutionExplanation}
              </p>
            ) : null}

            {tab === "Discussion" ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Ask something or share an approach…"
                    className="flex-1 rounded-lg border border-[#E6E6EF] px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={handlePostComment}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Post
                  </button>
                </div>
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="border-b border-[#F2F2F7] pb-2.5">
                      <p className="text-xs font-semibold text-[#55556B]">
                        {c.user.name ?? c.user.email}
                      </p>
                      <p className="text-sm text-[#2A2A38]">{c.body}</p>
                    </div>
                  ))}
                  {comments.length === 0 ? (
                    <p className="text-sm text-[#8A8AA0]">No comments yet — be the first.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right pane */}
        <div className="flex flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-3 bg-[#FAFAFC] px-4">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="rounded-md border border-[#E6E6EF] bg-white px-2.5 py-1 text-[13px] font-medium text-[#2A2A38] outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCode(STARTER_CODE[language] ?? "")}
              className="ml-auto text-xs font-medium text-[#8A8AA0] hover:text-[#0F1020]"
            >
              Reset
            </button>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={MONACO_LANGUAGE[language]}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 13.5,
                minimap: { enabled: false },
              }}
            />
          </div>

          <div className="h-[196px] shrink-0 overflow-y-auto border-t border-[#EDEDF3] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-[#0F1020]">Test results</p>
              {results ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    passedCount === results.length
                      ? "bg-[#E7F7F0] text-[#059669]"
                      : "bg-[#FDEBEC] text-[#DC2626]"
                  }`}
                >
                  {passedCount} / {results.length} PASSED
                </span>
              ) : null}
              {verdict === "ACCEPTED" ? (
                <Link
                  href="/prove/review-queue"
                  className="ml-auto text-xs font-medium text-indigo-600 hover:underline"
                >
                  Ask a peer to review this solution
                </Link>
              ) : null}
            </div>

            {error ? <p className="mt-2 text-sm text-[#DC2626]">{error}</p> : null}

            {results ? (
              <div className="mt-2 space-y-1.5">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#EDEDF3] px-3 py-1.5 font-mono text-[12.5px]"
                  >
                    <span className={r.passed ? "text-[#059669]" : "text-[#DC2626]"}>
                      {r.passed ? "✓" : "✗"}
                    </span>{" "}
                    <span className="text-[#8A8AA0]">Case {i + 1}</span>{" "}
                    {r.isSample ? (
                      <span>
                        {r.input} → {r.actualOutput}
                      </span>
                    ) : (
                      <span className="text-[#8A8AA0]">hidden — large input</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
