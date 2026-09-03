"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink-faint focus:outline-none focus:ring-1 focus:ring-line";
const labelClass = "mb-1 block text-sm font-medium text-ink-secondary";

export default function EditStudentForm({
  userId,
  initialName,
  initialEmail,
  initialCollege,
  initialBranch,
  initialGradYear,
  initialCgpa,
  initialBacklogCount,
  initialPhoneNumber,
  initialWhatsappOptIn,
  initialVendorId,
  initialWeeklyHours,
  initialTargetRole,
  initialRollNumber,
  vendorOptions,
}: {
  userId: string;
  initialName: string;
  initialEmail: string;
  initialCollege: string;
  initialBranch: string;
  initialGradYear: number | null;
  initialCgpa: number | null;
  initialBacklogCount: number | null;
  initialPhoneNumber: string;
  initialWhatsappOptIn: boolean;
  initialVendorId: string;
  initialWeeklyHours: string;
  initialTargetRole: string;
  initialRollNumber: string;
  vendorOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [college, setCollege] = useState(initialCollege);
  const [branch, setBranch] = useState(initialBranch);
  const [gradYear, setGradYear] = useState(initialGradYear ? String(initialGradYear) : "");
  const [cgpa, setCgpa] = useState(initialCgpa !== null ? String(initialCgpa) : "");
  const [backlogCount, setBacklogCount] = useState(
    initialBacklogCount !== null ? String(initialBacklogCount) : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [whatsappOptIn, setWhatsappOptIn] = useState(initialWhatsappOptIn);
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [weeklyHours, setWeeklyHours] = useState(initialWeeklyHours);
  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [rollNumber, setRollNumber] = useState(initialRollNumber);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        college: college || null,
        branch: branch || null,
        gradYear: gradYear ? Number(gradYear) : null,
        cgpa: cgpa ? Number(cgpa) : null,
        backlogCount: backlogCount ? Number(backlogCount) : null,
        phoneNumber: phoneNumber.trim() || null,
        whatsappOptIn,
        vendorId: vendorId || null,
        weeklyHours: weeklyHours || null,
        targetRole: targetRole || null,
        rollNumber: rollNumber.trim() || null,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Something went wrong");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="name">Full name</label>
        <input id="name" type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="college">College</label>
        <input id="college" type="text" className={inputClass} value={college} onChange={(e) => setCollege(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="branch">Branch</label>
        <input id="branch" type="text" className={inputClass} value={branch} onChange={(e) => setBranch(e.target.value)} />
      </div>
      <div>
        <label className={labelClass} htmlFor="rollNumber">Roll number</label>
        <input id="rollNumber" type="text" className={inputClass} value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="gradYear">Graduation year</label>
          <input id="gradYear" type="number" className={inputClass} value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="cgpa">CGPA</label>
          <input id="cgpa" type="number" min="0" max="10" step="0.01" className={inputClass} value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="backlogCount">Backlogs</label>
          <input id="backlogCount" type="number" min="0" step="1" className={inputClass} value={backlogCount} onChange={(e) => setBacklogCount(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phoneNumber">Phone number</label>
          <input id="phoneNumber" type="tel" className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="weeklyHours">Weekly hours available</label>
          <input id="weeklyHours" type="text" className={inputClass} value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="targetRole">Target role</label>
          <select id="targetRole" className={inputClass} value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option value="">Not set</option>
            <option value="SOFTWARE_ENGINEER">Software engineer</option>
            <option value="DATA_ML_ENGINEER">Data / ML engineer</option>
            <option value="FRONTEND_ENGINEER">Frontend engineer</option>
            <option value="CLOUD_DEVOPS">Cloud / DevOps</option>
            <option value="HIGHER_STUDIES">Higher studies</option>
            <option value="NOT_SURE">Not sure</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="vendorId">Vendor</label>
        <select id="vendorId" className={inputClass} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">None (organic / institution student)</option>
          {vendorOptions.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input id="whatsappOptIn" type="checkbox" checked={whatsappOptIn} onChange={(e) => setWhatsappOptIn(e.target.checked)} />
        <label htmlFor="whatsappOptIn" className="text-sm text-ink-secondary">WhatsApp notifications enabled</label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status === "saved" ? <p className="text-sm text-green-700">Saved.</p> : null}
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
