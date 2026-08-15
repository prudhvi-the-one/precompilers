import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function MentorLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "MENTOR") {
    redirect("/");
  }

  return <LoginForm />;
}
