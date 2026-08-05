import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

const PILLARS = [
  "Fundamentals",
  "Aptitude & communication",
  "Problem solving",
  "Industry skills",
  "Projects",
  "Interview performance",
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profileComplete = Boolean(
    user.college && user.branch && user.gradYear
  );

  return (
    <div className="max-w-3xl space-y-4.5">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          {user.gradYear
            ? `Class of ${user.gradYear}`
            : "Let's get your profile set up first."}
        </p>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">
          What to do next
        </h2>
        {profileComplete ? (
          <p className="mt-2 text-sm text-[#55556B]">
            Your profile is complete. Learn, Practice, Prove and Career are
            being built next — this is where they&apos;ll show up.
          </p>
        ) : (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#DDD9FB] bg-[#FBFAFF] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-[#0F1020]">
                Complete your profile
              </div>
              <div className="text-xs text-[#8A8AA0]">
                College, branch and graduation year help us personalize
                what&apos;s coming.
              </div>
            </div>
            <a
              href="/profile"
              className="shrink-0 rounded-md border border-[#DDD9FB] px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-white"
            >
              Go to profile
            </a>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">
          Readiness by pillar
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar}>
              <div className="text-xs text-[#55556B]">{pillar}</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[#EDEDF3]" />
              <div className="mt-1 text-xs text-[#9A9AAE]">Not assessed</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
