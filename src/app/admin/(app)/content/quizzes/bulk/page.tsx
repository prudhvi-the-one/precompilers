import { requireRole } from "@/lib/session";
import BulkContentUploadForm from "@/components/admin/BulkContentUploadForm";

export default async function BulkImportQuizzesPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Bulk import quizzes
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Upload a .csv or .xlsx file to create several quizzes at once. Each row is one question
          with its four options — rows sharing the same quiz title and section name are grouped
          into that quiz&apos;s section. Imported quizzes publish immediately, same as a single
          hand-created quiz.
        </p>
      </div>
      <a href="/samples/quizzes-sample.csv" className="text-sm font-medium text-accent">
        Download sample CSV
      </a>
      <div className="rounded-xl border border-line bg-surface p-4">
        <BulkContentUploadForm endpoint="/api/admin/quizzes/bulk" submitLabel="Upload quizzes" />
      </div>
    </div>
  );
}
