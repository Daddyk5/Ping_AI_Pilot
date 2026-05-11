import type { Metadata } from "next";
import { AppShell } from "@/components/shared/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "PING AI PILOT",
  description: "AI-powered network monitoring platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-black text-white"
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
