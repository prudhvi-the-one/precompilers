import { Download } from "lucide-react";

export default function DownloadAffordance() {
  return (
    <span
      title="Offline download — coming soon"
      className="flex h-6 w-6 shrink-0 cursor-not-allowed items-center justify-center rounded text-[#C6C6D4]"
    >
      <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
    </span>
  );
}
