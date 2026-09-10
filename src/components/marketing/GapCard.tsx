import { Check, X } from "lucide-react";
import BrowserChrome from "@/components/marketing/BrowserChrome";

const ROWS: [string, string][] = [
  ["C, Java syntax", "SQL you can write live"],
  ["DBMS theory", "AWS or Azure"],
  ["OS & CN theory", "React or Angular"],
  ["A final-year project", "A project you shipped"],
  ["Aptitude rounds", "Talking through your code"],
];

export default function GapCard() {
  return (
    <BrowserChrome url="/the-gap">
      <div className="flex flex-1 flex-col p-5">
        <p className="font-brand text-[13.5px] font-bold text-ink">The gap, in one view</p>

        <div className="mt-1">
          {ROWS.map(([left, right], i) => (
            <div key={left} className={i === 0 ? "py-2.5" : "border-t border-line-soft py-2.5"}>
              <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                <X className="h-2.75 w-2.75 shrink-0 text-warn" strokeWidth={2} />
                {left}
              </p>
              <p className="mt-0.5 ml-[1px] text-[11px] text-ink-faintest">↓</p>
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                <Check className="h-3 w-3 shrink-0 text-success" strokeWidth={2} />
                {right}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-auto pt-3.5 text-xs text-ink-faint italic">Nobody teaches the right column.</p>
      </div>
    </BrowserChrome>
  );
}
