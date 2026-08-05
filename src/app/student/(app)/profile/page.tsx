import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="rounded-lg border border-gray-200 p-6">
        <ProfileForm
          initialName={user.name ?? ""}
          initialCollege={user.college ?? ""}
          initialBranch={user.branch ?? ""}
          initialGradYear={user.gradYear}
        />
      </div>
    </div>
  );
}
