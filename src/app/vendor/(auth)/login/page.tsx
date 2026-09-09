import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function VendorLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "VENDOR_ADMIN") {
    redirect("/");
  }

  return <LoginForm />;
}
