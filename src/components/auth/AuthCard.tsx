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
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Logo className="justify-center" forceLight />
          <div className="space-y-1">
            <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
              {title}
            </h1>
            {description ? (
              <p className="text-[14.5px] text-gray-500">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
