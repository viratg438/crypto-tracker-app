import Header from "@/components/Header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="w-full relative flex flex-col min-h-screen">
        <div>{children}</div>
      </main>
    </>
  );
}
