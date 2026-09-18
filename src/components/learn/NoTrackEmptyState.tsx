import Image from "next/image";
import AngularBorder from "@/components/ui/AngularBorder";

export default function NoTrackEmptyState({ description }: { description: string }) {
  return (
    <AngularBorder color="var(--line)" className="bg-surface">
      <div className="flex flex-col items-center p-7 text-center">
        <Image
          src="/illustrations/getting-started.png"
          alt=""
          width={200}
          height={167}
          className="mb-3"
        />
        <p className="text-sm font-semibold text-ink">You haven&apos;t started a track yet</p>
        <p className="mt-1 max-w-xs text-xs text-ink-faint">{description}</p>
        <a
          href="/onboarding"
          className="clip-btn mt-3.5 bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
        >
          Set your track
        </a>
      </div>
    </AngularBorder>
  );
}
