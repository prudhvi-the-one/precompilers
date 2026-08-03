type PortalPlaceholderProps = {
  title: string;
  description: string;
};

export default function PortalPlaceholder({
  title,
  description,
}: PortalPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="max-w-md text-sm text-gray-500">{description}</p>
    </div>
  );
}
