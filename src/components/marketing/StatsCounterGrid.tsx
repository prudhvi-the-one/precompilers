"use client";

import { useEffect, useRef } from "react";
import { HelpCircle, Code2, Target, Briefcase, PlayCircle, Video, type LucideIcon } from "lucide-react";

type Stat = { icon: LucideIcon; target: number; label: string };

const STATS: Stat[] = [
  { icon: HelpCircle, target: 10000, label: "Quiz questions" },
  { icon: Code2, target: 10000, label: "Coding questions" },
  { icon: Target, target: 10000, label: "Aptitude questions" },
  { icon: Briefcase, target: 3000, label: "Company interview questions" },
  { icon: PlayCircle, target: 1000, label: "Simulators" },
  { icon: Video, target: 500, label: "Video lectures" },
];

export default function StatsCounterGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animateCount(el: HTMLElement, target: number) {
      if (reducedMotion) {
        el.textContent = target.toLocaleString("en-IN") + "+";
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now: number) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString("en-IN") + (progress >= 1 ? "+" : "");
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const items = container.querySelectorAll<HTMLElement>("[data-stat-target]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target.querySelector<HTMLElement>("[data-stat-num]");
            const target = parseInt(entry.target.getAttribute("data-stat-target") ?? "0", 10);
            if (el) animateCount(el, target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="grid h-full grid-cols-2 auto-rows-fr gap-3.5">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          data-stat-target={stat.target}
          className="flex flex-col justify-center rounded-[14px] border border-line bg-surface p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent"
        >
          <span className="mb-3 flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-accent-soft text-indigo-600">
            <stat.icon className="h-3.75 w-3.75" strokeWidth={2} />
          </span>
          <div data-stat-num className="font-mono text-[28px] font-bold text-ink">
            0
          </div>
          <div className="mt-0.5 text-[12.5px] text-ink-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
