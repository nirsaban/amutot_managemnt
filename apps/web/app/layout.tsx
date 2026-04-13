import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nachalat David",
  description: "Production-ready foundation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
      </body>
    </html>
  );
}

