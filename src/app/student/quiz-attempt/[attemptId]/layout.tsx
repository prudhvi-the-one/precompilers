export default function QuizAttemptLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
}
