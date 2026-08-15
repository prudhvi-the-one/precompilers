export default function PublicReportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-screen flex-1 flex-col bg-surface-sunk">{children}</div>;
}
