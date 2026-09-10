"use client";

import { useEffect, useRef, useState } from "react";

const SAMPLE_PILLARS = [
  { label: "Fundamentals", value: 78 },
  { label: "Aptitude & communication", value: 64 },
  { label: "Industry skills", value: 52 },
];

const CIRCUMFERENCE = 2 * Math.PI * 42;
const SCORE = 71;

export default function ReadinessRing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        barsRef.current?.querySelectorAll<HTMLElement>("[data-bar]").forEach((bar, i) => {
          bar.style.animationDelay = `${i * 0.12 + 0.1}s`;
          bar.classList.add("animate-grow-bar-x");
        });
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const drawnOffset = CIRCUMFERENCE - (SCORE / 100) * CIRCUMFERENCE;

  return (
    <div
      ref={rootRef}
      className="flex h-70 flex-col items-center justify-center gap-6 rounded-xl border border-[#23243D] px-8"
      style={{ backgroundColor: "#16172B" }}
    >
      <svg width="88" height="88" viewBox="0 0 96 96" className="shrink-0">
        <circle cx="48" cy="48" r="42" fill="none" stroke="#23243D" strokeWidth="9" />
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke="#6C63FF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={visible ? drawnOffset : CIRCUMFERENCE}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="48"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-brand text-[22px] font-extrabold"
        >
          {SCORE}
        </text>
      </svg>

      <div ref={barsRef} className="w-full max-w-70 space-y-2.5">
        {SAMPLE_PILLARS.map((pillar) => (
          <div key={pillar.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-[11px] text-[#A9A9BE]">{pillar.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#23243D]">
              <div
                data-bar
                className="h-full origin-left scale-x-0 rounded-full bg-[#6C63FF]"
                style={{ width: `${pillar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
