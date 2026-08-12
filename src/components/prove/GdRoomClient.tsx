"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Participant = { userId: string; displayName: string };

const PHASES = [
  { label: "Prep", minutes: 2 },
  { label: "Open discussion", minutes: 10 },
  { label: "Summary", minutes: 3 },
];
const TOTAL_MINUTES = PHASES.reduce((sum, p) => sum + p.minutes, 0);

function currentPhase(elapsedMinutes: number) {
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    acc += PHASES[i].minutes;
    if (elapsedMinutes < acc) {
      return { index: i, ...PHASES[i], elapsedInPhase: elapsedMinutes - (acc - PHASES[i].minutes) };
    }
  }
  return null;
}

export default function GdRoomClient({
  sessionId,
  topic,
  scheduledAt,
  minParticipants,
  roomUrl,
  displayName,
}: {
  sessionId: string;
  topic: string;
  scheduledAt: string;
  minParticipants: number;
  roomUrl: string;
  displayName: string;
}) {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [now, setNow] = useState(() => new Date(scheduledAt).getTime());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`/api/gd/${sessionId}/join`, { method: "POST" }).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/gd/${sessionId}/roster`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { participants: Participant[] };
      setParticipants(data.participants);
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  const elapsedMinutes = (now - new Date(scheduledAt).getTime()) / 60_000;
  const phase = currentPhase(elapsedMinutes);
  const ended = elapsedMinutes >= TOTAL_MINUTES;
  const seats = Math.max(minParticipants + 1, participants.length);

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1020]">
      <header className="flex items-center justify-between border-b border-[#23243D] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-[#E4E4F0]">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            {ended ? "ENDED" : "IN SESSION"} ·{" "}
            {String(Math.max(0, Math.floor(elapsedMinutes))).padStart(2, "0")}:
            {String(Math.floor((Math.max(0, elapsedMinutes) % 1) * 60)).padStart(2, "0")} /{" "}
            {TOTAL_MINUTES}:00
          </span>
          <p className="font-brand text-sm font-bold text-[#E4E4F0]">&quot;{topic}&quot;</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/prove/group-discussions/${sessionId}/rate`)}
          className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626]"
        >
          Leave
        </button>
      </header>

      <div className="flex flex-1 gap-6 p-6">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: seats }).map((_, i) => {
              const p = participants[i];
              if (!p) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-[#33344F] text-center text-xs text-[#5C5D7A]"
                  >
                    Seat empty
                    <br />
                    Starts with {minParticipants} or more
                  </div>
                );
              }
              return (
                <div
                  key={p.userId}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-[#23243D] bg-[#151633]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
                    {p.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm text-[#E4E4F0]">{p.displayName}</span>
                </div>
              );
            })}
          </div>

          {phase ? (
            <div className="rounded-xl border border-[#23243D] bg-[#151633] p-4">
              <p className="font-mono text-[10px] uppercase text-[#7A7A96]">
                Phase {phase.index + 1} of {PHASES.length}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#E4E4F0]">{phase.label}</p>
              <p className="mt-1 text-xs text-[#7A7A96]">
                2 min prep · 10 min discussion · 3 min summary. Everyone must speak
                before anyone speaks twice.
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-[#23243D]">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (elapsedMinutes / TOTAL_MINUTES) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-[320px] shrink-0 space-y-4">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[#23243D] bg-black">
            <iframe
              src={`${roomUrl}?name=${encodeURIComponent(displayName)}`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full border-0"
            />
          </div>

          <div className="rounded-xl border border-[#23243D] bg-[#151633] p-4 text-xs text-[#7A7A96]">
            Every participant rates every other participant on clarity, content and
            courtesy after the session. Ratings are anonymous; nothing else about
            the discussion is recorded.
          </div>
        </div>
      </div>
    </div>
  );
}
