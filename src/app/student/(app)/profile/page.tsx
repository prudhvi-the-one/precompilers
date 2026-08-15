import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Profile
        </h1>
        <p className="text-[14.5px] text-[#55556B]">{user.email}</p>
      </div>
      <div className="rounded-xl border border-[#E6E6EF] bg-white p-6">
        <ProfileForm
          initialName={user.name ?? ""}
          initialCollege={user.college ?? ""}
          initialBranch={user.branch ?? ""}
          initialGradYear={user.gradYear}
          initialPhoneNumber={user.phoneNumber ?? ""}
          initialWhatsappOptIn={user.whatsappOptIn}
        />
      </div>
    </div>
  );
}
