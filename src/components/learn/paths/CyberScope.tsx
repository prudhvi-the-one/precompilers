/**
 * AppShell's <main> already carries its own padding and background — this
 * bleeds the Learning Paths cyber theme full-bleed to the shell's edges by
 * negating that padding, then re-applies the same amount inside so content
 * lines up exactly as it would without this wrapper.
 */
export default function CyberScope({ children }: { children: React.ReactNode }) {
  return (
    <div className="learn-cyber -mx-4 -my-5 min-h-[calc(100vh-3.75rem)] sm:-mx-7 sm:-my-6.5">
      <div className="px-4 py-5 sm:px-7 sm:py-6.5">{children}</div>
    </div>
  );
}
