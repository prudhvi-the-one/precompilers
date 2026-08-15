export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Draft.</strong> Standard, honest boilerplate terms — not yet
        reviewed by a lawyer. Treat as a placeholder, not final legal text.
      </div>

      <h1 className="font-brand text-[32px] font-bold tracking-[-0.02em] text-ink">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-ink-faint">Last updated 15 Aug 2026</p>

      <div className="mt-8 space-y-8 text-[15px] leading-[1.7] text-ink-secondary">
        <section>
          <h2 className="font-brand text-lg font-bold text-ink">
            Using PreCompilers
          </h2>
          <p className="mt-2">
            PreCompilers is a job-readiness platform for CSE/AIML students —
            live classes, practice problems, quizzes, peer review, mock
            interviews, and mentor-led sessions. By creating an account you
            agree to use it for your own learning and interview preparation,
            not to resell access or share your login with others.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-ink">
            Accounts
          </h2>
          <p className="mt-2">
            You&apos;re responsible for keeping your password confidential and
            for activity under your account. Mentor and institution-admin
            accounts are provisioned directly by PreCompilers staff, not
            self-registered.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-ink">
            Content you submit
          </h2>
          <p className="mt-2">
            Code, resumes, project submissions, and peer reviews you submit
            remain yours. You grant us permission to store and display them
            back to you and to relevant mentors/reviewers as part of running
            the platform.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-ink">
            Platform is evolving
          </h2>
          <p className="mt-2">
            PreCompilers is in active development. Features, pricing, and
            plan availability may change; we&apos;ll do our best to communicate
            material changes to active users in advance.
          </p>
        </section>

        <section>
          <h2 className="font-brand text-lg font-bold text-ink">
            Contact
          </h2>
          <p className="mt-2">
            Questions about these terms:{" "}
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
