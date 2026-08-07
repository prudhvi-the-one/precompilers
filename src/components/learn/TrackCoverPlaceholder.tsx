export default function TrackCoverPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-30 items-center justify-center rounded-lg border border-[#E6E6EF]"
      style={{
        backgroundColor: "#FAFAFC",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(15,16,32,0.05) 0px, rgba(15,16,32,0.05) 1px, transparent 1px, transparent 10px)",
      }}
    >
      <span className="font-mono text-[10px] tracking-[0.05em] text-[#9A9AAE] uppercase">
        Track cover — {label}
      </span>
    </div>
  );
}
