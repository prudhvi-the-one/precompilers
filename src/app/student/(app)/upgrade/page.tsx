import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getActiveSubscription } from "@/lib/tier";
import UpgradeTiers from "@/components/subscriptions/UpgradeTiers";

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const activeSubscription =
    user.entitlement === "INSTITUTION" ? null : await getActiveSubscription(user.id);

  return (
    <div className="max-w-4xl">
      <h1 className="font-brand text-[28px] font-bold text-ink">
        Choose your plan
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Every tier builds on the one before it. Cancel or switch anytime by
        letting your current term run out and choosing a different one.
      </p>

      {user.entitlement === "INSTITUTION" ? (
        <div className="mt-6 rounded-xl border border-line bg-[#FBFBFE] p-6 text-sm text-ink-muted">
          Your account already has full access through your institution — no
          subscription needed.
        </div>
      ) : (
        <div className="mt-6">
          <UpgradeTiers
            activeTier={activeSubscription?.tier ?? null}
            userName={user.name}
            userEmail={user.email}
          />
        </div>
      )}
    </div>
  );
}
