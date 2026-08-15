export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Draft.</strong> This page describes what PreCompilers actually
        collects and why, in plain language. It has not yet been reviewed by
        a lawyer and should not be treated as final legal text.
      </div>

      <h1 className="font-brand text-[32px] font-bold tracking-[-0.02em] text-[#0F1020]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[#8A8AA0]">Last updated 15 Aug 2026</p>

      <div className="mt-8 space-y-8 text-[15px] leading-[1.7] text-[#2A2A38]">
        <section>
          <h2 className="font-brand text-lg font-bold text-[#0F1020]">
            What we collect
          </h2>
          <p className="mt-2">
            When you create an account: your name, email address, college,
            branch, graduation year, and target role. If you opt in to
            WhatsApp notifications, your phone number. Your password is
            stored as a one-way hash — we never store or can see your actual
            password.
          </p>
          <p className="mt-2">
            As you use the platform: quiz and coding submissions, peer
            reviews you give and receive, resume content you enter, mentor
            session scorecards and notes, and live-class/group-discussion
            attendance. If you take a proctored aptitude paper, we record
            video of the session (webcam only, no audio) and store it
            securely for mentor review.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-[#0F1020]">
            How we use it
          </h2>
          <p className="mt-2">
            To run the platform: authenticate you, track your progress,
            compute your readiness score, match you with mentors, and let
            institutions see cohort-level (not individual-message) progress
            for students they administer. We do not sell your data to third
            parties.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-[#0F1020]">
            Third parties we use
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Neon (Postgres database hosting)</li>
            <li>Vercel (application hosting)</li>
            <li>Resend (transactional email — OTP codes, notifications)</li>
            <li>Meta WhatsApp Cloud API (WhatsApp notifications, opt-in only)</li>
            <li>Daily.co (live class, mock interview, and group discussion video rooms)</li>
            <li>Cloudflare R2 (proctoring recording storage)</li>
            <li>Sentry (error monitoring, if configured)</li>
          </ul>
          <p className="mt-2">
            Each of these processes data only as needed to provide their
            specific service to us.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-[#0F1020]">
            Retention
          </h2>
          <p className="mt-2">
            Your account data is retained while your account is active.
            Proctoring recordings are retained for mentor review; a formal
            retention/deletion policy for these is still being finalized.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-[#0F1020]">
            Your rights
          </h2>
          <p className="mt-2">
            You can request a copy of your data or ask us to delete your
            account by emailing{" "}
            <a href="mailto:hello@precompilers.com" className="text-indigo-600 underline">
              hello@precompilers.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
