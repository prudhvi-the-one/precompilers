export default function MentorSessionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#0F1020]">
      {children}
    </div>
  );
}
