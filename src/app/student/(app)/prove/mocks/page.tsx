import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MockPoolStatus from "@/components/prove/MockPoolStatus";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default async function MocksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const myRequests = await prisma.mockRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { feedbackGiven: true },
  });
  const active = myRequests.find((r) => !r.pairedWithId || r.feedbackGiven.length === 0);

  const feedbackReceived = await prisma.mockFeedback.findMany({
    where: { rateeId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-[#8A8AA0] hover:text-[#0F1020]">
        ← Prove
      </Link>
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Mock interviews
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Mentor mocks arrive in Phase 7. Peer mocks are free and unlimited.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E6E6EF] bg-[#FBFBFD] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-brand text-base font-bold text-[#9A9AAE]">With a mentor</h2>
          </div>
          <p className="mt-1 text-sm text-[#9A9AAE]">Coming in Phase 7.</p>
        </div>
        <div className="rounded-xl border border-[#DDD9FB] bg-[#FBFAFF] p-5">
          <h2 className="font-brand text-base font-bold text-[#0F1020]">With a peer</h2>
          <p className="mt-1 text-sm text-[#55556B]">
            Paired with another student. You interview them, they interview you.
          </p>
          <div className="mt-3">
            <MockPoolStatus
              initialRequestId={active?.id ?? null}
              initialPaired={Boolean(active?.pairedWithId)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white">
        <div className="border-b border-[#EDEDF3] px-5 py-3.5">
          <h2 className="font-brand text-sm font-bold text-[#0F1020]">Past mocks</h2>
        </div>
        {feedbackReceived.length === 0 ? (
          <p className="px-5 py-4 text-sm text-[#8A8AA0]">No mocks completed yet.</p>
        ) : (
          <div className="divide-y divide-[#F2F2F7]">
            {feedbackReceived.map((fb) => (
              <div key={fb.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F1F0FE] font-brand text-sm font-bold text-indigo-600">
                  {fb.score}
                  <span className="text-[9px] font-normal text-[#9A9AAE]">/5</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F1020]">
                    Peer mock · anonymous
                  </p>
                  <p className="text-xs text-[#8A8AA0]">
                    {formatDate(fb.createdAt)} · &quot;{fb.quote}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
