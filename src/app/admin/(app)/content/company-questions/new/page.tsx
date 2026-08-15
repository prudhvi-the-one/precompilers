import { requireRole } from "@/lib/session";
import CompanyQuestionForm from "@/components/mentor/CompanyQuestionForm";

export default async function NewAdminCompanyQuestionPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
        New company question
      </h1>
      <CompanyQuestionForm mode="create" variant="admin" />
    </div>
  );
}
