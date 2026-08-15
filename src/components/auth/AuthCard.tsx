import Logo from "@/components/Logo";

export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface-sunk px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Logo className="justify-center" />
          <div className="space-y-1">
            <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
              {title}
            </h1>
            {description ? (
              <p className="text-[14.5px] text-ink-faint">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
