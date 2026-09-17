import { requireRole } from "@/lib/session";
import BulkContentUploadForm from "@/components/admin/BulkContentUploadForm";

export default async function BulkImportProblemsPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Bulk import problems
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Upload a .csv or .xlsx file to create several problems at once. Every imported problem
          lands as a draft — verify and publish each one from the Problems tab afterward using
          &quot;Try publish&quot;, same as a single hand-created problem.
        </p>
      </div>
      <a href="/samples/problems-sample.csv" className="text-sm font-medium text-accent">
        Download sample CSV
      </a>
      <div className="rounded-xl border border-line bg-surface p-4">
        <BulkContentUploadForm endpoint="/api/admin/problems/bulk" submitLabel="Upload problems" />
      </div>
    </div>
  );
}
