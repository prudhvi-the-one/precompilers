// Small, dedicated stroke icons for the topic Learn page — kept as plain
// named components (not lucide-react) so each one can carry real subject
// meaning (array cells, a shift, two pointers) instead of a generic glyph.

type IconProps = { className?: string };

export function ArrayCellsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="7" width="4.5" height="10" rx="1" />
      <rect x="7.5" y="7" width="4.5" height="10" rx="1" />
      <rect x="13.5" y="7" width="4.5" height="10" rx="1" fill="currentColor" fillOpacity={0.35} />
      <rect x="19.5" y="7" width="3" height="10" rx="1" />
    </svg>
  );
}

export function AnalogyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

export function ProductionIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function ConceptsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5a4 4 0 0 0-4 4c0 .7.15 1.3.4 1.9A4 4 0 0 0 4 12c0 1.4.7 2.6 1.8 3.4-.1.3-.1.7-.1 1.1a4 4 0 0 0 8 0" />
      <path d="M14.5 2.5a4 4 0 0 1 4 4c0 .7-.15 1.3-.4 1.9A4 4 0 0 1 20 12c0 1.4-.7 2.6-1.8 3.4.1.3.1.7.1 1.1a4 4 0 0 1-8 0V6.5" />
    </svg>
  );
}

export function CurriculumIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 4v5" />
    </svg>
  );
}

export function MemoryBarsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="4" height="16" />
      <rect x="10" y="4" width="4" height="16" />
      <rect x="16" y="4" width="4" height="16" />
    </svg>
  );
}

export function LightningIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 L4 14 L11 14 L11 22 L20 10 L13 10 Z" />
    </svg>
  );
}

export function ShiftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8 L3 12 L7 16" />
      <path d="M17 8 L21 12 L17 16" />
      <path d="M3 12 L21 12" />
    </svg>
  );
}

export function TwoPointerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 L9 12" />
      <path d="M7 9 L3 12 L7 15" />
      <path d="M21 12 L15 12" />
      <path d="M17 9 L21 12 L17 15" />
    </svg>
  );
}

export function LaunchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L12 14" />
      <path d="M8 6 L12 2 L16 6" />
      <path d="M5 12 C5 17 8 21 12 21 C16 21 19 17 19 12" />
    </svg>
  );
}
