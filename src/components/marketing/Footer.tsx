export default function Footer() {
  return (
    <footer className="border-t border-line-soft px-12 py-6.5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-ink-faint sm:flex-row">
        <p>&copy; {new Date().getFullYear()} PreCompilers</p>
        <div className="flex items-center gap-5">
          <a href="/privacy" className="hover:text-ink">
            Privacy
          </a>
          <a href="/terms" className="hover:text-ink">
            Terms
          </a>
          <a
            href="mailto:hello@precompilers.com"
            className="hover:text-ink"
          >
            hello@precompilers.com
          </a>
        </div>
      </div>
    </footer>
  );
}
