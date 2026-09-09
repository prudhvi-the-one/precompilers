import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function AdminRootPage() {
  const user = await requireRole([
    "ADMIN",
    "SUPER_ADMIN",
    "INSTITUTION_ADMIN",
    "VENDOR_ADMIN",
    "FACULTY",
  ]);
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/users");
  }
  if (user.role === "INSTITUTION_ADMIN") {
    redirect("/cohort");
  }
  if (user.role === "VENDOR_ADMIN") {
    redirect("/vendor-dashboard");
  }
  redirect("/my-batch");
}
