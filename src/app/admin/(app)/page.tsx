import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function AdminRootPage() {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY"]);
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/users");
  }
  if (user.role === "INSTITUTION_ADMIN") {
    redirect("/cohort");
  }
  redirect("/my-batch");
}
