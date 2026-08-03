import WaitlistForm from "./WaitlistForm";

export default function WaitlistCta() {
  return (
    <section id="waitlist" className="px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-black/5 bg-gradient-to-b from-indigo-50 to-white px-8 py-16 text-center shadow-sm dark:border-white/10 dark:from-indigo-500/10 dark:to-transparent">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Be first to get on PreCompilers
        </h2>
        <p className="mt-4 max-w-xl text-black/60 dark:text-white/60">
          We&apos;re rolling out access in batches. Drop your email and we&apos;ll let
          you know the moment your spot opens up.
        </p>

        <div className="mt-8 flex w-full justify-center">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
