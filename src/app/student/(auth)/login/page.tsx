import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isPhoneLoginEnabled } from "@/lib/featureFlags";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "STUDENT") {
    redirect("/home");
  }

  return <LoginForm phoneLoginEnabled={isPhoneLoginEnabled()} />;
}
