"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type OptionView = { id: string; label: string; text: string };
type QuestionView = {
  id: string;
  order: number;
  text: string;
  marks: number;
  options: OptionView[];
};
type SectionView = {
  id: string;
  order: number;
  name: string;
  durationMinutes: number;
  questions: QuestionView[];
};
type ResponseView = {
  questionId: string;
  selectedOptionId: string | null;
  flagged: boolean;
  seen: boolean;
};
type SectionAttemptView = {
  sectionId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
};

export default function QuizAttemptClient({
  attemptId,
  quizTitle,
  proctored,
  isPaper,
  sections,
  initialSectionAttempts,
  initialResponses,
  initialViolationCount,
  resultsHref,
}: {
  attemptId: string;
  quizTitle: string;
  proctored: boolean;
  isPaper: boolean;
  sections: SectionView[];
  initialSectionAttempts: SectionAttemptView[];
  initialResponses: ResponseView[];
  initialViolationCount: number;
  resultsHref: string;
}) {
  const router = useRouter();

  const [sectionAttempts, setSectionAttempts] = useState(initialSectionAttempts);
  const [responses, setResponses] = useState<Record<string, ResponseView>>(
    Object.fromEntries(initialResponses.map((r) => [r.questionId, r]))
  );
  const [violationCount, setViolationCount] = useState(initialViolationCount);
  const [ended, setEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const activeSectionAttempt = sectionAttempts.find((sa) => !sa.submittedAt);
  const activeSection =
    sections.find((s) => s.id === activeSectionAttempt?.sectionId) ?? sections[0];
  const question = activeSection?.questions[questionIndex];

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const deadline = activeSectionAttempt
    ? new Date(activeSectionAttempt.startedAt).getTime() +
      activeSection.durationMinutes * 60_000
    : 0;
  const remainingMs = Math.max(0, deadline - now);
  const remainingLabel = formatCountdown(remainingMs);

  const submitSectionRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!activeSectionAttempt || submitting || ended) return;
    if (remainingMs === 0) {
      submitSectionRef.current();
    }
  }, [remainingMs, activeSectionAttempt, submitting, ended]);

  // Camera preview + recording — proves the camera is on and records an audit
  // trail for a future mentor review. Lifecycle is independent of `ended` so
  // the last seconds before a violation-triggered end are still captured;
  // finalizeRecording() (below) is what actually tears the stream down.
  useEffect(() => {
    if (!proctored || !isPaper) return;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        try {
          const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp8",
            videoBitsPerSecond: 250_000,
          });
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        } catch {
          // MediaRecorder unsupported — camera preview still works, no recording.
        }
      })
      .catch(() => setCameraError("Camera preview unavailable"));
    return () => {
      cancelled = true;
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [proctored, isPaper]);

  const finalizeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      return;
    }
    recorder.onstop = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const chunks = recordedChunksRef.current;
      if (chunks.length === 0) return;
      const blob = new Blob(chunks, { type: "video/webm" });
      fetch(`/api/attempts/${attemptId}/recording/start`, { method: "POST" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { uploadUrl: string; key: string } | null) => {
          if (!data) return null;
          return fetch(data.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "video/webm" },
            body: blob,
          }).then((putRes) =>
            putRes.ok
              ? fetch(`/api/attempts/${attemptId}/recording/complete`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ key: data.key }),
                })
              : null
          );
        })
        .catch(() => {});
    };
    recorder.stop();
  }, [attemptId]);

  // Real tab-focus enforcement — leaving the tab twice ends the attempt.
  useEffect(() => {
    if (!proctored || ended) return;
    function handleVisibilityChange() {
      if (document.hidden) {
        fetch(`/api/attempts/${attemptId}/violation`, { method: "POST" })
          .then((res) => res.json())
          .then((data: { ended: boolean; violationCount: number }) => {
            setViolationCount(data.violationCount);
            if (data.ended) {
              finalizeRecording();
              setEnded(true);
              setTimeout(() => {
                router.push(resultsHref);
                router.refresh();
              }, 2500);
            }
          })
          .catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [proctored, ended, attemptId, resultsHref, router, finalizeRecording]);

  // Mark the current question seen (fire-and-forget, no re-render needed).
  const seenPinged = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!question || seenPinged.current.has(question.id)) return;
    seenPinged.current.add(question.id);
    fetch(`/api/attempts/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id }),
    }).catch(() => {});
  }, [question, attemptId]);

  function selectOption(questionId: string, optionId: string) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: optionId,
        flagged: prev[questionId]?.flagged ?? false,
        seen: true,
      },
    }));
    fetch(`/api/attempts/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedOptionId: optionId }),
    }).catch(() => {});
  }

  function toggleFlag(questionId: string) {
    const next = !responses[questionId]?.flagged;
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: prev[questionId]?.selectedOptionId ?? null,
        flagged: next,
        seen: true,
      },
    }));
    fetch(`/api/attempts/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, flagged: next }),
    }).catch(() => {});
  }

  async function submitSection() {
    if (!activeSection || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/attempts/${attemptId}/sections/${activeSection.id}/submit`,
        { method: "POST" }
      );
      const data = (await res.json()) as {
        nextSectionId: string | null;
        nextSectionStartedAt: string | null;
        attemptSubmitted: boolean;
      };
      if (data.attemptSubmitted) {
        finalizeRecording();
        router.push(resultsHref);
        router.refresh();
        return;
      }
      setSectionAttempts((prev) => [
        ...prev.map((sa) =>
          sa.sectionId === activeSection.id
            ? { ...sa, submittedAt: new Date().toISOString() }
            : sa
        ),
        {
          sectionId: data.nextSectionId as string,
          startedAt: data.nextSectionStartedAt as string,
          submittedAt: null,
          score: null,
        },
      ]);
      setQuestionIndex(0);
    } finally {
      setSubmitting(false);
    }
  }
  useEffect(() => {
    submitSectionRef.current = submitSection;
  });

  const answeredCount = useMemo(
    () =>
      activeSection
        ? activeSection.questions.filter((q) => responses[q.id]?.selectedOptionId)
            .length
        : 0,
    [activeSection, responses]
  );

  if (ended) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="rounded-xl border border-[#F9C7DE] bg-[#FFF5F9] p-8 text-center">
          <p className="font-brand text-lg font-bold text-[#DB2777]">
            Attempt ended
          </p>
          <p className="mt-1 text-sm text-[#55556B]">
            You left the tab twice, which ends a proctored attempt. Redirecting
            to your results…
          </p>
        </div>
      </div>
    );
  }

  if (!activeSection || !question) {
    return null;
  }

  const isLastSection =
    sections[sections.length - 1]?.id === activeSection.id;

  return (
    <div className={isPaper ? "min-h-screen bg-[#0F1020]" : "min-h-screen bg-[#FBFBFD]"}>
      {/* Topbar */}
      <div
        className={
          isPaper
            ? "flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-3.5"
            : "flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDF3] bg-surface px-4 py-3 sm:px-6 sm:py-3.5"
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              isPaper
                ? "text-sm font-semibold text-white"
                : "text-sm font-semibold text-[#0F1020]"
            }
          >
            {quizTitle}
          </span>
          <span className={isPaper ? "text-xs text-white/50" : "text-xs text-[#9A9AAE]"}>
            Question {questionIndex + 1} of {activeSection.questions.length}
          </span>
          {isPaper ? (
            <span
              className={
                proctored
                  ? "flex items-center gap-1.5 rounded-full bg-[#0F2E22] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#34D399]"
                  : "flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-white/60"
              }
            >
              <span
                className={
                  proctored
                    ? "h-1.5 w-1.5 rounded-full bg-[#34D399]"
                    : "h-1.5 w-1.5 rounded-full bg-white/40"
                }
              />
              {proctored ? "PROCTORED — COUNTS AS VERIFIED" : "PRACTICE — NOT VERIFIED"}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={
              isPaper
                ? "rounded-full bg-[#3D2A0F] px-3 py-1 font-mono text-[13px] font-semibold text-[#F5A524]"
                : "rounded-full bg-[#FBECD9] px-3 py-1 font-mono text-[13px] font-semibold text-[#B45309]"
            }
          >
            {remainingLabel} left{isPaper ? " in section" : ""}
          </span>
          {!isPaper ? (
            <button
              type="button"
              onClick={submitSection}
              disabled={submitting}
              className="rounded-lg border border-[#DDDDE7] bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-[#0F1020] hover:bg-[#FBFBFD] disabled:opacity-50"
            >
              Submit quiz
            </button>
          ) : null}
        </div>
      </div>

      {!isPaper ? (
        <div className="h-1 bg-[#EDEDF3]">
          <div
            className="h-full bg-indigo-600"
            style={{
              width: `${((questionIndex + 1) / activeSection.questions.length) * 100}%`,
            }}
          />
        </div>
      ) : (
        <div className="flex border-b border-white/10">
          {sections.map((section) => {
            const sa = sectionAttempts.find((s) => s.sectionId === section.id);
            const isCurrent = section.id === activeSection.id;
            const isSubmitted = Boolean(sa?.submittedAt);
            return (
              <div
                key={section.id}
                className={
                  isCurrent
                    ? "flex-1 border-b-2 border-indigo-500 bg-surface px-4 py-2.5 text-center"
                    : "flex-1 px-4 py-2.5 text-center"
                }
              >
                <p
                  className={
                    isCurrent ? "text-sm font-semibold text-[#0F1020]" : "text-sm text-white/60"
                  }
                >
                  {section.name}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase text-white/40">
                  {isSubmitted
                    ? `Submitted · ${sa?.score}%`
                    : isCurrent
                      ? `In progress · ${answeredCount}/${activeSection.questions.length}`
                      : `Locked · ${section.durationMinutes} min`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        {/* Question area */}
        <div className="max-w-[760px] flex-1">
          <div className={isPaper ? "rounded-xl bg-[#151633] p-6" : ""}>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={
                  isPaper
                    ? "rounded-full bg-white/10 px-2.5 py-0.5 font-mono uppercase text-white/60"
                    : "rounded-full bg-[#F1F0FE] px-2.5 py-0.5 font-mono uppercase text-indigo-600"
                }
              >
                {activeSection.name}
              </span>
              <span className={isPaper ? "text-white/40" : "text-[#9A9AAE]"}>
                {question.marks} mark{question.marks === 1 ? "" : "s"} · single answer
              </span>
            </div>

            <h2
              className={
                isPaper
                  ? "mt-3 font-brand text-[22px] font-semibold text-white"
                  : "mt-3 font-brand text-[22px] font-semibold text-[#0F1020]"
              }
            >
              {question.text}
            </h2>

            <div className="mt-5 space-y-2.5">
              {question.options.map((option) => {
                const selected = responses[question.id]?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(question.id, option.id)}
                    className={
                      selected
                        ? isPaper
                          ? "flex w-full items-center gap-3 rounded-lg border-[1.5px] border-indigo-400 bg-indigo-500/10 px-4 py-3 text-left"
                          : "flex w-full items-center gap-3 rounded-lg border-[1.5px] border-indigo-600 bg-[#F6F5FF] px-4 py-3 text-left"
                        : isPaper
                          ? "flex w-full items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left hover:bg-white/5"
                          : "flex w-full items-center gap-3 rounded-lg border border-[#E6E6EF] px-4 py-3 text-left hover:bg-[#FBFBFD]"
                    }
                  >
                    <span
                      className={
                        selected
                          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
                          : isPaper
                            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-white/60"
                            : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#DDDDE7] text-xs text-[#8A8AA0]"
                      }
                    >
                      {option.label}
                    </span>
                    <span className={isPaper ? "text-sm text-white" : "text-sm text-[#0F1020]"}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                disabled={questionIndex === 0}
                className={
                  isPaper
                    ? "rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 disabled:opacity-30"
                    : "rounded-lg border border-[#DDDDE7] px-4 py-2 text-sm font-medium text-[#0F1020] disabled:opacity-30"
                }
              >
                Previous
              </button>
              {questionIndex < activeSection.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setQuestionIndex((i) => i + 1)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA]"
                >
                  Next question
                </button>
              ) : isPaper ? (
                <button
                  type="button"
                  onClick={submitSection}
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
                >
                  {isLastSection ? "Submit paper" : "Submit section"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => toggleFlag(question.id)}
                className={
                  responses[question.id]?.flagged
                    ? "text-sm font-medium text-[#B45309]"
                    : "text-sm font-medium text-[#B45309]/70 hover:text-[#B45309]"
                }
              >
                {responses[question.id]?.flagged ? "Flagged for review" : "Flag for review"}
              </button>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="w-full space-y-4 lg:w-70 lg:shrink-0">
          {isPaper && proctored ? (
            <div className="rounded-xl bg-[#151633] p-3">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-black">
                {cameraError ? (
                  <p className="p-3 text-center text-[11px] text-white/50">{cameraError}</p>
                ) : (
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                Camera preview — proctoring uses tab-focus tracking
              </p>
            </div>
          ) : isPaper ? (
            <div className="rounded-xl bg-[#151633] p-3 text-[11px] text-white/50">
              Practice mode — no camera, no tab-focus rule. This attempt will
              not count as verified.
            </div>
          ) : null}

          {isPaper ? (
            <div className="rounded-xl bg-[#151633] p-4">
              <p className="font-mono text-[10px] uppercase text-white/40">Section timing</p>
              <div className="mt-2 space-y-1.5">
                {sections.map((section) => {
                  const sa = sectionAttempts.find((s) => s.sectionId === section.id);
                  return (
                    <div key={section.id} className="flex items-center justify-between text-xs">
                      <span className={section.id === activeSection.id ? "font-semibold text-white" : "text-white/60"}>
                        {section.name}
                      </span>
                      <span className="text-white/40">
                        {sa?.submittedAt
                          ? "closed"
                          : section.id === activeSection.id
                            ? remainingLabel
                            : `${section.durationMinutes}:00`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 rounded-lg bg-[#3D2A0F] px-2.5 py-2 text-[11px] text-[#F5A524]">
                Sections are locked once their clock runs out. You cannot go
                back — the same rule as the real paper.
              </p>
              {proctored ? (
                <p className="mt-2 text-[11px] text-white/40">
                  Leaving the tab twice ends the attempt
                  {violationCount > 0 ? ` (${violationCount}/2 so far)` : ""}.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className={isPaper ? "rounded-xl bg-[#151633] p-4" : "rounded-xl border border-[#E6E6EF] bg-surface p-4"}>
            <p className={isPaper ? "font-mono text-[10px] uppercase text-white/40" : "font-mono text-[10px] uppercase text-[#9A9AAE]"}>
              Question map
            </p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {activeSection.questions.map((q, i) => {
                const r = responses[q.id];
                const isCurrent = i === questionIndex;
                let cls =
                  "flex h-8 items-center justify-center rounded-md text-xs font-medium";
                if (isCurrent) {
                  cls += isPaper
                    ? " border border-indigo-400 text-white"
                    : " border border-indigo-600 text-indigo-600";
                } else if (r?.flagged) {
                  cls += " border border-[#F5A524] text-[#F5A524]";
                } else if (r?.selectedOptionId) {
                  cls += " bg-indigo-600 text-white";
                } else {
                  cls += isPaper
                    ? " border border-white/15 text-white/40"
                    : " border border-[#E6E6EF] text-[#9A9AAE]";
                }
                return (
                  <button key={q.id} type="button" onClick={() => setQuestionIndex(i)} className={cls}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <p className={isPaper ? "mt-3 text-[11px] text-white/40" : "mt-3 text-[11px] text-[#9A9AAE]"}>
              Your answers save as you go.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
