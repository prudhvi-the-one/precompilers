import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "./LoginForm";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN", "FACULTY"];

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && ALLOWED_ROLES.includes(user.role)) {
    redirect("/");
  }

  return <LoginForm />;
}
