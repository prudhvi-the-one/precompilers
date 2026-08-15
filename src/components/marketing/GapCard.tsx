import { Check, X } from "lucide-react";

const ROWS: [string, string][] = [
  ["C, Java syntax", "SQL you can write live"],
  ["DBMS theory", "AWS or Azure"],
  ["OS & CN theory", "React or Angular"],
  ["A final-year project", "A project you shipped"],
  ["Aptitude rounds", "Talking through your code"],
];

export default function GapCard() {
  return (
    <div className="rounded-[14px] bg-surface px-7 py-6.5 shadow-[0_8px_28px_rgba(15,16,32,0.06)]">
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        The gap, in one view
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-6">
        <p className="font-brand text-sm font-bold text-ink-muted">
          College teaches
        </p>
        <p className="font-brand text-sm font-bold text-indigo-600">
          Recruiters ask for
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {ROWS.map(([left, right]) => (
          <div key={left} className="grid grid-cols-2 gap-x-6">
            <p className="flex items-center gap-1.5 text-[13.5px] text-ink-faint">
              <X className="h-3.5 w-3.5 shrink-0 text-ink-faintest" strokeWidth={2} />
              {left}
            </p>
            <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2} />
              {right}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-line-soft pt-4 text-[13.5px] text-ink-secondary">
        Nobody teaches the right column. That is the whole product.
      </p>
    </div>
  );
}
