import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile/ProfileForm";
import ExternalJudgeLinkForm from "@/components/profile/ExternalJudgeLinkForm";
import VendorCertificateSection from "@/components/profile/VendorCertificateSection";
import { computeVendorCompletionPercent, parseCertificateCriteria } from "@/lib/vendorCompletion";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const externalAccount = user.vendorId
    ? await prisma.externalJudgeAccount.findUnique({
        where: { userId_platform: { userId: user.id, platform: "LEETCODE" } },
        select: { handle: true, verificationCode: true, trackingStatus: true },
      })
    : null;

  let certificateData: { completionPercent: number; minCompletionPercent: number | null; issued: boolean } | null =
    null;
  if (user.vendorId) {
    const [vendor, certificate, completionPercent] = await Promise.all([
      prisma.vendor.findUnique({ where: { id: user.vendorId }, select: { certificateCriteria: true } }),
      prisma.certificate.findUnique({
        where: { userId_vendorId: { userId: user.id, vendorId: user.vendorId } },
      }),
      computeVendorCompletionPercent(user.vendorId, user.id),
    ]);
    const criteria = vendor ? parseCertificateCriteria(vendor.certificateCriteria) : null;
    certificateData = {
      completionPercent,
      minCompletionPercent: criteria?.minCompletionPercent ?? null,
      issued: Boolean(certificate),
    };
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Profile
        </h1>
        <p className="text-[14.5px] text-ink-muted">{user.email}</p>
      </div>
      <div className="rounded-xl border border-line bg-surface p-6">
        <ProfileForm
          initialName={user.name ?? ""}
          initialCollege={user.college ?? ""}
          initialBranch={user.branch ?? ""}
          initialGradYear={user.gradYear}
          initialCgpa={user.cgpa}
          initialBacklogCount={user.backlogCount}
          initialPhoneNumber={user.phoneNumber ?? ""}
          initialWhatsappOptIn={user.whatsappOptIn}
        />
      </div>
      {user.vendorId ? (
        <div className="rounded-xl border border-line bg-surface p-6">
          <h2 className="mb-1 font-brand text-base font-bold text-ink">LeetCode account</h2>
          <p className="mb-3 text-xs text-ink-faint">
            Link your LeetCode account so solved problems count toward your assigned assessments.
          </p>
          <ExternalJudgeLinkForm initialAccount={externalAccount} />
        </div>
      ) : null}
      {certificateData ? (
        <VendorCertificateSection
          completionPercent={certificateData.completionPercent}
          minCompletionPercent={certificateData.minCompletionPercent}
          initialIssued={certificateData.issued}
        />
      ) : null}
    </div>
  );
}
