import { requireRole } from "@/lib/session";
import BulkContentUploadForm from "@/components/admin/BulkContentUploadForm";

export default async function BulkImportCompanyQuestionsPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Bulk import company questions
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Upload a .csv or .xlsx file to create several company questions at once. Imported
          questions publish immediately, same as a single hand-created question.
        </p>
      </div>
      <a href="/samples/company-questions-sample.csv" className="text-sm font-medium text-accent">
        Download sample CSV
      </a>
      <div className="rounded-xl border border-line bg-surface p-4">
        <BulkContentUploadForm
          endpoint="/api/admin/company-questions/bulk"
          submitLabel="Upload questions"
        />
      </div>
    </div>
  );
}
