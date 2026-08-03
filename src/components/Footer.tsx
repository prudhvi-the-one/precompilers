export default function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-black/50 dark:text-white/50 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} PreCompilers. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="mailto:hello@precompilers.com" className="hover:text-black dark:hover:text-white">
            hello@precompilers.com
          </a>
        </div>
      </div>
    </footer>
  );
}
