import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <OnboardingForm
      initialGradYear={user.gradYear}
      initialWeeklyHours={user.weeklyHours}
    />
  );
}
