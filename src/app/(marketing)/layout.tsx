import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="bg-grain" />
      <Nav />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
